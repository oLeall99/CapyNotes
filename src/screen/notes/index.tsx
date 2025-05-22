import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { Note, NoteService } from '../../db/services/noteService';
import ConfirmationModal from '../../components/ConfirmationModal';
import NoteDetailModal from '../../components/NoteDetailModal';
import NoteFormModal from '../../components/NoteFormModal';
import SearchBar from '../../components/search';
import { Tag } from '../../db/services/tagService';

interface NotesProps {
  initialViewNoteId?: number;
}

const Notes: React.FC<NotesProps> = ({ initialViewNoteId }) => {
  const db = useSQLiteContext();
  const noteService = new NoteService(db);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        // carregar as notas
        await loadNotes();
        
        // Se foi fornecido um ID inicial para visualizar, buscar e mostrar essa nota
        if (initialViewNoteId) {
          await showInitialNote(initialViewNoteId);
        }
      } catch (error) {
        console.error('Erro ao inicializar:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, [initialViewNoteId]);

  const showInitialNote = async (noteId: number) => {
    try {
      const note = await noteService.getNoteById(noteId);
      if (note) {
        setSelectedNote(note);
        setDetailModalVisible(true);
      }
    } catch (error) {
      console.error(`Erro ao buscar nota ID ${noteId}:`, error);
    }
  };

  const loadNotes = async () => {
    try {
      const loadedNotes = await noteService.getAllNotes();
      setNotes(loadedNotes);
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    try {
      setIsLoading(true);
      if (term.trim() === '') {
        await loadNotes();
      } else {
        const searchResults = await noteService.searchNotesByTitle(term);
        setNotes(searchResults);
      }
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async (titulo: string, conteudo: string, imagem: string | null, tags: Tag[]) => {
    try {
      if (selectedNote?.id) {
        // Se há um ID, estamos editando uma nota existente
        await noteService.updateNote({
          id: selectedNote.id,
          titulo,
          conteudo,
          imagem,
          tags
        });
        setSelectedNote(null);
      } else {
        // Caso contrário, estamos criando uma nova nota
        await noteService.createNote({
          titulo,
          conteudo,
          imagem,
          tags
        });
      }
      
      // Fechar modal e recarregar notas
      setModalVisible(false);
      loadNotes();
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      alert('Não foi possível salvar a nota. Tente novamente.');
    }
  };

  const handleFavoriteToggle = async (id: number) => {
    try {
      await noteService.toggleFavorite(id);
      loadNotes();
    } catch (error) {
      console.error('Erro ao favoritar/desfavoritar nota:', error);
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await noteService.deleteNote(id);
      setDeleteConfirmModalVisible(false);
      setNoteToDelete(null);
      if (detailModalVisible) {
        setDetailModalVisible(false);
      }
      loadNotes();
    } catch (error) {
      console.error('Erro ao excluir nota:', error);
    }
  };

  const confirmDelete = (id: number) => {
    setNoteToDelete(id);
    setDeleteConfirmModalVisible(true);
  };

  const handleViewNoteDetails = (note: Note) => {
    setSelectedNote(note);
    setDetailModalVisible(true);
  };

  const renderNoteItem = ({ item }: { item: Note }) => (
    <TouchableOpacity 
      style={styles.noteCard}
      onPress={() => handleViewNoteDetails(item)}
      activeOpacity={0.7}
    >
      <View style={item.imagem ? styles.noteContent : styles.noteContentNoImage}>
        {item.imagem ? (
          <Image source={{ uri: item.imagem }} style={styles.noteImage} />
        ) : null}
        
        <View style={styles.noteTextContent}>
          <View style={styles.noteHeader}>
            <Text style={styles.noteTitle} numberOfLines={1} ellipsizeMode="tail">
              {item.titulo}
            </Text>
            <View style={styles.noteActions}>
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  handleEditNote(item);
                }}
              >
                <MaterialIcons 
                  name="edit" 
                  size={24} 
                  color="#FFD700"
                  style={styles.actionIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  confirmDelete(item.id as number);
                }}
              >
                <MaterialIcons 
                  name="delete-outline" 
                  size={24} 
                  color="#FF6B6B"
                  style={styles.actionIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  handleFavoriteToggle(item.id as number);
                }}
              >
                <MaterialIcons 
                  name={item.isFavorite ? "star" : "star-outline"} 
                  size={24} 
                  color={item.isFavorite ? "#FFD700" : "#888"}
                  style={styles.actionIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
          
          {item.conteudo ? (
            <Text style={styles.noteContentText} numberOfLines={2} ellipsizeMode="tail">
              {item.conteudo}
            </Text>
          ) : null}
          
          <View style={styles.noteFooter}>
            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.tags.slice(0, 2).map(tag => (
                  <View 
                    key={tag.id} 
                    style={[styles.tagBadge, { backgroundColor: tag.color || '#808080' }]}
                  >
                    <Text style={styles.tagText} numberOfLines={1}>{tag.titulo}</Text>
                  </View>
                ))}
                {item.tags.length > 2 && (
                  <View style={styles.moreTagsBadge}>
                    <Text style={styles.moreTagsText}>+{item.tags.length - 2}</Text>
                  </View>
                )}
              </View>
            )}
            <Text style={styles.noteDate}>
              {new Date(item.createdAt as string).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleEditNote = (note?: Note) => {
    const noteToEdit = note || selectedNote;
    if (noteToEdit) {
      setSelectedNote(noteToEdit);
      setDetailModalVisible(false);
      setModalVisible(true);
    }
  };

  const handleCreateNote = () => {
    setSelectedNote(null);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchBar label="Buscar notas..." onSearch={handleSearch} />
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : notes.length > 0 ? (
        <FlatList
          data={notes}
          renderItem={renderNoteItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.notesList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Feather name="book-open" size={50} color="#aaa" />
          <Text style={styles.emptyText}>
            {searchTerm ? 'Nenhuma nota encontrada' : 'Não há notas disponíveis'}
          </Text>
          <Text style={styles.emptySubText}>
            {searchTerm 
              ? 'Tente buscar com outros termos' 
              : 'Toque no botão + para adicionar sua primeira nota'}
          </Text>
        </View>
      )}
      
      {/* Botão flutuante para adicionar nova nota */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleCreateNote}
      >
        <AntDesign name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Modal para ver detalhes da nota */}
      <NoteDetailModal
        visible={detailModalVisible}
        note={selectedNote}
        onClose={() => setDetailModalVisible(false)}
        onEdit={() => handleEditNote()}
        onDelete={(id) => confirmDelete(id)}
      />

      {/* Modal para criar/editar nota */}
      <NoteFormModal
        visible={modalVisible}
        note={selectedNote}
        onClose={() => setModalVisible(false)}
        onSave={handleAddNote}
      />

      {/* Modal de confirmação para excluir nota */}
      <ConfirmationModal
        visible={deleteConfirmModalVisible}
        title="Excluir nota"
        message="Tem certeza que deseja excluir esta nota?"
        submessage="Esta ação não pode ser desfeita."
        onCancel={() => setDeleteConfirmModalVisible(false)}
        onConfirm={() => noteToDelete !== null && handleDeleteNote(noteToDelete)}
        confirmText="Excluir"
        confirmButtonColor="#FF6B6B"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ddd0c2',
    width: '100%',
  },
  notesList: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#554b46',
    marginTop: 16,
    fontWeight: 'bold',
    fontFamily: 'Nunito',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Nunito',
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noteContentNoImage: {
    flexDirection: 'column',
  },
  noteImage: {
    width: 100,
    height: 100,
    borderRadius: 6,
    marginRight: 16,
  },
  noteTextContent: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 100,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#554b46',
    flex: 1,
    marginRight: 8,
    fontFamily: 'Nunito',
  },
  noteActions: {
    flexDirection: 'row',
  },
  actionIcon: {
    marginLeft: 10,
  },
  noteContentText: {
    fontSize: 14,
    color: '#554b46',
    marginBottom: 10,
    lineHeight: 20,
    flexGrow: 1,
    fontFamily: 'Nunito',
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    flex: 1,
  },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 4,
    maxWidth: 80,
  },
  tagText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: 'Nunito',
  },
  moreTagsBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#aaa',
  },
  moreTagsText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Nunito',
  },
  noteDate: {
    fontSize: 11,
    color: '#888',
    textAlign: 'right',
    fontFamily: 'Nunito',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#554b46',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#554b46',
    fontFamily: 'Nunito',
  },
  searchContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#ddd0c2',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
});

export default Notes; 