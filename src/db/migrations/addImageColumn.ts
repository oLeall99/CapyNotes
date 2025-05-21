import { SQLiteDatabase } from "expo-sqlite";

export async function addImageColumn(db: SQLiteDatabase): Promise<void> {
  try {
    // Verificar se a coluna imagem já existe na tabela notes
    const tableInfo = await db.getAllAsync(
      "PRAGMA table_info(notes)"
    );
    
    // Procurar pela coluna imagem no resultado
    const imageColumnExists = tableInfo.some(
      (column: any) => column.name === 'imagem'
    );
    
    // Se a coluna não existir, adicioná-la
    if (!imageColumnExists) {
      console.log("Adicionando coluna 'imagem' à tabela notes...");
      await db.execAsync(
        "ALTER TABLE notes ADD COLUMN imagem TEXT"
      );
      console.log("Coluna 'imagem' adicionada com sucesso!");
    } else {
      console.log("A coluna 'imagem' já existe na tabela notes.");
    }
  } catch (error) {
    console.error("Erro ao adicionar coluna 'imagem':", error);
    throw error;
  }
} 