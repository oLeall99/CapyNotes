import { SQLiteDatabase } from "expo-sqlite";

export interface Tag {
  id?: number;
  titulo: string;
  color?: string;
  descricao?: string;
}

export class TagService {
  constructor(private db: SQLiteDatabase) {}

  // Criar uma nova tag
  async createTag(tag: Tag): Promise<number> {
    try {
      const result = await this.db.runAsync(
        `INSERT INTO tags (titulo, color, descricao) 
         VALUES (?, ?, ?)`,
        [
          tag.titulo,
          tag.color || '#808080', // Default gray color
          tag.descricao || ''
        ]
      );
      
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Erro ao criar tag:', error);
      throw error;
    }
  }

  // Obter todas as tags
  async getAllTags(): Promise<Tag[]> {
    try {
      const result = await this.db.getAllAsync<Tag>(
        `SELECT * FROM tags ORDER BY titulo ASC`
      );
      
      return result;
    } catch (error) {
      console.error('Erro ao obter tags:', error);
      throw error;
    }
  }

  // Obter uma tag pelo ID
  async getTagById(id: number): Promise<Tag | null> {
    try {
      const result = await this.db.getFirstAsync<Tag>(
        'SELECT * FROM tags WHERE id = ?',
        [id]
      );
      
      return result;
    } catch (error) {
      console.error(`Erro ao obter tag ID ${id}:`, error);
      throw error;
    }
  }

  // Atualizar uma tag
  async updateTag(tag: Tag): Promise<void> {
    if (!tag.id) {
      throw new Error('ID da tag não fornecido para atualização');
    }

    try {
      await this.db.runAsync(
        `UPDATE tags 
         SET titulo = ?, color = ?, descricao = ? 
         WHERE id = ?`,
        [
          tag.titulo,
          tag.color || '#808080',
          tag.descricao || '',
          tag.id
        ]
      );
    } catch (error) {
      console.error(`Erro ao atualizar tag ID ${tag.id}:`, error);
      throw error;
    }
  }

  // Excluir uma tag
  async deleteTag(id: number): Promise<void> {
    try {
      await this.db.runAsync('DELETE FROM tags WHERE id = ?', [id]);
    } catch (error) {
      console.error(`Erro ao excluir tag ID ${id}:`, error);
      throw error;
    }
  }

  // Buscar tags por título
  async searchTagsByTitle(searchTerm: string): Promise<Tag[]> {
    try {
      const result = await this.db.getAllAsync<Tag>(
        `SELECT * FROM tags 
         WHERE titulo LIKE ? 
         ORDER BY titulo ASC`,
        [`%${searchTerm}%`]
      );
      
      return result;
    } catch (error) {
      console.error('Erro ao buscar tags:', error);
      throw error;
    }
  }
} 