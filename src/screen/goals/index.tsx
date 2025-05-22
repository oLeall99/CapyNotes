import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { Goal, GoalService } from '../../db/services/goalService';
import { updateGoalTable } from '../../db/migrations/updateGoalTable';
import ConfirmationModal from '../../components/ConfirmationModal';
import GoalDetailModal from '../../components/GoalDetailModal';
import GoalFormModal from '../../components/GoalFormModal';
import SearchBar from '../../components/search';

const Goals: React.FC = () => {
  const db = useSQLiteContext();
  const goalService = new GoalService(db);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<number | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Executar migração para atualizar a estrutura da tabela goals, se necessário
        await updateGoalTable(db);
        
        // Depois de garantir que a tabela está atualizada, carregar as metas
        await loadGoals();
      } catch (error) {
        console.error('Erro ao inicializar:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, []);

  const loadGoals = async () => {
    try {
      const loadedGoals = await goalService.getAllGoals();
      setGoals(loadedGoals);
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    try {
      setIsLoading(true);
      if (term.trim() === '') {
        await loadGoals();
      } else {
        const searchResults = await goalService.searchGoalsByTitle(term);
        setGoals(searchResults);
      }
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGoal = async (
    titulo: string, 
    descricao: string, 
    valorInicial: number, 
    valorAtual: number, 
    valorFinal: number, 
    tipo: 'inteiro' | 'dinheiro'
  ) => {
    try {
      if (selectedGoal?.id) {
        // Se há um ID, estamos editando uma meta existente
        await goalService.updateGoal({
          id: selectedGoal.id,
          titulo,
          descricao,
          valorInicial,
          valorAtual,
          valorFinal,
          tipo
        });
        setSelectedGoal(null);
      } else {
        // Caso contrário, estamos criando uma nova meta
        await goalService.createGoal({
          titulo,
          descricao,
          valorInicial,
          valorAtual,
          valorFinal,
          tipo
        });
      }
      
      // Fechar modal e recarregar metas
      setModalVisible(false);
      loadGoals();
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
      alert('Não foi possível salvar a meta. Tente novamente.');
    }
  };

  const handleFavoriteToggle = async (id: number) => {
    try {
      await goalService.toggleFavorite(id);
      loadGoals();
    } catch (error) {
      console.error('Erro ao favoritar/desfavoritar meta:', error);
    }
  };

  const handleDeleteGoal = async (id: number) => {
    try {
      await goalService.deleteGoal(id);
      setDeleteConfirmModalVisible(false);
      setGoalToDelete(null);
      if (detailModalVisible) {
        setDetailModalVisible(false);
      }
      loadGoals();
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
    }
  };

  const handleUpdateGoalValue = async (id: number, newValue: number) => {
    try {
      await goalService.updateCurrentValue(id, newValue);
      
      // Atualizar a meta na tela de detalhes também
      if (selectedGoal && selectedGoal.id === id) {
        setSelectedGoal({
          ...selectedGoal,
          valorAtual: newValue
        });
      }
      
      loadGoals();
    } catch (error) {
      console.error('Erro ao atualizar valor da meta:', error);
    }
  };

  const confirmDelete = (id: number) => {
    setGoalToDelete(id);
    setDeleteConfirmModalVisible(true);
  };

  const handleViewGoalDetails = (goal: Goal) => {
    setSelectedGoal(goal);
    setDetailModalVisible(true);
  };

  const formatValue = (value: number, tipo: 'inteiro' | 'dinheiro') => {
    if (tipo === 'dinheiro') {
      return `R$ ${value.toFixed(2).replace('.', ',')}`;
    }
    return value.toString();
  };

  const renderGoalItem = ({ item }: { item: Goal }) => {
    const progress = (item.valorAtual - item.valorInicial) / (item.valorFinal - item.valorInicial);
    const adjustedProgress = Math.min(Math.max(0, progress), 1); // Limita entre 0 e 1
    
    return (
      <TouchableOpacity 
        style={styles.goalCard}
        onPress={() => handleViewGoalDetails(item)}
        activeOpacity={0.7}
      >
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle} numberOfLines={1} ellipsizeMode="tail">
            {item.titulo}
          </Text>
          <View style={styles.goalActions}>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                handleEditGoal(item);
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
                confirmDelete(item.id as number);
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
                handleFavoriteToggle(item.id as number);
              }}
            >
              <MaterialIcons 
                name={item.isFavorite ? "star" : "star-outline"} 
                size={24} 
                color={item.isFavorite ? "#FFD700" : "#888"}
                style={styles.actionIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {item.descricao ? (
          <Text style={styles.goalDescription} numberOfLines={1} ellipsizeMode="tail">
            {item.descricao}
          </Text>
        ) : null}

        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${Math.round(adjustedProgress * 100)}%` }
            ]} 
          />
        </View>

        <View style={styles.goalValuesContainer}>
          <Text style={styles.goalValue}>
            {formatValue(item.valorInicial, item.tipo)}
          </Text>
          <Text style={styles.goalProgressText}>
            {Math.round(adjustedProgress * 100)}%
          </Text>
          <Text style={styles.goalValue}>
            {formatValue(item.valorFinal, item.tipo)}
          </Text>
        </View>

        <View style={styles.goalFooter}>
          <Text style={styles.goalCurrentValue}>
            Atual: {formatValue(item.valorAtual, item.tipo)}
          </Text>
          <Text style={styles.goalDate}>
            {new Date(item.createdAt as string).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleEditGoal = (goal?: Goal) => {
    const goalToEdit = goal || selectedGoal;
    if (goalToEdit) {
      setSelectedGoal(goalToEdit);
      setDetailModalVisible(false);
      setModalVisible(true);
    }
  };

  const handleCreateGoal = () => {
    setSelectedGoal(null);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchBar label="Buscar metas..." onSearch={handleSearch} />
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#554b46" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : goals.length > 0 ? (
        <FlatList
          data={goals}
          renderItem={renderGoalItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.goalsList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Feather name="target" size={50} color="#aaa" />
          <Text style={styles.emptyText}>
            {searchTerm ? 'Nenhuma meta encontrada' : 'Não há metas disponíveis'}
          </Text>
          <Text style={styles.emptySubText}>
            {searchTerm 
              ? 'Tente buscar com outros termos' 
              : 'Toque no botão + para adicionar sua primeira meta'}
          </Text>
        </View>
      )}
      
      {/* Botão flutuante para adicionar nova meta */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleCreateGoal}
      >
        <AntDesign name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Modal para ver detalhes da meta */}
      <GoalDetailModal
        visible={detailModalVisible}
        goal={selectedGoal}
        onClose={() => setDetailModalVisible(false)}
        onEdit={() => handleEditGoal()}
        onDelete={(id) => confirmDelete(id)}
        onUpdateValue={handleUpdateGoalValue}
      />

      {/* Modal para criar/editar meta */}
      <GoalFormModal
        visible={modalVisible}
        goal={selectedGoal}
        onClose={() => setModalVisible(false)}
        onSave={handleAddGoal}
      />

      {/* Modal de confirmação para excluir meta */}
      <ConfirmationModal
        visible={deleteConfirmModalVisible}
        title="Excluir meta"
        message="Tem certeza que deseja excluir esta meta?"
        submessage="Esta ação não pode ser desfeita."
        onCancel={() => setDeleteConfirmModalVisible(false)}
        onConfirm={() => goalToDelete !== null && handleDeleteGoal(goalToDelete)}
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
  goalsList: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#554b46',
    marginTop: 16,
    fontWeight: 'bold',
    fontFamily: 'Nunito',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Nunito',
  },
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
  goalDate: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Nunito',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#554b46',
    marginTop: 12,
    fontFamily: 'Nunito',
  },
  searchContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#ddd0c2',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
});

export default Goals; 