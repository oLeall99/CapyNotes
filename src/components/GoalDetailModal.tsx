import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { Goal } from '../db/services/goalService';

interface GoalDetailModalProps {
  visible: boolean;
  goal: Goal | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: number) => void;
  onUpdateValue: (id: number, value: number) => void;
}

const formatValue = (value: number, tipo: 'inteiro' | 'dinheiro') => {
  if (tipo === 'dinheiro') {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }
  return value.toString();
};

const GoalDetailModal: React.FC<GoalDetailModalProps> = ({
  visible,
  goal,
  onClose,
  onEdit,
  onDelete,
  onUpdateValue
}) => {
  const [newValue, setNewValue] = useState<number | null>(null);

  if (!goal) return null;

  const progress = (goal.valorAtual - goal.valorInicial) / (goal.valorFinal - goal.valorInicial);
  const adjustedProgress = Math.min(Math.max(0, progress), 1); // Limita entre 0 e 1
  
  const handleValueChange = (increment: boolean) => {
    if (!goal.id) return;
    
    const step = goal.tipo === 'inteiro' ? 1 : 10;
    const change = increment ? step : -step;
    const updatedValue = goal.valorAtual + change;
    
    // Não permitir valores menores que o inicial ou maiores que o final
    if (updatedValue < goal.valorInicial || updatedValue > goal.valorFinal) return;
    
    onUpdateValue(goal.id, updatedValue);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <AntDesign name="close" size={24} color="#554b46" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{goal.titulo}</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                <MaterialIcons name="edit" size={24} color="#FFD700" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => goal.id && onDelete(goal.id)} style={styles.actionButton}>
                <MaterialIcons name="delete-outline" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.content}>
            {goal.descricao ? (
              <Text style={styles.description}>{goal.descricao}</Text>
            ) : null}

            <View style={styles.progressContainer}>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${Math.round(adjustedProgress * 100)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(adjustedProgress * 100)}%
              </Text>
            </View>

            <View style={styles.valuesContainer}>
              <View style={styles.valueBox}>
                <Text style={styles.valueLabel}>Inicial</Text>
                <Text style={styles.valueText}>
                  {formatValue(goal.valorInicial, goal.tipo)}
                </Text>
              </View>
              
              <View style={styles.valueBox}>
                <Text style={styles.valueLabel}>Atual</Text>
                <View style={styles.currentValueContainer}>
                  <TouchableOpacity 
                    style={styles.valueButton}
                    onPress={() => handleValueChange(false)}
                  >
                    <AntDesign name="minus" size={20} color="#554b46" />
                  </TouchableOpacity>
                  <Text style={[styles.valueText, styles.currentValue]}>
                    {formatValue(goal.valorAtual, goal.tipo)}
                  </Text>
                  <TouchableOpacity 
                    style={styles.valueButton}
                    onPress={() => handleValueChange(true)}
                  >
                    <AntDesign name="plus" size={20} color="#554b46" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.valueBox}>
                <Text style={styles.valueLabel}>Final</Text>
                <Text style={styles.valueText}>
                  {formatValue(goal.valorFinal, goal.tipo)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.dateText}>
              Criado em: {new Date(goal.createdAt as string).toLocaleDateString('pt-BR')}
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 5,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 15,
    padding: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#554b46',
    flex: 1,
    marginHorizontal: 10,
    fontFamily: 'Nunito',
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    color: '#554b46',
    fontFamily: 'Nunito',
  },
  progressContainer: {
    marginBottom: 25,
  },
  progressBarContainer: {
    width: '100%',
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    textAlign: 'right',
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    fontFamily: 'Nunito',
  },
  valuesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  valueBox: {
    alignItems: 'center',
    flex: 1,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  valueLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
    fontFamily: 'Nunito',
  },
  valueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#554b46',
    fontFamily: 'Nunito',
  },
  currentValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentValue: {
    fontSize: 16,
    color: '#4CAF50',
    marginHorizontal: 10,
  },
  valueButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    marginTop: 10,
    fontFamily: 'Nunito',
  },
});

export default GoalDetailModal; 