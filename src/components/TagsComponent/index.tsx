import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  TextInput, 
  Modal,
  Alert
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { Tag, TagService } from '../../db/services/tagService';

interface TagsComponentProps {
  title?: string;
}

const TagsComponent: React.FC<TagsComponentProps> = ({ title = 'Gerenciar Tags' }) => {
  const db = useSQLiteContext();
  const tagService = new TagService(db);
  
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [tagTitle, setTagTitle] = useState('');
  const [tagColor, setTagColor] = useState('#808080');
  const [tagDescription, setTagDescription] = useState('');
  
  const COLORS = [
    '#FF6B6B', // Vermelho
    '#FF9E7A', // Laranja
    '#FFCA80', // Amarelo
    '#B1EF8E', // Verde
    '#80CFFF', // Azul
    '#D5B2FF', // Roxo
    '#FF9EC4', // Rosa
    '#FF00FF', // Magenta
    '#808080', // Cinza
    '#000000', // Preto
    '#FFFFFF', // Branco
  ];
  
  useEffect(() => {
    loadTags();
  }, []);
  
  const loadTags = async () => {
    try {
      setIsLoading(true);
      const loadedTags = await tagService.getAllTags();
      setTags(loadedTags);
    } catch (error) {
      console.error('Erro ao carregar tags:', error);
      Alert.alert('Erro', 'Não foi possível carregar as tags');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddTag = () => {
    setSelectedTag(null);
    resetForm();
    setModalVisible(true);
  };
  
  const handleEditTag = (tag: Tag) => {
    setSelectedTag(tag);
    setTagTitle(tag.titulo);
    setTagColor(tag.color || '#808080');
    setTagDescription(tag.descricao || '');
    setModalVisible(true);
  };
  
  const resetForm = () => {
    setTagTitle('');
    setTagColor('#808080');
    setTagDescription('');
  };
  
  const handleSaveTag = async () => {
    if (!tagTitle.trim()) {
      Alert.alert('Erro', 'O título da tag é obrigatório');
      return;
    }
    
    try {
      if (selectedTag?.id) {
        // Atualizar tag existente
        await tagService.updateTag({
          id: selectedTag.id,
          titulo: tagTitle,
          color: tagColor,
          descricao: tagDescription
        });
      } else {
        // Criar nova tag
        await tagService.createTag({
          titulo: tagTitle,
          color: tagColor,
          descricao: tagDescription
        });
      }
      
      setModalVisible(false);
      resetForm();
      loadTags();
    } catch (error) {
      console.error('Erro ao salvar tag:', error);
      Alert.alert('Erro', 'Não foi possível salvar a tag');
    }
  };
  
  const handleDeleteTag = async (id: number) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta tag?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await tagService.deleteTag(id);
              loadTags();
            } catch (error) {
              console.error('Erro ao excluir tag:', error);
              Alert.alert('Erro', 'Não foi possível excluir a tag');
            }
          } 
        }
      ]
    );
  };
  
  const renderTagItem = ({ item }: { item: Tag }) => (
    <View style={styles.tagItem}>
      <View style={styles.tagDetails}>
        <View style={[styles.colorIndicator, { backgroundColor: item.color || '#808080' }]} />
        <View style={styles.tagTexts}>
          <Text style={styles.tagTitle}>{item.titulo}</Text>
          {item.descricao ? (
            <Text style={styles.tagDescription} numberOfLines={1}>{item.descricao}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.tagActions}>
        <TouchableOpacity onPress={() => handleEditTag(item)} style={styles.actionButton}>
          <MaterialIcons name="edit" size={20} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteTag(item.id as number)} style={styles.actionButton}>
          <MaterialIcons name="delete" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={handleAddTag} style={styles.addButton}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : tags.length > 0 ? (
        <FlatList
          data={tags}
          renderItem={renderTagItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.centerContent}>
          <Feather name="tag" size={40} color="#aaa" />
          <Text style={styles.emptyText}>Nenhuma tag encontrada</Text>
          <Text style={styles.emptySubText}>Crie tags para organizar seus itens</Text>
        </View>
      )}
      
      {/* Modal para criar/editar tags */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedTag ? 'Editar Tag' : 'Nova Tag'}
            </Text>
            
            <Text style={styles.inputLabel}>Título</Text>
            <TextInput
              style={styles.textInput}
              value={tagTitle}
              onChangeText={setTagTitle}
              placeholder="Nome da tag"
              maxLength={50}
            />
            
            <Text style={styles.inputLabel}>Descrição (opcional)</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              value={tagDescription}
              onChangeText={setTagDescription}
              placeholder="Descrição da tag"
              multiline={true}
              numberOfLines={3}
              maxLength={200}
              textAlignVertical="top"
            />
            
            <Text style={styles.inputLabel}>Cor</Text>
            <View style={styles.colorSelector}>
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    tagColor === color && styles.selectedColor
                  ]}
                  onPress={() => setTagColor(color)}
                />
              ))}
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveTag}
              >
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#554b46',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Nunito',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
    fontFamily: 'Nunito',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#554b46',
    marginTop: 16,
    fontFamily: 'Nunito',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    fontFamily: 'Nunito',
  },
  listContent: {
    padding: 8,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tagDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  tagTexts: {
    flex: 1,
  },
  tagTitle: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Nunito',
  },
  tagDescription: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    fontFamily: 'Nunito',
  },
  tagActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#554b46',
    marginBottom: 16,
    fontFamily: 'Nunito',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'Nunito',
  },
  textInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    fontFamily: 'Nunito',
  },
  textAreaInput: {
    height: 80,
  },
  colorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    marginTop: 5,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    margin: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#000',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#f2f2f2',
  },
  saveButton: {
    backgroundColor: '#554b46',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Nunito',
  },
});

export default TagsComponent; 