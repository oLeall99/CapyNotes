import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Metas: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Aqui ficam suas metas.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd0c2',
  },
  text: {
    fontSize: 18,
    color: '#554b46',
  },
});

export default Metas; 