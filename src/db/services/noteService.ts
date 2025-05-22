import { SQLiteDatabase } from "expo-sqlite";

export interface Note {
  id?: number;
  titulo: string;
  conteudo?: string;
  imagem?: string | null;
  isFavorite?: number;
  createdAt?: string;
  updatedAt?: string;
}

export class NoteService {
  constructor(private db: SQLiteDatabase) {}

  // Criar uma nova nota
  async createNote(note: Note): Promise<number> {
    try {
      const result = await this.db.runAsync(
        `INSERT INTO notes (titulo, conteudo, imagem, isFavorite) 
         VALUES (?, ?, ?, ?)`,
        [
          note.titulo,
          note.conteudo || '',
          note.imagem || null,
          note.isFavorite || 0
        ]
      );
      
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Erro ao criar nota:', error);
      throw error;
    }
  }

  // Obter todas as notas
  async getAllNotes(): Promise<Note[]> {
    try {
      const result = await this.db.getAllAsync<Note>(
        `SELECT * FROM notes ORDER BY updatedAt DESC`
      );
      
      return result;
    } catch (error) {
      console.error('Erro ao obter notas:', error);
      throw error;
    }
  }

  // Obter uma nota pelo ID
  async getNoteById(id: number): Promise<Note | null> {
    try {
      const result = await this.db.getFirstAsync<Note>(
        'SELECT * FROM notes WHERE id = ?',
        [id]
      );
      
      return result;
    } catch (error) {
      console.error(`Erro ao obter nota ID ${id}:`, error);
      throw error;
    }
  }

  // Atualizar uma nota
  async updateNote(note: Note): Promise<void> {
    if (!note.id) {
      throw new Error('ID da nota não fornecido para atualização');
    }

    try {
      await this.db.runAsync(
        `UPDATE notes 
         SET titulo = ?, conteudo = ?, imagem = ?, isFavorite = ?, updatedAt = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [
          note.titulo,
          note.conteudo || '',
          note.imagem || null,
          note.isFavorite || 0,
          note.id
        ]
      );
    } catch (error) {
      console.error(`Erro ao atualizar nota ID ${note.id}:`, error);
      throw error;
    }
  }

  // Excluir uma nota
  async deleteNote(id: number): Promise<void> {
    try {
      await this.db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
    } catch (error) {
      console.error(`Erro ao excluir nota ID ${id}:`, error);
      throw error;
    }
  }

  // Favoritar/Desfavoritar uma nota
  async toggleFavorite(id: number): Promise<void> {
    try {
      await this.db.runAsync(
        `UPDATE notes 
         SET isFavorite = CASE WHEN isFavorite = 0 THEN 1 ELSE 0 END,
         updatedAt = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [id]
      );
    } catch (error) {
      console.error(`Erro ao alternar favorito da nota ID ${id}:`, error);
      throw error;
    }
  }

  // Buscar notas por título
  async searchNotesByTitle(searchTerm: string): Promise<Note[]> {
    try {
      const result = await this.db.getAllAsync<Note>(
        `SELECT * FROM notes 
         WHERE titulo LIKE ? 
         ORDER BY updatedAt DESC`,
        [`%${searchTerm}%`]
      );
      
      return result;
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
      throw error;
    }
  }
} 