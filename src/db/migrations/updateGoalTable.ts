import { SQLiteDatabase } from "expo-sqlite";

export async function updateGoalTable(db: SQLiteDatabase): Promise<void> {
  try {
    // Obter informações da tabela
    const tableInfo = await db.getAllAsync("PRAGMA table_info(goals)");
    
    // Verificar se a tabela existe
    const tableExists = tableInfo.length > 0;
    
    if (!tableExists) {
      console.log("Tabela goals não existe, será criada pelo script de inicialização");
      return;
    }
    
    // Mapear nomes das colunas existentes
    const columnNames = tableInfo.map((column: any) => column.name);
    
    // Verificar e atualizar colunas se necessário
    const columnsToCheck = [
      { oldName: 'initial_value', newName: 'valorInicial' },
      { oldName: 'current_value', newName: 'valorAtual' },
      { oldName: 'finish_value', newName: 'valorFinal' },
      { oldName: 'type', newName: 'tipo' }
    ];
    
    // Verificar se precisamos migrar a tabela antiga para a nova estrutura
    const needsMigration = columnsToCheck.some(col => 
      columnNames.includes(col.oldName) && !columnNames.includes(col.newName)
    );
    
    if (needsMigration) {
      console.log("Migrando tabela goals para nova estrutura...");
      
      // Criar tabela temporária com a nova estrutura
      await db.execAsync(`
        CREATE TABLE goals_temp (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          titulo TEXT NOT NULL,
          descricao TEXT,
          valorInicial REAL NOT NULL,
          valorAtual REAL NOT NULL,
          valorFinal REAL NOT NULL,
          tipo TEXT CHECK(tipo IN ('inteiro', 'dinheiro')) NOT NULL,
          isFavorite INTEGER NOT NULL DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Migrar dados da tabela antiga para a nova
        INSERT INTO goals_temp (
          id, titulo, descricao, valorInicial, valorAtual, valorFinal, 
          tipo, isFavorite, createdAt, updatedAt
        )
        SELECT 
          id, titulo, descricao, 
          initial_value as valorInicial, 
          current_value as valorAtual, 
          finish_value as valorFinal,
          CASE 
            WHEN type = '$' THEN 'dinheiro'
            WHEN type = 'int' THEN 'inteiro'
            ELSE 'inteiro'
          END as tipo,
          isFavorite,
          createdAt,
          updatedAt
        FROM goals;
        
        -- Remover tabela antiga
        DROP TABLE goals;
        
        -- Renomear tabela temporária
        ALTER TABLE goals_temp RENAME TO goals;
      `);
      
      console.log("Migração da tabela goals concluída com sucesso!");
    } else if (columnNames.includes('valorInicial')) {
      console.log("Tabela goals já está na estrutura atualizada.");
    }
  } catch (error) {
    console.error("Erro ao migrar tabela goals:", error);
    throw error;
  }
} 