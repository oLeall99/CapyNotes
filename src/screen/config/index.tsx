import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Config: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>Configurações e sobre o app.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ddd0c2',
    width: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60, // Espaço para o footer
  },
  text: {
    fontSize: 18,
    color: '#554b46',
    fontFamily: 'Nunito',
  },
});

export default Config; 