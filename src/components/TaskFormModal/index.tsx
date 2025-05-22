import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
  ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Task, TaskStatus } from '../../db/services/taskService';
import { Tag, TagService } from '../../db/services/tagService';
import { useSQLiteContext } from 'expo-sqlite';

interface TaskFormModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (titulo: string, descricao: string, status: TaskStatus, tags: Tag[]) => void;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  visible,
  task,
  onClose,
  onSave
}) => {
  const db = useSQLiteContext();
  const tagService = new TagService(db);
  
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TO_DO');
  const [tituloError, setTituloError] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadTags();
    }
  }, [visible]);

  useEffect(() => {
    // Preencher os campos se estiver editando uma tarefa existente
    if (task) {
      setTitulo(task.titulo);
      setDescricao(task.descricao || '');
      setStatus(task.status as TaskStatus || 'TO_DO');
      setSelectedTags(task.tags || []);
    } else {
      // Limpar os campos se estiver criando uma nova tarefa
      setTitulo('');
      setDescricao('');
      setStatus('TO_DO');
      setSelectedTags([]);
    }
    
    setTituloError(false);
  }, [task, visible]);

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

  const handleSave = () => {
    if (titulo.trim() === '') {
      setTituloError(true);
      return;
    }
    
    onSave(titulo, descricao, status, selectedTags);
    
    // Limpar campos e erros após salvar
    setTitulo('');
    setDescricao('');
    setStatus('TO_DO');
    setSelectedTags([]);
    setTituloError(false);
  };

  const toggleStatus = () => {
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      'TO_DO': 'IN_PROGRESS',
      'IN_PROGRESS': 'DONE',
      'DONE': 'TO_DO'
    };
    
    setStatus(nextStatus[status]);
  };

  const getStatusColor = (statusValue: TaskStatus) => {
    const colors: Record<TaskStatus, string> = {
      'TO_DO': '#FF6B6B',
      'IN_PROGRESS': '#FFD700',
      'DONE': '#4CAF50'
    };
    
    return colors[statusValue];
  };

  const getStatusLabel = (statusValue: TaskStatus) => {
    const labels: Record<TaskStatus, string> = {
      'TO_DO': 'A Fazer',
      'IN_PROGRESS': 'Em Andamento',
      'DONE': 'Concluído'
    };
    
    return labels[statusValue];
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
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {task ? 'Editar Tarefa' : 'Nova Tarefa'}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#554b46" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.scrollContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Título*</Text>
                <TextInput
                  style={[styles.input, tituloError && styles.inputError]}
                  placeholder="Título da tarefa"
                  value={titulo}
                  onChangeText={(text) => {
                    setTitulo(text);
                    if (text.trim() !== '') {
                      setTituloError(false);
                    }
                  }}
                />
                {tituloError && (
                  <Text style={styles.errorText}>O título é obrigatório</Text>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Descrição</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Descrição da tarefa"
                  value={descricao}
                  onChangeText={setDescricao}
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Status</Text>
                <Pressable 
                  style={[styles.statusButton, { backgroundColor: getStatusColor(status) }]}
                  onPress={toggleStatus}
                >
                  <Text style={styles.statusButtonText}>{getStatusLabel(status)}</Text>
                </Pressable>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Tags</Text>
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
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollContainer: {
    flexGrow: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#554b46',
    fontFamily: 'Nunito',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#554b46',
    fontFamily: 'Nunito',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: '#554b46',
    backgroundColor: '#f9f9f9',
    fontFamily: 'Nunito',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 5,
    fontFamily: 'Nunito',
  },
  textArea: {
    height: 100,
  },
  statusButton: {
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Nunito',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
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
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Nunito',
  },
});

export default TaskFormModal; 