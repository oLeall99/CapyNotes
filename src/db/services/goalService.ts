import { SQLiteDatabase } from "expo-sqlite";

export interface Goal {
  id?: number;
  titulo: string;
  descricao?: string;
  valorInicial: number;
  valorAtual: number;
  valorFinal: number;
  tipo: 'inteiro' | 'dinheiro';
  isFavorite?: number;
  createdAt?: string;
  updatedAt?: string;
}

export class GoalService {
  constructor(private db: SQLiteDatabase) {}

  // Criar uma nova meta
  async createGoal(goal: Goal): Promise<number> {
    try {
      const result = await this.db.runAsync(
        `INSERT INTO goals (titulo, descricao, valorInicial, valorAtual, valorFinal, tipo, isFavorite) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          goal.titulo,
          goal.descricao || '',
          goal.valorInicial,
          goal.valorAtual,
          goal.valorFinal,
          goal.tipo,
          goal.isFavorite || 0
        ]
      );
      
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      throw error;
    }
  }

  // Obter todas as metas
  async getAllGoals(): Promise<Goal[]> {
    try {
      const result = await this.db.getAllAsync<Goal>(
        `SELECT * FROM goals ORDER BY updatedAt DESC`
      );
      
      return result;
    } catch (error) {
      console.error('Erro ao obter metas:', error);
      throw error;
    }
  }

  // Obter uma meta pelo ID
  async getGoalById(id: number): Promise<Goal | null> {
    try {
      const result = await this.db.getFirstAsync<Goal>(
        'SELECT * FROM goals WHERE id = ?',
        [id]
      );
      
      return result;
    } catch (error) {
      console.error(`Erro ao obter meta ID ${id}:`, error);
      throw error;
    }
  }

  // Atualizar uma meta
  async updateGoal(goal: Goal): Promise<void> {
    if (!goal.id) {
      throw new Error('ID da meta não fornecido para atualização');
    }

    try {
      await this.db.runAsync(
        `UPDATE goals 
         SET titulo = ?, descricao = ?, valorInicial = ?, valorAtual = ?, valorFinal = ?, 
         tipo = ?, isFavorite = ?, updatedAt = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [
          goal.titulo,
          goal.descricao || '',
          goal.valorInicial,
          goal.valorAtual,
          goal.valorFinal,
          goal.tipo,
          goal.isFavorite || 0,
          goal.id
        ]
      );
    } catch (error) {
      console.error(`Erro ao atualizar meta ID ${goal.id}:`, error);
      throw error;
    }
  }

  // Excluir uma meta
  async deleteGoal(id: number): Promise<void> {
    try {
      await this.db.runAsync('DELETE FROM goals WHERE id = ?', [id]);
    } catch (error) {
      console.error(`Erro ao excluir meta ID ${id}:`, error);
      throw error;
    }
  }

  // Favoritar/Desfavoritar uma meta
  async toggleFavorite(id: number): Promise<void> {
    try {
      await this.db.runAsync(
        `UPDATE goals 
         SET isFavorite = CASE WHEN isFavorite = 0 THEN 1 ELSE 0 END,
         updatedAt = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [id]
      );
    } catch (error) {
      console.error(`Erro ao alternar favorito da meta ID ${id}:`, error);
      throw error;
    }
  }

  // Atualizar o valor atual de uma meta
  async updateCurrentValue(id: number, newValue: number): Promise<void> {
    try {
      await this.db.runAsync(
        `UPDATE goals 
         SET valorAtual = ?,
         updatedAt = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [newValue, id]
      );
    } catch (error) {
      console.error(`Erro ao atualizar valor atual da meta ID ${id}:`, error);
      throw error;
    }
  }

  // Buscar metas por título
  async searchGoalsByTitle(searchTerm: string): Promise<Goal[]> {
    try {
      const result = await this.db.getAllAsync<Goal>(
        `SELECT * FROM goals 
         WHERE titulo LIKE ? 
         ORDER BY updatedAt DESC`,
        [`%${searchTerm}%`]
      );
      
      return result;
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
      throw error;
    }
  }
} 