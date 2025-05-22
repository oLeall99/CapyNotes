import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SectionList } from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { Goal, GoalService } from '../../db/services/goalService';
import ConfirmationModal from '../../components/ConfirmationModal';
import GoalDetailModal from '../../components/GoalDetailModal';
import GoalFormModal from '../../components/GoalFormModal';
import GoalCard from '../../components/GoalCard';
import SearchBar from '../../components/search';
import { Tag } from '../../db/services/tagService';

interface GoalSection {
  title: string;
  data: Goal[];
}

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

  // Separar metas ativas das completadas
  const goalSections = useMemo(() => {
    const activeGoals: Goal[] = [];
    const completedGoals: Goal[] = [];

    goals.forEach(goal => {
      const progress = (goal.valorAtual - goal.valorInicial) / (goal.valorFinal - goal.valorInicial);
      const adjustedProgress = Math.min(Math.max(0, progress), 1);
      
      if (adjustedProgress >= 1) {
        completedGoals.push(goal);
      } else {
        activeGoals.push(goal);
      }
    });

    const sections: GoalSection[] = [];
    
    if (activeGoals.length > 0) {
      sections.push({
        title: 'Metas ativas',
        data: activeGoals
      });
    }
    
    if (completedGoals.length > 0) {
      sections.push({
        title: 'Metas completadas',
        data: completedGoals
      });
    }
    
    return sections;
  }, [goals]);

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        // carregar as metas
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
    tipo: 'inteiro' | 'dinheiro',
    tags: Tag[]
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
          tipo,
          tags
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
          tipo,
          tags
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

  const renderGoalItem = ({ item }: { item: Goal }) => (
    <GoalCard
      goal={item}
      onPress={handleViewGoalDetails}
      onEdit={handleEditGoal}
      onDelete={confirmDelete}
      onFavoriteToggle={handleFavoriteToggle}
    />
  );

  const renderSectionHeader = ({ section }: { section: GoalSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

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
        <SectionList
          sections={goalSections}
          renderItem={renderGoalItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.goalsList}
          stickySectionHeadersEnabled={false}
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
  sectionHeader: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: '#ddd0c2',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(85, 75, 70, 0.2)',
    marginBottom: 10,
    marginTop: 5,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#554b46',
    fontFamily: 'Nunito',
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