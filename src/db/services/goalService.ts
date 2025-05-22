import { SQLiteDatabase } from "expo-sqlite";
import { Tag } from "./tagService";

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
  tags?: Tag[];
}

export class GoalService {
  constructor(private db: SQLiteDatabase) {}

  // Criar uma nova meta
  async createGoal(goal: Goal): Promise<number> {
    try {
      // Iniciar transação
      await this.db.runAsync('BEGIN TRANSACTION');
      
      // Inserir meta
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
      
      const goalId = result.lastInsertRowId;
      
      // Adicionar tags à meta, se houver
      if (goal.tags && goal.tags.length > 0) {
        for (const tag of goal.tags) {
          if (tag.id) {
            await this.db.runAsync(
              `INSERT INTO goal_tags (goal_id, tag_id) VALUES (?, ?)`,
              [goalId, tag.id]
            );
          }
        }
      }
      
      // Commit transação
      await this.db.runAsync('COMMIT');
      
      return goalId;
    } catch (error) {
      // Rollback em caso de erro
      await this.db.runAsync('ROLLBACK');
      console.error('Erro ao criar meta:', error);
      throw error;
    }
  }

  // Obter todas as metas
  async getAllGoals(): Promise<Goal[]> {
    try {
      const goals = await this.db.getAllAsync<Goal>(
        `SELECT * FROM goals ORDER BY updatedAt DESC`
      );
      
      // Obter tags para cada meta
      for (const goal of goals) {
        if (goal.id) {
          goal.tags = await this.getGoalTagsById(goal.id);
        }
      }
      
      return goals;
    } catch (error) {
      console.error('Erro ao obter metas:', error);
      throw error;
    }
  }

  // Obter uma meta pelo ID
  async getGoalById(id: number): Promise<Goal | null> {
    try {
      const goal = await this.db.getFirstAsync<Goal>(
        'SELECT * FROM goals WHERE id = ?',
        [id]
      );
      
      if (goal) {
        goal.tags = await this.getGoalTagsById(id);
      }
      
      return goal;
    } catch (error) {
      console.error(`Erro ao obter meta ID ${id}:`, error);
      throw error;
    }
  }

  // Obter tags de uma meta pelo ID
  async getGoalTagsById(goalId: number): Promise<Tag[]> {
    try {
      const tags = await this.db.getAllAsync<Tag>(
        `SELECT t.* FROM tags t
         INNER JOIN goal_tags gt ON t.id = gt.tag_id
         WHERE gt.goal_id = ?
         ORDER BY t.titulo ASC`,
        [goalId]
      );
      
      return tags;
    } catch (error) {
      console.error(`Erro ao obter tags da meta ID ${goalId}:`, error);
      throw error;
    }
  }

  // Atualizar uma meta
  async updateGoal(goal: Goal): Promise<void> {
    if (!goal.id) {
      throw new Error('ID da meta não fornecido para atualização');
    }

    try {
      // Iniciar transação
      await this.db.runAsync('BEGIN TRANSACTION');
      
      // Atualizar meta
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
      
      // Remover todas as tags associadas
      await this.db.runAsync(
        `DELETE FROM goal_tags WHERE goal_id = ?`,
        [goal.id]
      );
      
      // Adicionar tags atualizadas
      if (goal.tags && goal.tags.length > 0) {
        for (const tag of goal.tags) {
          if (tag.id) {
            await this.db.runAsync(
              `INSERT INTO goal_tags (goal_id, tag_id) VALUES (?, ?)`,
              [goal.id, tag.id]
            );
          }
        }
      }
      
      // Commit transação
      await this.db.runAsync('COMMIT');
    } catch (error) {
      // Rollback em caso de erro
      await this.db.runAsync('ROLLBACK');
      console.error(`Erro ao atualizar meta ID ${goal.id}:`, error);
      throw error;
    }
  }

  // Excluir uma meta
  async deleteGoal(id: number): Promise<void> {
    try {
      // As associações com tags serão excluídas automaticamente pelo ON DELETE CASCADE
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
      const goals = await this.db.getAllAsync<Goal>(
        `SELECT * FROM goals 
         WHERE titulo LIKE ? 
         ORDER BY updatedAt DESC`,
        [`%${searchTerm}%`]
      );
      
      // Obter tags para cada meta
      for (const goal of goals) {
        if (goal.id) {
          goal.tags = await this.getGoalTagsById(goal.id);
        }
      }
      
      return goals;
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
      throw error;
    }
  }

  // Buscar metas favoritadas
  async getFavoritedGoals(): Promise<Goal[]> {
    try {
      const goals = await this.db.getAllAsync<Goal>(
        `SELECT * FROM goals 
         WHERE isFavorite = 1
         ORDER BY updatedAt DESC`
      );
      
      // Obter tags para cada meta
      for (const goal of goals) {
        if (goal.id) {
          goal.tags = await this.getGoalTagsById(goal.id);
        }
      }
      
      return goals;
    } catch (error) {
      console.error('Erro ao buscar metas favoritadas:', error);
      throw error;
    }
  }
} 