import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Modal,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { Tag, TagService } from '../../db/services/tagService';

interface TagSelectorProps {
  onTagsSelected: (tags: Tag[]) => void;
  selectedTags: Tag[];
  style?: any;
}

const TagSelector: React.FC<TagSelectorProps> = ({ onTagsSelected, selectedTags, style }) => {
  const db = useSQLiteContext();
  const tagService = new TagService(db);
  
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  
  useEffect(() => {
    loadTags();
  }, []);
  
  const loadTags = async () => {
    try {
      setIsLoading(true);
      const allTags = await tagService.getAllTags();
      setTags(allTags);
    } catch (error) {
      console.error('Erro ao carregar tags:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTagPress = (tag: Tag) => {
    let newSelectedTags: Tag[];
    
    // If tag is already selected, remove it
    if (selectedTags.some(t => t.id === tag.id)) {
      newSelectedTags = selectedTags.filter(t => t.id !== tag.id);
    } else {
      // Otherwise add it to the selection
      newSelectedTags = [...selectedTags, tag];
    }
    
    onTagsSelected(newSelectedTags);
  };
  
  const clearTagFilters = () => {
    onTagsSelected([]);
    setModalVisible(false);
  };

  const applyFilters = () => {
    setModalVisible(false);
  };
  
  const isTagSelected = (tag: Tag): boolean => {
    return selectedTags.some(t => t.id === tag.id);
  };
  
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons 
          name="filter-list" 
          size={24} 
          color={selectedTags.length > 0 ? "#554b46" : "#888"} 
        />
        {selectedTags.length > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{selectedTags.length}</Text>
          </View>
        )}
      </TouchableOpacity>
      
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar por Tags</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#554b46" />
              </TouchableOpacity>
            </View>
            
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#554b46" />
                <Text style={styles.loadingText}>Carregando tags...</Text>
              </View>
            ) : tags.length > 0 ? (
              <>
                <ScrollView style={styles.tagsList}>
                  <View style={styles.tagsGrid}>
                    {tags.map(tag => (
                      <TouchableOpacity
                        key={tag.id}
                        style={[
                          styles.tagItem,
                          isTagSelected(tag) && styles.tagItemSelected,
                          { borderColor: tag.color || '#808080' }
                        ]}
                        onPress={() => handleTagPress(tag)}
                      >
                        <View style={[styles.colorIndicator, { backgroundColor: tag.color || '#808080' }]} />
                        <Text style={styles.tagItemText}>{tag.titulo}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.clearButton} 
                    onPress={clearTagFilters}
                  >
                    <Text style={styles.clearButtonText}>Limpar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.applyButton} 
                    onPress={applyFilters}
                  >
                    <Text style={styles.applyButtonText}>Aplicar</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="tag" size={48} color="#888" />
                <Text style={styles.emptyText}>Nenhuma tag encontrada</Text>
                <Text style={styles.emptySubText}>Crie tags na tela de configurações</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 15,
    bottom: 10,
    zIndex: 100,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#554b46',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Nunito',
    fontWeight: 'bold',
  },
  selectedTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    marginRight: 5,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Nunito',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: Dimensions.get('window').height * 0.7,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#554b46',
    fontFamily: 'Nunito',
  },
  tagsList: {
    padding: 15,
    maxHeight: 400,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 5,
  },
  tagItemSelected: {
    backgroundColor: 'rgba(85, 75, 70, 0.1)',
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  tagItemText: {
    fontSize: 14,
    color: '#554b46',
    fontFamily: 'Nunito',
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#554b46',
    fontFamily: 'Nunito',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
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
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  clearButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  clearButtonText: {
    color: '#554b46',
    fontWeight: 'bold',
    fontFamily: 'Nunito',
  },
  applyButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#554b46',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Nunito',
  },
});

export default TagSelector; 