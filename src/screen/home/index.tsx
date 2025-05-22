import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, SectionList, DeviceEventEmitter } from "react-native";
import { useSQLiteContext } from 'expo-sqlite';
import { MaterialIcons } from '@expo/vector-icons';
import { Goal, GoalService } from '../../db/services/goalService';
import { Task, TaskService } from '../../db/services/taskService';
import { Note, NoteService } from '../../db/services/noteService';
import { Tag } from '../../db/services/tagService';
import SearchBar from '../../components/search';
import TagSelector from '../../components/TagSelector';
import SearchResultItem from '../../components/SearchResultItem';

type ItemType = 'goal' | 'task' | 'note';

interface SearchResult {
  item: Goal | Task | Note;
  type: ItemType;
}

interface ResultSection {
  title: string;
  data: SearchResult[];
}

export function Home() {
  const db = useSQLiteContext();
  const goalService = new GoalService(db);
  const taskService = new TaskService(db);
  const noteService = new NoteService(db);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteGoals, setFavoriteGoals] = useState<Goal[]>([]);
  const [favoriteTasks, setFavoriteTasks] = useState<Task[]>([]);
  const [favoriteNotes, setFavoriteNotes] = useState<Note[]>([]);
  const [searchResults, setSearchResults] = useState<ResultSection[]>([]);
  
  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() || selectedTags.length > 0) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, selectedTags]);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const goals = await goalService.getFavoritedGoals();
      const tasks = await taskService.getFavoritedTasks();
      const notes = await noteService.getFavoritedNotes();
      
      setFavoriteGoals(goals);
      setFavoriteTasks(tasks);
      setFavoriteNotes(notes);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async () => {
    try {
      setIsLoading(true);
      
      let goals: Goal[] = [];
      let tasks: Task[] = [];
      let notes: Note[] = [];
      
      // Se tiver tags selecionadas, busca por tags
      if (selectedTags.length > 0) {
        // Buscar itens para cada tag selecionada
        let allGoals: Goal[] = [];
        let allTasks: Task[] = [];
        let allNotes: Note[] = [];
        
        for (const tag of selectedTags) {
          if (tag.id) {
            const tagGoals = await goalService.searchGoalsByTag(tag.id);
            const tagTasks = await taskService.searchTasksByTag(tag.id);
            const tagNotes = await noteService.searchNotesByTag(tag.id);
            
            allGoals = [...allGoals, ...tagGoals];
            allTasks = [...allTasks, ...tagTasks];
            allNotes = [...allNotes, ...tagNotes];
          }
        }
        
        // Remover duplicatas (itens com múltiplas tags selecionadas)
        goals = allGoals.filter((goal, index, self) => 
          index === self.findIndex(g => g.id === goal.id)
        );
        
        tasks = allTasks.filter((task, index, self) => 
          index === self.findIndex(t => t.id === task.id)
        );
        
        notes = allNotes.filter((note, index, self) => 
          index === self.findIndex(n => n.id === note.id)
        );
        
        // Se também tiver termo de busca, filtra os resultados por título
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          goals = goals.filter(goal => goal.titulo.toLowerCase().includes(term));
          tasks = tasks.filter(task => task.titulo.toLowerCase().includes(term));
          notes = notes.filter(note => note.titulo.toLowerCase().includes(term));
        }
      } 
      // Se não tiver tags selecionadas, busca apenas pelo termo
      else if (searchTerm.trim()) {
        goals = await goalService.searchGoalsByTitle(searchTerm);
        tasks = await taskService.searchTasksByTitle(searchTerm);
        notes = await noteService.searchNotesByTitle(searchTerm);
      }
      
      // Converter para formato de seção
      const noteResults: SearchResult[] = notes.map(note => ({ item: note, type: 'note' }));
      const taskResults: SearchResult[] = tasks.map(task => ({ item: task, type: 'task' }));
      const goalResults: SearchResult[] = goals.map(goal => ({ item: goal, type: 'goal' }));
      
      // Criar as seções de resultados
      const sections: ResultSection[] = [];
      
      if (noteResults.length > 0) {
        sections.push({
          title: 'Notas',
          data: noteResults
        });
      }
      
      if (taskResults.length > 0) {
        sections.push({
          title: 'Tarefas',
          data: taskResults
        });
      }
      
      if (goalResults.length > 0) {
        sections.push({
          title: 'Metas',
          data: goalResults
        });
      }
      
      setSearchResults(sections);
    } catch (error) {
      console.error('Erro ao realizar busca:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleTagsSelected = (tags: Tag[]) => {
    setSelectedTags(tags);
  };

  const handleItemPress = (item: Goal | Task | Note, type: ItemType) => {
    // Navigate to the appropriate screen based on item type
    switch (type) {
      case 'note':
        // Navigate to Notes screen and show detail for this note
        DeviceEventEmitter.emit('navigateToScreen', { 
          screen: 'notas', 
          params: { viewNoteId: item.id } 
        });
        break;
      case 'task':
        // Navigate to Tasks screen and show detail for this task
        DeviceEventEmitter.emit('navigateToScreen', { 
          screen: 'tarefas', 
          params: { viewTaskId: item.id } 
        });
        break;
      case 'goal':
        // Navigate to Goals screen and show detail for this goal
        DeviceEventEmitter.emit('navigateToScreen', { 
          screen: 'metas', 
          params: { viewGoalId: item.id } 
        });
        break;
    }
  };

  const renderSectionHeader = ({ section }: { section: ResultSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  const renderItem = ({ item }: { item: SearchResult }) => (
    <SearchResultItem 
      item={item.item}
      type={item.type}
      onPress={handleItemPress}
    />
  );

  const renderFavoriteContent = () => {
    const hasFavorites = favoriteGoals.length > 0 || favoriteTasks.length > 0 || favoriteNotes.length > 0;
    
    if (!hasFavorites) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="star-outline" size={48} color="#888" />
          <Text style={styles.emptyText}>Nenhum item favorito</Text>
          <Text style={styles.emptySubText}>
            Adicione itens aos favoritos para vê-los aqui
          </Text>
        </View>
      );
    }

    const sections: ResultSection[] = [];
    
    if (favoriteNotes.length > 0) {
        sections.push({
          title: 'Notas Favoritas',
          data: favoriteNotes.map(note => ({ item: note, type: 'note' as ItemType }))
        });
    }

    if (favoriteTasks.length > 0) {
        sections.push({
          title: 'Tarefas Favoritas',
          data: favoriteTasks.map(task => ({ item: task, type: 'task' as ItemType }))
        });
    }

    if (favoriteGoals.length > 0) {
      sections.push({
        title: 'Metas Favoritas',
        data: favoriteGoals.map(goal => ({ item: goal, type: 'goal' as ItemType }))
      });
    }

    
    return (
      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item, index) => `${item.type}-${item.item.id || index}`}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={true}
      />
    );
  };

  const renderSearchResults = () => {
    if (searchResults.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="search" size={48} color="#888" />
          <Text style={styles.emptyText}>Nenhum resultado encontrado</Text>
          <Text style={styles.emptySubText}>
            Tente buscar outro termo {selectedTags.length > 0 && 'ou remover filtros de tags'}
          </Text>
        </View>
      );
    }

    return (
      <SectionList
        sections={searchResults}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item, index) => `${item.type}-${item.item.id || index}`}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={true}
      />
    );
  };

  const isSearchActive = searchTerm.trim() || selectedTags.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBarContainer}>
          <SearchBar label="Buscar metas, tarefas ou notas..." onSearch={handleSearch} />
        </View>
      </View>
      
      <View style={styles.contentWrapper}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#554b46" />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            {isSearchActive ? renderSearchResults() : renderFavoriteContent()}
          </View>
        )}
        
        <TagSelector 
          selectedTags={selectedTags} 
          onTagsSelected={handleTagsSelected} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ddd0c2",
    width: '100%',
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
  searchBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#554b46",
    marginTop: 10,
    fontFamily: 'Nunito',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#554b46",
    marginTop: 16,
    fontWeight: "bold",
    fontFamily: 'Nunito',
  },
  emptySubText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 8,
    fontFamily: 'Nunito',
  },
  listContent: {
    paddingHorizontal: 16,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#554b46',
    fontFamily: 'Nunito',
  },
});
