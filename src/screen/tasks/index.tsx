import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { Task, TaskService, TaskStatus } from '../../db/services/taskService';
import TaskItem from '../../components/TaskItem';
import TaskFormModal from '../../components/TaskFormModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import SearchBar from '../../components/search';

const Tasks: React.FC = () => {
  const db = useSQLiteContext();
  const taskService = new TaskService(db);
  
  const [todoTasks, setTodoTasks] = useState<Task[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
  const [doneTasks, setDoneTasks] = useState<Task[]>([]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      
      // Carrega todas as tarefas ou filtra por termo de busca
      let allTasks: Task[];
      
      if (searchTerm.trim() === '') {
        allTasks = await taskService.getAllTasks();
      } else {
        allTasks = await taskService.searchTasksByTitle(searchTerm);
      }
      
      // Separa as tarefas por status
      setTodoTasks(allTasks.filter(task => task.status === 'TO_DO'));
      setInProgressTasks(allTasks.filter(task => task.status === 'IN_PROGRESS'));
      setDoneTasks(allTasks.filter(task => task.status === 'DONE'));
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    // Se o termo estiver vazio, simplesmente limpe a busca sem mostrar indicador de carregamento
    if (term.trim() === '') {
      try {
        const allTasks = await taskService.getAllTasks();
        setTodoTasks(allTasks.filter(task => task.status === 'TO_DO'));
        setInProgressTasks(allTasks.filter(task => task.status === 'IN_PROGRESS'));
        setDoneTasks(allTasks.filter(task => task.status === 'DONE'));
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
      }
      return;
    }
    
    // Apenas para a busca com termos, mostrar indicador
    try {
      setIsLoading(true);
      const searchResults = await taskService.searchTasksByTitle(term);
      
      // Separa os resultados da busca por status
      setTodoTasks(searchResults.filter(task => task.status === 'TO_DO'));
      setInProgressTasks(searchResults.filter(task => task.status === 'IN_PROGRESS'));
      setDoneTasks(searchResults.filter(task => task.status === 'DONE'));
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async (titulo: string, descricao: string, status: TaskStatus) => {
    try {
      // Fechar modal imediatamente para melhorar UX
      setModalVisible(false);
      
      if (selectedTask?.id) {
        // Se há um ID, estamos editando uma tarefa existente
        const updatedTask = {
          ...selectedTask,
          titulo,
          descricao,
          status
        };
        
        // Atualização otimista da UI
        const removeFromList = (tasks: Task[]): Task[] => tasks.filter(t => t.id !== selectedTask.id);
        
        // Remover a tarefa de todas as listas
        setTodoTasks(removeFromList(todoTasks));
        setInProgressTasks(removeFromList(inProgressTasks));
        setDoneTasks(removeFromList(doneTasks));
        
        // Adicionar a tarefa atualizada à lista correta
        if (status === 'TO_DO') {
          setTodoTasks(prev => [updatedTask, ...prev]);
        } else if (status === 'IN_PROGRESS') {
          setInProgressTasks(prev => [updatedTask, ...prev]);
        } else if (status === 'DONE') {
          setDoneTasks(prev => [updatedTask, ...prev]);
        }
        
        // Atualizar no banco de dados
        await taskService.updateTask(updatedTask);
      } else {
        // Indicar carregamento apenas para a criação de nova tarefa
        setIsLoading(true);
        
        // Criar nova tarefa no banco de dados
        const newTaskId = await taskService.createTask({
          titulo,
          descricao,
          status
        });
        
        // Recarregar tarefas após criação (única operação que precisa de reload completo)
        loadTasks();
      }
      
      setSelectedTask(null);
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      alert('Não foi possível salvar a tarefa. Tente novamente.');
      setIsLoading(false);
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const confirmDelete = (id: number) => {
    setTaskToDelete(id);
    setDeleteConfirmModalVisible(true);
  };

  const handleDeleteTask = async (id: number) => {
    try {
      // Atualização otimista da UI
      setTodoTasks(todoTasks.filter(t => t.id !== id));
      setInProgressTasks(inProgressTasks.filter(t => t.id !== id));
      setDoneTasks(doneTasks.filter(t => t.id !== id));
      
      // Fechar modal primeiro
      setDeleteConfirmModalVisible(false);
      setTaskToDelete(null);
      
      // Depois executar delete no banco de dados
      await taskService.deleteTask(id);
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      // Em caso de erro, recarregar todos os dados
      loadTasks();
    }
  };

  const handleFavoriteToggle = async (id: number) => {
    try {
      // Atualização otimista da UI para favoritos
      const updateTaskList = (tasks: Task[]): Task[] => {
        return tasks.map(task => {
          if (task.id === id) {
            return { ...task, isFavorite: task.isFavorite ? 0 : 1 };
          }
          return task;
        });
      };
      
      setTodoTasks(updateTaskList(todoTasks));
      setInProgressTasks(updateTaskList(inProgressTasks));
      setDoneTasks(updateTaskList(doneTasks));
      
      // Executar a atualização no banco de dados
      await taskService.toggleFavorite(id);
    } catch (error) {
      console.error('Erro ao favoritar/desfavoritar tarefa:', error);
      // Em caso de erro, recarregar todos os dados
      loadTasks();
    }
  };

  const handleChangeStatus = async (id: number, newStatus: TaskStatus) => {
    try {
      // Atualização otimista da UI
      const taskToUpdate = [...todoTasks, ...inProgressTasks, ...doneTasks].find(t => t.id === id);
      
      if (taskToUpdate) {
        const oldStatus = taskToUpdate.status as TaskStatus;
        
        // Remover tarefa da lista antiga
        if (oldStatus === 'TO_DO') {
          setTodoTasks(todoTasks.filter(t => t.id !== id));
        } else if (oldStatus === 'IN_PROGRESS') {
          setInProgressTasks(inProgressTasks.filter(t => t.id !== id));
        } else if (oldStatus === 'DONE') {
          setDoneTasks(doneTasks.filter(t => t.id !== id));
        }
        
        // Criar cópia atualizada da tarefa
        const updatedTask = { ...taskToUpdate, status: newStatus };
        
        // Adicionar à nova lista
        if (newStatus === 'TO_DO') {
          setTodoTasks([updatedTask, ...todoTasks]);
        } else if (newStatus === 'IN_PROGRESS') {
          setInProgressTasks([updatedTask, ...inProgressTasks]);
        } else if (newStatus === 'DONE') {
          setDoneTasks([updatedTask, ...doneTasks]);
        }
      }
      
      // Atualizar no banco de dados sem bloquear a UI
      await taskService.updateTaskStatus(id, newStatus);
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
      // Em caso de erro, recarregar todos os dados
      loadTasks();
    }
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setModalVisible(true);
  };

  const renderEmptyState = (message: string) => (
    <View style={styles.emptyStateContainer}>
      <Feather name="clipboard" size={24} color="#888" />
      <Text style={styles.emptyStateText}>{message}</Text>
    </View>
  );

  const renderTaskList = (tasks: Task[], emptyMessage: string) => (
    <View style={styles.taskListContainer}>
      {tasks.length > 0 ? (
        <FlatList
          data={tasks}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onEdit={handleEditTask}
              onDelete={confirmDelete}
              onFavorite={handleFavoriteToggle}
              onChangeStatus={handleChangeStatus}
            />
          )}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
        />
      ) : (
        renderEmptyState(emptyMessage)
      )}
    </View>
  );

  const renderTasksContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingTasksContainer}>
          <ActivityIndicator size="large" color="#554b46" />
          <Text style={styles.loadingText}>Carregando tarefas...</Text>
        </View>
      );
    }

    return (
      <ScrollView>
        {/* Seção de Tarefas a Fazer */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>A Fazer</Text>
            <View style={[styles.statusIndicator, { backgroundColor: '#FF6B6B' }]} />
          </View>
          {renderTaskList(todoTasks, searchTerm ? 'Nenhuma tarefa pendente encontrada' : 'Nenhuma tarefa pendente')}
        </View>
        
        {/* Seção de Tarefas em Andamento */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Em Andamento</Text>
            <View style={[styles.statusIndicator, { backgroundColor: '#FFD700' }]} />
          </View>
          {renderTaskList(inProgressTasks, searchTerm ? 'Nenhuma tarefa em andamento encontrada' : 'Nenhuma tarefa em andamento')}
        </View>
        
        {/* Seção de Tarefas Concluídas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Concluído</Text>
            <View style={[styles.statusIndicator, { backgroundColor: '#4CAF50' }]} />
          </View>
          {renderTaskList(doneTasks, searchTerm ? 'Nenhuma tarefa concluída encontrada' : 'Nenhuma tarefa concluída')}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchBar label="Buscar tarefas..." onSearch={handleSearch} />
      </View>
      
      {/* Conteúdo condicional de tarefas */}
      {renderTasksContent()}
      
      {/* Botão flutuante para adicionar nova tarefa */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleCreateTask}
      >
        <AntDesign name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Modal para criar/editar tarefa */}
      <TaskFormModal
        visible={modalVisible}
        task={selectedTask}
        onClose={() => setModalVisible(false)}
        onSave={handleAddTask}
      />

      {/* Modal de confirmação para excluir tarefa */}
      <ConfirmationModal
        visible={deleteConfirmModalVisible}
        title="Excluir tarefa"
        message="Tem certeza que deseja excluir esta tarefa?"
        submessage="Esta ação não pode ser desfeita."
        onCancel={() => setDeleteConfirmModalVisible(false)}
        onConfirm={() => taskToDelete !== null && handleDeleteTask(taskToDelete)}
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
  searchContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  section: {
    marginBottom: 15,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#554b46',
    fontFamily: 'Nunito',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  taskListContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
    padding: 10,
    minHeight: 50,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  emptyStateText: {
    color: '#888',
    marginTop: 8,
    fontFamily: 'Nunito',
    textAlign: 'center',
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
  loadingTasksContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(221, 208, 194, 0.4)',
    paddingVertical: 80,
    borderRadius: 8,
    marginHorizontal: 16,
    minHeight: 300,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#554b46',
    fontFamily: 'Nunito',
  },
});

export default Tasks; 