import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Image, FlatList } from 'react-native';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSQLiteContext } from 'expo-sqlite';
import { Note, NoteService } from '../../db/services/noteService';
import { addImageColumn } from '../../db/migrations/addImageColumn';

const Notes: React.FC = () => {
  const db = useSQLiteContext();
  const noteService = new NoteService(db);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [imagem, setImagem] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Executar migração para adicionar a coluna imagem, se necessário
        await addImageColumn(db);
        
        // Depois de garantir que a coluna existe, carregar as notas
        await loadNotes();
      } catch (error) {
        console.error('Erro ao inicializar:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, []);

  const loadNotes = async () => {
    try {
      const loadedNotes = await noteService.getAllNotes();
      setNotes(loadedNotes);
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
    }
  };

  const handleAddNote = async () => {
    if (!titulo.trim()) {
      alert("O título é obrigatório!");
      return;
    }

    try {
      if (selectedNote?.id) {
        // Se há um ID, estamos editando uma nota existente
        await noteService.updateNote({
          id: selectedNote.id,
          titulo,
          conteudo,
          imagem
        });
        setSelectedNote(null);
      } else {
        // Caso contrário, estamos criando uma nova nota
        await noteService.createNote({
          titulo,
          conteudo,
          imagem
        });
      }
      
      // Resetar estados
      setTitulo('');
      setConteudo('');
      setImagem(null);
      setModalVisible(false);
      
      // Recarregar notas
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
      loadNotes();
    } catch (error) {
      console.error('Erro ao excluir nota:', error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImagem(result.assets[0].uri);
    }
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
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  handleDeleteNote(item.id as number);
                }}
              >
                <MaterialIcons 
                  name="delete-outline" 
                  size={24} 
                  color="#FF6B6B"
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
          
          <Text style={styles.noteDate}>
            {new Date(item.createdAt as string).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleEditNote = () => {
    if (selectedNote) {
      setTitulo(selectedNote.titulo);
      setConteudo(selectedNote.conteudo || '');
      setImagem(selectedNote.imagem || null);
      setDetailModalVisible(false);
      setModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
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
          <Text style={styles.emptyText}>Não há notas disponíveis</Text>
          <Text style={styles.emptySubText}>Toque no botão + para adicionar sua primeira nota</Text>
        </View>
      )}
      
      {/* Botão flutuante para adicionar nova nota */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <AntDesign name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Modal para ver detalhes da nota */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text 
                style={styles.modalTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {selectedNote?.titulo}
              </Text>
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  style={styles.headerActionButton}
                  onPress={handleEditNote}
                >
                  <MaterialIcons name="edit" size={24} color="#FFD700" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.headerActionButton}
                  onPress={() => {
                    if (selectedNote?.id) {
                      handleDeleteNote(selectedNote.id);
                      setDetailModalVisible(false);
                    }
                  }}
                >
                  <MaterialIcons name="delete" size={24} color="#FF6B6B" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.headerActionButton}
                  onPress={() => setDetailModalVisible(false)}
                >
                  <Feather name="x" size={24} color="#554b46" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.formContainer}>
              {selectedNote?.imagem ? (
                <Image 
                  source={{ uri: selectedNote.imagem }} 
                  style={styles.detailImage} 
                  resizeMode="contain"
                />
              ) : null}
              
              {selectedNote?.conteudo ? (
                <Text style={styles.detailContent}>{selectedNote.conteudo}</Text>
              ) : (
                <Text style={styles.noContentText}>Essa nota não possui conteúdo.</Text>
              )}
              
              <View style={styles.detailDates}>
                <Text style={styles.detailDate}>
                  Criado em: {selectedNote?.createdAt 
                    ? new Date(selectedNote.createdAt).toLocaleString('pt-BR') 
                    : ''}
                </Text>
                
                {selectedNote?.updatedAt && selectedNote.updatedAt !== selectedNote.createdAt ? (
                  <Text style={styles.detailDate}>
                    Atualizado em: {new Date(selectedNote.updatedAt).toLocaleString('pt-BR')}
                  </Text>
                ) : null}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para criar nova nota */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedNote(null);
          setTitulo('');
          setConteudo('');
          setImagem(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedNote?.id ? 'Editar Nota' : 'Nova Nota'}
              </Text>
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                setSelectedNote(null);
                setTitulo('');
                setConteudo('');
                setImagem(null);
              }}>
                <Feather name="x" size={24} color="#554b46" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>Título</Text>
              <TextInput
                style={styles.input}
                value={titulo}
                onChangeText={setTitulo}
                placeholder="Digite o título da nota"
              />

              <Text style={styles.label}>Conteúdo</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={conteudo}
                onChangeText={setConteudo}
                placeholder="Digite o conteúdo da nota"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <Text style={styles.label}>Imagem</Text>
              <TouchableOpacity style={styles.imageSelector} onPress={pickImage}>
                {imagem ? (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: imagem }} style={styles.previewImage} />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => setImagem(null)}
                    >
                      <Feather name="x-circle" size={24} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Feather name="image" size={24} color="#aaa" />
                    <Text style={styles.imagePlaceholderText}>Selecionar imagem</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleAddNote}
              >
                <Text style={styles.saveButtonText}>
                  {selectedNote?.id ? 'Atualizar' : 'Salvar Nota'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
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
  },
  noteActions: {
    flexDirection: 'row',
  },
  actionIcon: {
    marginLeft: 12,
  },
  noteContentText: {
    fontSize: 14,
    color: '#554b46',
    marginBottom: 10,
    lineHeight: 20,
    flexGrow: 1,
  },
  noteDate: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    marginTop: 'auto',
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
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#554b46',
    flex: 1,
    marginRight: 10,
  },
  formContainer: {
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#554b46',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  textArea: {
    height: 100,
  },
  imageSelector: {
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 5,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: '#aaa',
  },
  saveButton: {
    backgroundColor: '#554b46',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#554b46',
  },
  detailImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailContent: {
    fontSize: 16,
    color: '#554b46',
    lineHeight: 24,
    marginBottom: 20,
  },
  noContentText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailDate: {
    fontSize: 14,
    color: '#888',
    textAlign: 'right',
    marginTop: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    marginLeft: 15,
    padding: 5,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 5,
    zIndex: 1,
  },
});

export default Notes; 