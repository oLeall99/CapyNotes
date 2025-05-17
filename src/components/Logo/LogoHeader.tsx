import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';


const LogoHeader: React.FC = () => {

  return (
    <View style={styles.container}>
      <FontAwesome name="bookmark" size={24} color="#554b46" style={styles.icon} />
      <Text style={styles.title}>
        <Text style={styles.capy}>Capy</Text>
        <Text style={styles.notes}>Notes</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontFamily: 'Jua',
    fontSize: 28,
  },
  titleFallback: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  capy: {
    color: '#554b46',
    fontFamily: 'Jua',
  },
  notes: {
    color: '#7d6e63',
  }
});

export default LogoHeader; 