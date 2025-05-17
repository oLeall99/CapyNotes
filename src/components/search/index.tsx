import React from 'react';
import { TextInput, View, StyleSheet, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface SearchBarProps {
  label: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ label }) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TextInput
          placeholder={label}
          style={styles.input}
        />
        <FontAwesome name="search" size={20} style={styles.icon} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '95%',
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 5,
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
    borderRadius: 5,
  },
  input: {
    flex: 1,
    padding: 8,
    color: '#554b46',
  },
  icon: {
    marginLeft: 8,
    color: '#554b46',
  },
});

export default SearchBar; 