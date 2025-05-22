import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import TagsComponent from '../../components/TagsComponent';
import AboutComponent from '../../components/AboutComponent';

const Config: React.FC = () => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <TagsComponent title="Gerenciar Tags" />
        <AboutComponent title="Sobre o Aplicativo" />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ddd0c2',
    width: '100%',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 20,
  },
});

export default Config; 