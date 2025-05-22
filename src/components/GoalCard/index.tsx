import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Goal } from '../../db/services/goalService';

interface GoalCardProps {
  goal: Goal;
  onPress: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (id: number) => void;
  onFavoriteToggle: (id: number) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onPress,
  onEdit,
  onDelete,
  onFavoriteToggle
}) => {
  const progress = (goal.valorAtual - goal.valorInicial) / (goal.valorFinal - goal.valorInicial);
  const adjustedProgress = Math.min(Math.max(0, progress), 1);
  const isCompleted = adjustedProgress >= 1;

  const formatValue = (value: number, tipo: 'inteiro' | 'dinheiro') => {
    if (tipo === 'dinheiro') {
      return `R$ ${value.toFixed(2).replace('.', ',')}`;
    }
    return value.toString();
  };

  return (
    <TouchableOpacity 
      style={[
        styles.goalCard,
        isCompleted && styles.completedGoalCard
      ]}
      onPress={() => onPress(goal)}
      activeOpacity={0.7}
    >
      <View style={styles.goalHeader}>
        <Text 
          style={[
            styles.goalTitle,
            isCompleted && styles.completedGoalTitle
          ]} 
          numberOfLines={1} 
          ellipsizeMode="tail"
        >
          {goal.titulo}
        </Text>
        <View style={styles.goalActions}>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              onEdit(goal);
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
              onDelete(goal.id as number);
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
              onFavoriteToggle(goal.id as number);
            }}
          >
            <MaterialIcons 
              name={goal.isFavorite ? "star" : "star-outline"} 
              size={24} 
              color={goal.isFavorite ? "#FFD700" : "#888"}
              style={styles.actionIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {goal.descricao ? (
        <Text style={styles.goalDescription} numberOfLines={1} ellipsizeMode="tail">
          {goal.descricao}
        </Text>
      ) : null}

      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBarFill, 
            { width: `${Math.round(adjustedProgress * 100)}%` },
            isCompleted && styles.completedProgressBar
          ]} 
        />
      </View>

      <View style={styles.goalValuesContainer}>
        <Text style={styles.goalValue}>
          {formatValue(goal.valorInicial, goal.tipo)}
        </Text>
        <Text style={[
          styles.goalProgressText,
          isCompleted && styles.completedProgressText
        ]}>
          {Math.round(adjustedProgress * 100)}%
        </Text>
        <Text style={styles.goalValue}>
          {formatValue(goal.valorFinal, goal.tipo)}
        </Text>
      </View>

      <View style={styles.goalFooter}>
        <Text style={[
          styles.goalCurrentValue,
          isCompleted && styles.completedCurrentValue
        ]}>
          Atual: {formatValue(goal.valorAtual, goal.tipo)}
        </Text>
        <Text style={styles.goalDate}>
          {new Date(goal.createdAt as string).toLocaleDateString('pt-BR')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  goalCard: {
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
  completedGoalCard: {
    borderColor: '#FFD700',
    borderWidth: 1,
    shadowColor: '#FFD700',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#554b46',
    flex: 1,
    marginRight: 8,
    fontFamily: 'Nunito',
  },
  completedGoalTitle: {
    color: '#6a5c48', // Slightly darker gold-brown
  },
  goalActions: {
    flexDirection: 'row',
  },
  actionIcon: {
    marginLeft: 10,
  },
  goalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontFamily: 'Nunito',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  completedProgressBar: {
    backgroundColor: '#FFD700',
  },
  goalValuesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalValue: {
    fontSize: 12,
    color: '#777',
    fontFamily: 'Nunito',
  },
  goalProgressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
    fontFamily: 'Nunito',
  },
  completedProgressText: {
    color: '#FFD700',
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalCurrentValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    fontFamily: 'Nunito',
  },
  completedCurrentValue: {
    color: '#FFD700',
  },
  goalDate: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Nunito',
  },
});

export default GoalCard; 