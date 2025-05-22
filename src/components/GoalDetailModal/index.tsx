import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { Goal } from '../../db/services/goalService';
import achievement from '../../assets/sound/achievement.mp3';

const audioSource = achievement;

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

// Função para calcular o tamanho da fonte baseado no comprimento do valor
const calculateFontSize = (value: string): number => {
  const length = value.length;
  if (length <= 6) return 16; // Tamanho padrão para valores pequenos
  if (length <= 9) return 14; // Reduzir um pouco para valores médios
  if (length <= 12) return 12; // Reduzir mais para valores grandes
  return 10; // Tamanho mínimo para valores muito grandes
};

const GoalDetailModal: React.FC<GoalDetailModalProps> = ({
  visible,
  goal,
  onClose,
  onEdit,
  onDelete,
  onUpdateValue
}) => {
  const [incrementAmount, setIncrementAmount] = useState<string>('');
  const [showCustomIncrement, setShowCustomIncrement] = useState<boolean>(false);
  const [wasCompleted, setWasCompleted] = useState<boolean>(false);

  const player = useAudioPlayer(audioSource);

  if (!goal) return null;

  const progress = (goal.valorAtual - goal.valorInicial) / (goal.valorFinal - goal.valorInicial);
  const adjustedProgress = Math.min(Math.max(0, progress), 1); // Limita entre 0 e 1
  const isCompleted = adjustedProgress >= 1;
  
  const getDefaultStep = () => {
    return goal.tipo === 'inteiro' ? 1 : 10;
  };

  const handleValueChange = async (increment: boolean) => {
    if (!goal.id) return;
    
    // Usar valor customizado se disponível, senão usar o padrão
    const step = incrementAmount && !isNaN(parseFloat(incrementAmount)) 
      ? parseFloat(incrementAmount) 
      : getDefaultStep();
    
    const change = increment ? step : -step;
    let updatedValue = goal.valorAtual + change;
    
    // Se o valor atualizado ultrapassar o final, defina-o como igual ao valor final
    if (updatedValue > goal.valorFinal) {
      updatedValue = goal.valorFinal;
    }
    
    // Se o valor atualizado for menor que o inicial, defina-o como igual ao valor inicial
    if (updatedValue < goal.valorInicial) {
      updatedValue = goal.valorInicial;
    }
    
    onUpdateValue(goal.id, updatedValue);

    // Verifica se a meta foi completada agora
    const newProgress = (updatedValue - goal.valorInicial) / (goal.valorFinal - goal.valorInicial);
    const isNowCompleted = newProgress >= 1;
    
    if (isNowCompleted && !wasCompleted) {
      setWasCompleted(true);
      player.play();
    } else if (!isNowCompleted) {
      setWasCompleted(false);
    }
  };

  const toggleCustomIncrement = () => {
    setShowCustomIncrement(!showCustomIncrement);
    if (!showCustomIncrement) {
      setIncrementAmount(getDefaultStep().toString());
    }
  };

  const handleIncrementChange = (text: string) => {
    // Permitir apenas números e ponto decimal
    const filtered = text.replace(/[^0-9.]/g, '');
    setIncrementAmount(filtered);
  };

  // Formatar valores para exibição
  const formattedInicial = formatValue(goal.valorInicial, goal.tipo);
  const formattedAtual = formatValue(goal.valorAtual, goal.tipo);
  const formattedFinal = formatValue(goal.valorFinal, goal.tipo);

  // Calcular tamanhos de fonte baseado no comprimento dos valores
  const fontSizeInicial = calculateFontSize(formattedInicial);
  const fontSizeAtual = calculateFontSize(formattedAtual);
  const fontSizeFinal = calculateFontSize(formattedFinal);

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
                    { 
                      width: `${Math.round(adjustedProgress * 100)}%`,
                      backgroundColor: isCompleted ? '#FFD700' : '#4CAF50'
                    }
                  ]} 
                />
              </View>
              <Text style={[
                styles.progressText,
                isCompleted && { color: '#FFD700' }
              ]}>
                {Math.round(adjustedProgress * 100)}%
              </Text>
            </View>

            <View style={styles.valuesContainer}>
              <View style={styles.valueBox}>
                <Text style={styles.valueLabel}>Inicial</Text>
                <Text style={[styles.valueText, { fontSize: fontSizeInicial }]}>
                  {formattedInicial}
                </Text>
              </View>
              
              <View style={styles.valueBox}>
                <Text style={styles.valueLabel}>Atual</Text>
                <Text style={[styles.valueText, styles.currentValue, { fontSize: fontSizeAtual }]}>
                  {formattedAtual}
                </Text>
              </View>
              
              <View style={styles.valueBox}>
                <Text style={styles.valueLabel}>Final</Text>
                <Text style={[styles.valueText, { fontSize: fontSizeFinal }]}>
                  {formattedFinal}
                </Text>
              </View>
            </View>
            
            <View style={styles.controlsContainer}>
              <TouchableOpacity 
                style={styles.incrementSettingButton} 
                onPress={toggleCustomIncrement}
              >
                <Text style={styles.incrementSettingText}>
                  {showCustomIncrement ? 'Ocultar ajuste' : 'Ajustar incremento'}
                </Text>
              </TouchableOpacity>
              
              {showCustomIncrement && (
                <View style={styles.customIncrementContainer}>
                  <Text style={styles.customIncrementLabel}>
                    Incremento personalizado:
                  </Text>
                  <TextInput
                    style={styles.customIncrementInput}
                    value={incrementAmount}
                    onChangeText={handleIncrementChange}
                    keyboardType="numeric"
                    placeholder={getDefaultStep().toString()}
                    maxLength={10}
                  />
                </View>
              )}
              
              <View style={styles.buttonsContainer}>
                <TouchableOpacity 
                  style={[styles.valueButton, styles.decrementButton]}
                  onPress={() => handleValueChange(false)}
                >
                  <AntDesign name="minus" size={20} color="#554b46" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.valueButton, styles.incrementButton]}
                  onPress={() => handleValueChange(true)}
                >
                  <AntDesign name="plus" size={20} color="#554b46" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.incrementInfoText}>
                Incremento atual: {incrementAmount || getDefaultStep()}
              </Text>
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
    width: '100%',
    alignItems: 'stretch',
  },
  valueBox: {
    alignItems: 'center',
    flex: 1,
    padding: 10,
    paddingHorizontal: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginHorizontal: 3,
    minHeight: 70,
    justifyContent: 'space-between',
  },
  valueLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    fontFamily: 'Nunito',
  },
  valueText: {
    fontWeight: 'bold',
    color: '#554b46',
    fontFamily: 'Nunito',
    textAlign: 'center',
    paddingHorizontal: 2,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  currentValue: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
  },
  incrementSettingButton: {
    marginBottom: 10,
    padding: 5,
  },
  incrementSettingText: {
    color: '#554b46',
    fontSize: 14,
    fontFamily: 'Nunito',
    textDecorationLine: 'underline',
  },
  customIncrementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
    justifyContent: 'center',
  },
  customIncrementLabel: {
    fontSize: 14,
    color: '#554b46',
    fontFamily: 'Nunito',
    marginRight: 10,
  },
  customIncrementInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 8,
    width: 80,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#554b46',
    fontFamily: 'Nunito',
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  valueButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  decrementButton: {
    backgroundColor: '#ffcccc',
  },
  incrementButton: {
    backgroundColor: '#ccffcc',
  },
  incrementInfoText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Nunito',
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