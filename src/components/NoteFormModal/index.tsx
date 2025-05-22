import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Image } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Note } from '../../db/services/noteService';
import { Tag, TagService } from '../../db/services/tagService';
import { useSQLiteContext } from 'expo-sqlite';

interface NoteFormModalProps {
  visible: boolean;
  note: Note | null;
  onClose: () => void;
  onSave: (titulo: string, conteudo: string, imagem: string | null, tags: Tag[]) => void;
}

const NoteFormModal: React.FC<NoteFormModalProps> = ({
  visible,
  note,
  onClose,
  onSave
}) => {
  const db = useSQLiteContext();
  const tagService = new TagService(db);
  
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [imagem, setImagem] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadTags();
    }
  }, [visible]);

  useEffect(() => {
    if (note) {
      setTitulo(note.titulo);
      setConteudo(note.conteudo || '');
      setImagem(note.imagem || null);
      setSelectedTags(note.tags || []);
    } else {
      resetForm();
    }
  }, [note, visible]);

  const loadTags = async () => {
    try {
      setIsTagsLoading(true);
      const tags = await tagService.getAllTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('Erro ao carregar tags:', error);
    } finally {
      setIsTagsLoading(false);
    }
  };

  const resetForm = () => {
    setTitulo('');
    setConteudo('');
    setImagem(null);
    setSelectedTags([]);
  };

  const handleSave = () => {
    if (!titulo.trim()) {
      alert("O título é obrigatório!");
      return;
    }
    
    onSave(titulo, conteudo, imagem, selectedTags);
    resetForm();
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

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleTagSelection = (tag: Tag) => {
    if (isTagSelected(tag)) {
      // Remove a tag da seleção
      setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
    } else {
      // Adiciona a tag à seleção
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const isTagSelected = (tag: Tag): boolean => {
    return selectedTags.some(t => t.id === tag.id);
  };

  const renderTagItem = (tag: Tag) => (
    <TouchableOpacity
      key={tag.id}
      style={[
        styles.tagItem,
        { backgroundColor: isTagSelected(tag) ? tag.color || '#808080' : 'transparent' },
        { borderColor: tag.color || '#808080' }
      ]}
      onPress={() => toggleTagSelection(tag)}
    >
      <Text style={[
        styles.tagText,
        { color: isTagSelected(tag) ? '#fff' : tag.color || '#808080' }
      ]}>
        {tag.titulo}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      statusBarTranslucent={false}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {note?.id ? 'Editar Nota' : 'Nova Nota'}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Feather name="x" size={24} color="#554b46" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <Text style={styles.label}>Título*</Text>
            <TextInput
              style={styles.input}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Digite o título da nota"
            />

            <Text style={styles.label}>Conteúdo*</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={conteudo}
              onChangeText={setConteudo}
              placeholder="Digite o conteúdo da nota"
              multiline
              numberOfLines={12}
              textAlignVertical="top"
              autoCapitalize="sentences"
            />

            <View style={styles.imageSection}>
              <Text style={styles.sectionLabel}>Imagem</Text>
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
            </View>

            <View style={styles.tagsSection}>
              <Text style={styles.sectionLabel}>Tags</Text>
              {isTagsLoading ? (
                <Text style={styles.loadingText}>Carregando tags...</Text>
              ) : availableTags.length > 0 ? (
                <View style={styles.tagsContainer}>
                  {availableTags.map(tag => renderTagItem(tag))}
                </View>
              ) : (
                <View style={styles.noTagsContainer}>
                  <Text style={styles.noTagsText}>Nenhuma tag disponível</Text>
                  <Text style={styles.noTagsSubText}>Crie tags na tela de configurações</Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>
                {note?.id ? 'Atualizar' : 'Salvar Nota'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    maxHeight: '90%',
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
    fontFamily: 'Nunito',
  },
  formContainer: {
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#554b46',
    fontWeight: 'bold',
    fontFamily: 'Nunito',
  },
  sectionLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#554b46',
    fontWeight: 'bold',
    fontFamily: 'Nunito',
  },
  imageSection: {
    marginTop: 5,
    marginBottom: 15,
    padding: 5,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tagsSection: {
    marginTop: 5,
    marginBottom: 15,
    padding: 5,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    fontFamily: 'Nunito',
  },
  textArea: {
    height: 200,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
    lineHeight: 22,
    borderColor: '#ddd',
    borderWidth: 1.5,
    marginBottom: 20,
  },
  imageSelector: {
    marginBottom: 10,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 5,
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: '100%',
    height: 80,
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
    fontFamily: 'Nunito',
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tagItem: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Nunito',
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 10,
    fontFamily: 'Nunito',
  },
  noTagsContainer: {
    alignItems: 'center',
    marginVertical: 10,
    padding: 10,
  },
  noTagsText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Nunito',
  },
  noTagsSubText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 5,
    fontFamily: 'Nunito',
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
    fontFamily: 'Nunito',
  },
});

export default NoteFormModal; 