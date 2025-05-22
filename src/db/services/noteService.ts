import { SQLiteDatabase } from "expo-sqlite";
import { Tag } from "./tagService";

export interface Note {
  id?: number;
  titulo: string;
  conteudo?: string;
  imagem?: string | null;
  isFavorite?: number;
  createdAt?: string;
  updatedAt?: string;
  tags?: Tag[];
}

export class NoteService {
  constructor(private db: SQLiteDatabase) {}

  // Criar uma nova nota
  async createNote(note: Note): Promise<number> {
    try {
      // Iniciar transação
      await this.db.runAsync('BEGIN TRANSACTION');
      
      // Inserir nota
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
      
      const noteId = result.lastInsertRowId;
      
      // Adicionar tags à nota, se houver
      if (note.tags && note.tags.length > 0) {
        for (const tag of note.tags) {
          if (tag.id) {
            await this.db.runAsync(
              `INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)`,
              [noteId, tag.id]
            );
          }
        }
      }
      
      // Commit transação
      await this.db.runAsync('COMMIT');
      
      return noteId;
    } catch (error) {
      // Rollback em caso de erro
      await this.db.runAsync('ROLLBACK');
      console.error('Erro ao criar nota:', error);
      throw error;
    }
  }

  // Obter todas as notas
  async getAllNotes(): Promise<Note[]> {
    try {
      const notes = await this.db.getAllAsync<Note>(
        `SELECT * FROM notes ORDER BY updatedAt DESC`
      );
      
      // Obter tags para cada nota
      for (const note of notes) {
        if (note.id) {
          note.tags = await this.getNoteTagsById(note.id);
        }
      }
      
      return notes;
    } catch (error) {
      console.error('Erro ao obter notas:', error);
      throw error;
    }
  }

  // Obter uma nota pelo ID
  async getNoteById(id: number): Promise<Note | null> {
    try {
      const note = await this.db.getFirstAsync<Note>(
        'SELECT * FROM notes WHERE id = ?',
        [id]
      );
      
      if (note) {
        note.tags = await this.getNoteTagsById(id);
      }
      
      return note;
    } catch (error) {
      console.error(`Erro ao obter nota ID ${id}:`, error);
      throw error;
    }
  }

  // Obter tags de uma nota pelo ID
  async getNoteTagsById(noteId: number): Promise<Tag[]> {
    try {
      const tags = await this.db.getAllAsync<Tag>(
        `SELECT t.* FROM tags t
         INNER JOIN note_tags nt ON t.id = nt.tag_id
         WHERE nt.note_id = ?
         ORDER BY t.titulo ASC`,
        [noteId]
      );
      
      return tags;
    } catch (error) {
      console.error(`Erro ao obter tags da nota ID ${noteId}:`, error);
      throw error;
    }
  }

  // Atualizar uma nota
  async updateNote(note: Note): Promise<void> {
    if (!note.id) {
      throw new Error('ID da nota não fornecido para atualização');
    }

    try {
      // Iniciar transação
      await this.db.runAsync('BEGIN TRANSACTION');
      
      // Atualizar nota
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
      
      // Remover todas as tags associadas
      await this.db.runAsync(
        `DELETE FROM note_tags WHERE note_id = ?`,
        [note.id]
      );
      
      // Adicionar tags atualizadas
      if (note.tags && note.tags.length > 0) {
        for (const tag of note.tags) {
          if (tag.id) {
            await this.db.runAsync(
              `INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)`,
              [note.id, tag.id]
            );
          }
        }
      }
      
      // Commit transação
      await this.db.runAsync('COMMIT');
    } catch (error) {
      // Rollback em caso de erro
      await this.db.runAsync('ROLLBACK');
      console.error(`Erro ao atualizar nota ID ${note.id}:`, error);
      throw error;
    }
  }

  // Excluir uma nota
  async deleteNote(id: number): Promise<void> {
    try {
      // As associações com tags serão excluídas automaticamente pelo ON DELETE CASCADE
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
      const notes = await this.db.getAllAsync<Note>(
        `SELECT * FROM notes 
         WHERE titulo LIKE ? 
         ORDER BY updatedAt DESC`,
        [`%${searchTerm}%`]
      );
      
      // Obter tags para cada nota
      for (const note of notes) {
        if (note.id) {
          note.tags = await this.getNoteTagsById(note.id);
        }
      }
      
      return notes;
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
      throw error;
    }
  }

  // Buscar notas favoritadas
  async getFavoritedNotes(): Promise<Note[]> {
    try {
      const notes = await this.db.getAllAsync<Note>(
        `SELECT * FROM notes 
         WHERE isFavorite = 1
         ORDER BY updatedAt DESC`
      );
      
      // Obter tags para cada nota
      for (const note of notes) {
        if (note.id) {
          note.tags = await this.getNoteTagsById(note.id);
        }
      }
      
      return notes;
    } catch (error) {
      console.error('Erro ao buscar notas favoritadas:', error);
      throw error;
    }
  }
} 