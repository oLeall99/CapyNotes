import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
      case 'TO_DO': return '#FF6B6B';
      case 'IN_PROGRESS': return '#FFD700';
      case 'DONE': return '#4CAF50';
      default: return '#888';
    }
  };

  const getStatusIcon = (status: TaskStatus | undefined) => {
    switch(status) {
      case 'TO_DO': return 'radio-button-unchecked';
      case 'IN_PROGRESS': return 'timelapse';
      case 'DONE': return 'check-circle';
      default: return 'help-outline';
    }
  };

  const getNextStatus = (currentStatus: TaskStatus | undefined): TaskStatus => {
    switch(currentStatus) {
      case 'TO_DO': return 'IN_PROGRESS';
      case 'IN_PROGRESS': return 'DONE';
      case 'DONE': return 'TO_DO';
      default: return 'TO_DO';
    }
  };

  return (
    <View style={styles.taskCard}>
      {/* First row with status, title and actions */}
      <View style={styles.firstRow}>
        <TouchableOpacity 
          style={[styles.statusIndicator, { backgroundColor: getStatusColor(task.status as TaskStatus) }]}
          onPress={() => onChangeStatus(task.id as number, getNextStatus(task.status as TaskStatus))}
        >
          <MaterialIcons 
            name={getStatusIcon(task.status as TaskStatus)} 
            size={10} 
            color="#fff" 
          />
        </TouchableOpacity>
        
        <Text style={styles.taskTitle} numberOfLines={1} ellipsizeMode="tail">
          {task.titulo}
        </Text>
        
        <View style={styles.taskActions}>
          <TouchableOpacity 
            onPress={() => onFavorite(task.id as number)}
            style={styles.actionButton}
          >
            <MaterialIcons 
              name={task.isFavorite ? "star" : "star-outline"} 
              size={12} 
              color={task.isFavorite ? "#FFD700" : "#888"}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => onEdit(task)}
            style={styles.actionButton}
          >
            <MaterialIcons 
              name="edit" 
              size={12} 
              color="#FFD700"
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => onDelete(task.id as number)}
            style={styles.actionButton}
          >
            <MaterialIcons 
              name="delete-outline" 
              size={12} 
              color="#FF6B6B"
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Second row with description and date */}
      {(task.descricao || task.createdAt) && (
        <View style={styles.secondRow}>
          {task.descricao ? (
            <Text style={styles.taskDescription} numberOfLines={1} ellipsizeMode="tail">
              {task.descricao}
            </Text>
          ) : <View style={{ flex: 1 }} />}
          
          {task.createdAt && (
            <Text style={styles.taskDate}>
              {new Date(task.createdAt as string).toLocaleDateString('pt-BR')}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 4,
    marginBottom: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  firstRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 1,
    paddingLeft: 20, // Same as statusIndicator width + some margin
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  taskTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#554b46',
    fontFamily: 'Nunito',
    marginRight: 4,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 4,
    padding: 1,
  },
  taskDescription: {
    flex: 1,
    fontSize: 9,
    color: '#777',
    fontFamily: 'Nunito',
    marginRight: 4,
  },
  taskDate: {
    fontSize: 7,
    color: '#999',
    fontFamily: 'Nunito',
  },
});

export default TaskItem; 