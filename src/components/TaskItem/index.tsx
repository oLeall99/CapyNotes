import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { Task, TaskStatus } from '../../db/services/taskService';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onFavorite: (id: number) => void;
  onChangeStatus: (id: number, status: TaskStatus) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  onFavorite, 
  onChangeStatus 
}) => {
  
  const getStatusColor = (status: TaskStatus | undefined) => {
    switch(status) {
      case 'TO_DO':
        return '#FF6B6B'; // Vermelho para tarefas pendentes
      case 'IN_PROGRESS':
        return '#FFD700'; // Amarelo para tarefas em progresso
      case 'DONE':
        return '#4CAF50'; // Verde para tarefas concluídas
      default:
        return '#888';
    }
  };

  const getStatusIcon = (status: TaskStatus | undefined) => {
    switch(status) {
      case 'TO_DO':
        return 'radio-button-unchecked';
      case 'IN_PROGRESS':
        return 'timelapse';
      case 'DONE':
        return 'check-circle';
      default:
        return 'help-outline';
    }
  };

  const getNextStatus = (currentStatus: TaskStatus | undefined): TaskStatus => {
    switch(currentStatus) {
      case 'TO_DO':
        return 'IN_PROGRESS';
      case 'IN_PROGRESS':
        return 'DONE';
      case 'DONE':
        return 'TO_DO';
      default:
        return 'TO_DO';
    }
  };

  return (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <TouchableOpacity 
          style={[styles.statusIndicator, { backgroundColor: getStatusColor(task.status as TaskStatus) }]}
          onPress={() => onChangeStatus(task.id as number, getNextStatus(task.status as TaskStatus))}
        >
          <MaterialIcons 
            name={getStatusIcon(task.status as TaskStatus)} 
            size={20} 
            color="#fff" 
          />
        </TouchableOpacity>
        
        <Text style={styles.taskTitle} numberOfLines={1} ellipsizeMode="tail">
          {task.titulo}
        </Text>
        
        <View style={styles.taskActions}>
          <TouchableOpacity 
            onPress={() => onEdit(task)}
            style={styles.actionButton}
          >
            <MaterialIcons 
              name="edit" 
              size={22} 
              color="#FFD700"
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => onDelete(task.id as number)}
            style={styles.actionButton}
          >
            <MaterialIcons 
              name="delete-outline" 
              size={22} 
              color="#FF6B6B"
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => onFavorite(task.id as number)}
            style={styles.actionButton}
          >
            <MaterialIcons 
              name={task.isFavorite ? "star" : "star-outline"} 
              size={22} 
              color={task.isFavorite ? "#FFD700" : "#888"}
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {task.descricao ? (
        <Text style={styles.taskDescription} numberOfLines={2} ellipsizeMode="tail">
          {task.descricao}
        </Text>
      ) : null}
      
      <Text style={styles.taskDate}>
        {new Date(task.createdAt as string).toLocaleDateString('pt-BR')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#554b46',
    fontFamily: 'Nunito',
  },
  taskActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 8,
    padding: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#554b46',
    marginBottom: 6,
    lineHeight: 20,
    fontFamily: 'Nunito',
    paddingLeft: 38, // Alinhado com o título após o indicador de status
  },
  taskDate: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    fontFamily: 'Nunito',
  },
});

export default TaskItem; 