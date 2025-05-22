import { SQLiteDatabase } from "expo-sqlite";

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
}

export class TaskService {
  constructor(private db: SQLiteDatabase) {}

  // Criar uma nova tarefa
  async createTask(task: Task): Promise<number> {
    try {
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
      
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  }

  // Obter todas as tarefas
  async getAllTasks(): Promise<Task[]> {
    try {
      const result = await this.db.getAllAsync<Task>(
        `SELECT * FROM tasks ORDER BY updatedAt DESC`
      );
      
      return result;
    } catch (error) {
      console.error('Erro ao obter tarefas:', error);
      throw error;
    }
  }

  // Obter tarefas por status
  async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    try {
      const result = await this.db.getAllAsync<Task>(
        `SELECT * FROM tasks WHERE status = ? ORDER BY updatedAt DESC`,
        [status]
      );
      
      return result;
    } catch (error) {
      console.error(`Erro ao obter tarefas com status ${status}:`, error);
      throw error;
    }
  }

  // Obter uma tarefa pelo ID
  async getTaskById(id: number): Promise<Task | null> {
    try {
      const result = await this.db.getFirstAsync<Task>(
        'SELECT * FROM tasks WHERE id = ?',
        [id]
      );
      
      return result;
    } catch (error) {
      console.error(`Erro ao obter tarefa ID ${id}:`, error);
      throw error;
    }
  }

  // Atualizar uma tarefa
  async updateTask(task: Task): Promise<void> {
    if (!task.id) {
      throw new Error('ID da tarefa não fornecido para atualização');
    }

    try {
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
    } catch (error) {
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
      const result = await this.db.getAllAsync<Task>(
        `SELECT * FROM tasks 
         WHERE titulo LIKE ? 
         ORDER BY updatedAt DESC`,
        [`%${searchTerm}%`]
      );
      
      return result;
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      throw error;
    }
  }
} 