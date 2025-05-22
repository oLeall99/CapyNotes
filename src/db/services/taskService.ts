import { SQLiteDatabase } from "expo-sqlite";
import { Tag } from "./tagService";

export type TaskStatus = 'TO_DO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id?: number;
  titulo: string;
  descricao?: string;
  status?: TaskStatus;
  isFavorite?: number;
  createdAt?: string;
  updatedAt?: string;
  taskGroupId?: number | null;
  tags?: Tag[];
}

export class TaskService {
  constructor(private db: SQLiteDatabase) {}

  // Criar uma nova tarefa
  async createTask(task: Task): Promise<number> {
    try {
      // Iniciar transação
      await this.db.runAsync('BEGIN TRANSACTION');
      
      // Inserir tarefa
      const result = await this.db.runAsync(
        `INSERT INTO tasks (titulo, descricao, status, isFavorite, taskGroupId) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          task.titulo,
          task.descricao || '',
          task.status || 'TO_DO',
          task.isFavorite || 0,
          task.taskGroupId || null
        ]
      );
      
      const taskId = result.lastInsertRowId;
      
      // Adicionar tags à tarefa, se houver
      if (task.tags && task.tags.length > 0) {
        for (const tag of task.tags) {
          if (tag.id) {
            await this.db.runAsync(
              `INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)`,
              [taskId, tag.id]
            );
          }
        }
      }
      
      // Commit transação
      await this.db.runAsync('COMMIT');
      
      return taskId;
    } catch (error) {
      // Rollback em caso de erro
      await this.db.runAsync('ROLLBACK');
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  }

  // Obter todas as tarefas
  async getAllTasks(): Promise<Task[]> {
    try {
      const tasks = await this.db.getAllAsync<Task>(
        `SELECT * FROM tasks ORDER BY updatedAt DESC`
      );
      
      // Obter tags para cada tarefa
      for (const task of tasks) {
        if (task.id) {
          task.tags = await this.getTaskTagsById(task.id);
        }
      }
      
      return tasks;
    } catch (error) {
      console.error('Erro ao obter tarefas:', error);
      throw error;
    }
  }

  // Obter tarefas por status
  async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    try {
      const tasks = await this.db.getAllAsync<Task>(
        `SELECT * FROM tasks WHERE status = ? ORDER BY updatedAt DESC`,
        [status]
      );
      
      // Obter tags para cada tarefa
      for (const task of tasks) {
        if (task.id) {
          task.tags = await this.getTaskTagsById(task.id);
        }
      }
      
      return tasks;
    } catch (error) {
      console.error(`Erro ao obter tarefas com status ${status}:`, error);
      throw error;
    }
  }

  // Obter uma tarefa pelo ID
  async getTaskById(id: number): Promise<Task | null> {
    try {
      const task = await this.db.getFirstAsync<Task>(
        'SELECT * FROM tasks WHERE id = ?',
        [id]
      );
      
      if (task) {
        task.tags = await this.getTaskTagsById(id);
      }
      
      return task;
    } catch (error) {
      console.error(`Erro ao obter tarefa ID ${id}:`, error);
      throw error;
    }
  }

  // Obter tags de uma tarefa pelo ID
  async getTaskTagsById(taskId: number): Promise<Tag[]> {
    try {
      const tags = await this.db.getAllAsync<Tag>(
        `SELECT t.* FROM tags t
         INNER JOIN task_tags tt ON t.id = tt.tag_id
         WHERE tt.task_id = ?
         ORDER BY t.titulo ASC`,
        [taskId]
      );
      
      return tags;
    } catch (error) {
      console.error(`Erro ao obter tags da tarefa ID ${taskId}:`, error);
      throw error;
    }
  }

  // Atualizar uma tarefa
  async updateTask(task: Task): Promise<void> {
    if (!task.id) {
      throw new Error('ID da tarefa não fornecido para atualização');
    }

    try {
      // Iniciar transação
      await this.db.runAsync('BEGIN TRANSACTION');
      
      // Atualizar tarefa
      await this.db.runAsync(
        `UPDATE tasks 
         SET titulo = ?, descricao = ?, status = ?, isFavorite = ?, taskGroupId = ?, updatedAt = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [
          task.titulo,
          task.descricao || '',
          task.status || 'TO_DO',
          task.isFavorite || 0,
          task.taskGroupId || null,
          task.id
        ]
      );
      
      // Remover todas as tags associadas
      await this.db.runAsync(
        `DELETE FROM task_tags WHERE task_id = ?`,
        [task.id]
      );
      
      // Adicionar tags atualizadas
      if (task.tags && task.tags.length > 0) {
        for (const tag of task.tags) {
          if (tag.id) {
            await this.db.runAsync(
              `INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)`,
              [task.id, tag.id]
            );
          }
        }
      }
      
      // Commit transação
      await this.db.runAsync('COMMIT');
    } catch (error) {
      // Rollback em caso de erro
      await this.db.runAsync('ROLLBACK');
      console.error(`Erro ao atualizar tarefa ID ${task.id}:`, error);
      throw error;
    }
  }

  // Atualizar apenas o status de uma tarefa
  async updateTaskStatus(id: number, status: TaskStatus): Promise<void> {
    try {
      await this.db.runAsync(
        `UPDATE tasks 
         SET status = ?, updatedAt = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [status, id]
      );
    } catch (error) {
      console.error(`Erro ao atualizar status da tarefa ID ${id}:`, error);
      throw error;
    }
  }

  // Excluir uma tarefa
  async deleteTask(id: number): Promise<void> {
    try {
      // As associações com tags serão excluídas automaticamente pelo ON DELETE CASCADE
      await this.db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
    } catch (error) {
      console.error(`Erro ao excluir tarefa ID ${id}:`, error);
      throw error;
    }
  }

  // Favoritar/Desfavoritar uma tarefa
  async toggleFavorite(id: number): Promise<void> {
    try {
      await this.db.runAsync(
        `UPDATE tasks 
         SET isFavorite = CASE WHEN isFavorite = 0 THEN 1 ELSE 0 END,
         updatedAt = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [id]
      );
    } catch (error) {
      console.error(`Erro ao alternar favorito da tarefa ID ${id}:`, error);
      throw error;
    }
  }

  // Buscar tarefas por título
  async searchTasksByTitle(searchTerm: string): Promise<Task[]> {
    try {
      const tasks = await this.db.getAllAsync<Task>(
        `SELECT * FROM tasks 
         WHERE titulo LIKE ? 
         ORDER BY updatedAt DESC`,
        [`%${searchTerm}%`]
      );
      
      // Obter tags para cada tarefa
      for (const task of tasks) {
        if (task.id) {
          task.tags = await this.getTaskTagsById(task.id);
        }
      }
      
      return tasks;
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      throw error;
    }
  }

  // Buscar tarefas favoritadas
  async getFavoritedTasks(): Promise<Task[]> {
    try {
      const tasks = await this.db.getAllAsync<Task>(
        `SELECT * FROM tasks 
         WHERE isFavorite = 1
         ORDER BY updatedAt DESC`
      );
      
      // Obter tags para cada tarefa
      for (const task of tasks) {
        if (task.id) {
          task.tags = await this.getTaskTagsById(task.id);
        }
      }
      
      return tasks;
    } catch (error) {
      console.error('Erro ao buscar tarefas favoritadas:', error);
      throw error;
    }
  }
} 