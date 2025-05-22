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
            size={12} 
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
              size={18} 
              color={task.isFavorite ? "#FFD700" : "#888"}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => onEdit(task)}
            style={styles.actionButton}
          >
            <MaterialIcons 
              name="edit" 
              size={18} 
              color="#FFD700"
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => onDelete(task.id as number)}
            style={styles.actionButton}
          >
            <MaterialIcons 
              name="delete-outline" 
              size={18} 
              color="#FF6B6B"
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Second row with description */}
      {task.descricao && (
        <View style={styles.secondRow}>
          <Text style={styles.taskDescription} numberOfLines={1} ellipsizeMode="tail">
            {task.descricao}
          </Text>
        </View>
      )}
      
      {/* Third row with tags and date */}
      <View style={styles.thirdRow}>
        {task.tags && task.tags.length > 0 ? (
          <View style={styles.tagsContainer}>
            {task.tags.slice(0, 2).map(tag => (
              <View 
                key={tag.id} 
                style={[styles.tagBadge, { backgroundColor: tag.color || '#808080' }]}
              >
                <Text style={styles.tagText} numberOfLines={1}>{tag.titulo}</Text>
              </View>
            ))}
            {task.tags.length > 2 && (
              <View style={styles.moreTagsBadge}>
                <Text style={styles.moreTagsText}>+{task.tags.length - 2}</Text>
              </View>
            )}
          </View>
        ) : <View style={{ flex: 1 }} />}
        
        {task.createdAt && (
          <Text style={styles.taskDate}>
            {new Date(task.createdAt as string).toLocaleDateString('pt-BR')}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 6,
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
    marginTop: 2,
    paddingLeft: 24, // Increased to match new statusIndicator width + margin
  },
  thirdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
    paddingLeft: 24, // Increased to match new statusIndicator width + margin
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  taskTitle: {
    flex: 1,
    fontSize: 13,
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
    marginLeft: 5,
    padding: 2,
  },
  taskDescription: {
    flex: 1,
    fontSize: 10,
    color: '#777',
    fontFamily: 'Nunito',
    marginRight: 4,
  },
  taskDate: {
    fontSize: 8,
    color: '#999',
    fontFamily: 'Nunito',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    flex: 1,
  },
  tagBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    marginRight: 3,
    maxWidth: 60,
  },
  tagText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: 'Nunito',
  },
  moreTagsBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: '#aaa',
  },
  moreTagsText: {
    color: '#fff',
    fontSize: 8,
    fontFamily: 'Nunito',
  },
});

export default TaskItem; 