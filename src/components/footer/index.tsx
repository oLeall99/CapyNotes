import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome, MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';

interface FooterProps {
  current: string;
  onNavigate: (screen: string) => void;
}

const navItems = [
  { key: 'home', label: 'Home', icon: <FontAwesome name="home" size={24} /> },
  { key: 'notas', label: 'Notas', icon: <Feather name="book-open" size={24} /> },
  { key: 'tarefas', label: 'Tarefas', icon: <MaterialIcons name="checklist" size={24} /> },
  { key: 'metas', label: 'Metas', icon: <Ionicons name="trophy-outline" size={24} /> },
  { key: 'config', label: 'Config.', icon: <Ionicons name="settings-outline" size={24} /> },
];

const Footer: React.FC<FooterProps> = ({ current, onNavigate }) => {
  return (
    <View style={styles.footerContainer}>
      <View style={styles.footer}>
        {navItems.map(item => (
          <TouchableOpacity
            key={item.key}
            style={styles.button}
            onPress={() => onNavigate(item.key)}
          >
            {React.cloneElement(item.icon, {
              color: current === item.key ? '#554b46' : '#aaa',
            })}
            <Text style={[styles.label, current === item.key && styles.activeLabel]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 2,
  },
  activeLabel: {
    color: '#554b46',
    fontWeight: 'bold',
  },
});

export default Footer;
