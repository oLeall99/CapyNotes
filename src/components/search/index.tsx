import React, { useState } from 'react';
import { TextInput, View, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface SearchBarProps {
  label: string;
  onSearch?: (searchTerm: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ label, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (text: string) => {
    setSearchTerm(text);
    if (onSearch) {
      onSearch(text);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <FontAwesome name="search" size={18} style={styles.searchIcon} />
        <TextInput
          placeholder={label}
          style={styles.input}
          value={searchTerm}
          onChangeText={handleSearch}
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
});

export default SearchBar; 