import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import TagsComponent from '../../components/TagsComponent';
import AboutComponent from '../../components/AboutComponent';

const Config: React.FC = () => {
  // Data for the FlatList
  const sections = [
    { id: 'tags', component: <TagsComponent title="Gerenciar Tags" /> },
    { id: 'about', component: <AboutComponent title="Sobre o Aplicativo" /> }
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={sections}
        renderItem={({ item }) => item.component}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ddd0c2',
    width: '100%',
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default Config; 