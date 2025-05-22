import React, { useState, useEffect, useRef } from 'react';
import { TextInput, View, StyleSheet, TouchableOpacity, Text, FlatList, Modal, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SearchBarProps {
  label: string;
  onSearch?: (searchTerm: string) => void;
}

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

const SearchBar: React.FC<SearchBarProps> = ({ label, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Load search history from AsyncStorage on component mount
  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const saveSearchToHistory = async (term: string) => {
    if (!term.trim()) return;
    
    try {
      // Get current history
      let history = [...searchHistory];
      
      // Remove the term if it already exists (to avoid duplicates)
      history = history.filter(item => item !== term);
      
      // Add the new term at the beginning
      history.unshift(term);
      
      // Limit the history size
      if (history.length > MAX_HISTORY_ITEMS) {
        history = history.slice(0, MAX_HISTORY_ITEMS);
      }
      
      // Save to state and AsyncStorage
      setSearchHistory(history);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  const handleSearch = (text: string) => {
    setSearchTerm(text);
    if (onSearch) {
      onSearch(text);
    }
  };

  const executeSearch = (term: string) => {
    setSearchTerm(term);
    if (onSearch) {
      onSearch(term);
    }
    saveSearchToHistory(term);
    setShowHistory(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
    setShowHistory(false);
  };

  const handleHistoryItemPress = (item: string) => {
    executeSearch(item);
  };

  const handleInputFocus = () => {
    setShowHistory(true);
  };

  const renderHistoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleHistoryItemPress(item)}
    >
      <FontAwesome name="history" size={16} color="#888" style={styles.historyIcon} />
      <Text style={styles.historyText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <FontAwesome name="search" size={18} style={styles.searchIcon} />
        <TextInput
          ref={inputRef}
          placeholder={label}
          style={styles.input}
          value={searchTerm}
          onChangeText={handleSearch}
          onSubmitEditing={() => executeSearch(searchTerm)}
          onFocus={handleInputFocus}
          returnKeyType="search"
          placeholderTextColor="#888"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <FontAwesome name="times-circle" size={18} color="#888" />
          </TouchableOpacity>
        )}
      </View>
      
      {showHistory && searchHistory.length > 0 && (
        <View style={styles.historyContainer}>
          <FlatList
            data={searchHistory}
            renderItem={renderHistoryItem}
            keyExtractor={(item, index) => `search-history-${index}`}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '95%',
    marginTop: 4,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
    color: '#554b46',
    fontWeight: 'bold',
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderRadius: 10,
  },
  input: {
    flex: 1,
    padding: 8,
    color: '#554b46',
    fontFamily: 'Nunito',
    fontSize: 16,
  },
  searchIcon: {
    marginLeft: 8,
    marginRight: 4,
    color: '#554b46',
  },
  clearButton: {
    padding: 8,
  },
  historyContainer: {
    width: '100%',
    maxHeight: 200,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyIcon: {
    marginRight: 10,
  },
  historyText: {
    color: '#554b46',
    fontFamily: 'Nunito',
    fontSize: 14,
  },
});

export default SearchBar; 