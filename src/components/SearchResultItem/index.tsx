import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Goal } from '../../db/services/goalService';
import { Note } from '../../db/services/noteService';
import { Task } from '../../db/services/taskService';

type ItemType = 'goal' | 'task' | 'note';

interface SearchResultItemProps {
  item: Goal | Note | Task;
  type: ItemType;
  onPress: (item: Goal | Note | Task, type: ItemType) => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ item, type, onPress }) => {
  const getItemIcon = () => {
    switch (type) {
      case 'goal':
        return <MaterialIcons name="flag" size={20} color="#554b46" />;
      case 'task':
        return <MaterialIcons name="check-circle" size={20} color="#554b46" />;
      case 'note':
        return <MaterialIcons name="note" size={20} color="#554b46" />;
      default:
        return null;
    }
  };

  const getItemTypeLabel = () => {
    switch (type) {
      case 'goal':
        return 'Meta';
      case 'task':
        return 'Tarefa';
      case 'note':
        return 'Nota';
      default:
        return '';
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(item, type)}
    >
      <View style={styles.iconContainer}>
        {getItemIcon()}
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {item.titulo}
        </Text>
        <View style={styles.footer}>
          <View style={[styles.typeLabel, getTypeStyle(type)]}>
            <Text style={styles.typeLabelText}>{getItemTypeLabel()}</Text>
          </View>
          {item.isFavorite ? (
            <MaterialIcons name="star" size={16} color="#FFD700" />
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const getTypeStyle = (type: ItemType) => {
  switch (type) {
    case 'goal':
      return { backgroundColor: 'rgba(76, 175, 80, 0.2)' };
    case 'task':
      return { backgroundColor: 'rgba(255, 215, 0, 0.2)' };
    case 'note':
      return { backgroundColor: 'rgba(85, 75, 70, 0.2)' };
    default:
      return {};
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#554b46',
    marginBottom: 4,
    fontFamily: 'Nunito',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeLabel: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  typeLabelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#554b46',
    fontFamily: 'Nunito',
  },
});

export default SearchResultItem; 