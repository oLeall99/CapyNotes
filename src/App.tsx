import React, { useState } from 'react';
import { SafeAreaView, StatusBar, View, Image } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { initializeDatabse } from '../db/initializeDatabase';
import { Home } from './screen/home';
import Notas from './screen/notas';
import Tarefas from './screen/tarefas';
import Metas from './screen/metas';
import Config from './screen/config';
import SearchBar from './components/search';
import Footer from './components/footer';
import LogoHeader from './components/LogoHeader';

const pageLabels: Record<PageKey, string> = {
  home: 'Hoje',
  notas: 'Notas',
  tarefas: 'Tarefas',
  metas: 'Metas',
  config: 'Configuração',
};

type PageKey = 'home' | 'notas' | 'tarefas' | 'metas' | 'config';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<PageKey>('home');

  let PageComponent = null;
  switch (currentScreen) {
    case 'home':
      PageComponent = <Home />;
      break;
    case 'notas':
      PageComponent = <Notas />;
      break;
    case 'tarefas':
      PageComponent = <Tarefas />;
      break;
    case 'metas':
      PageComponent = <Metas />;
      break;
    case 'config':
      PageComponent = <Config />;
      break;
    default:
      PageComponent = <Home />;
  }

  return (
    <>
      <SQLite.SQLiteProvider databaseName="appnote.db" onInit={initializeDatabse}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ddd0c2', alignItems: 'center' }}>
          <View style={{ 
            width: '100%', 
            paddingHorizontal: 20, 
            marginTop: 10, 
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <LogoHeader />
            <Image 
              source={require('../assets/capybara.png')} 
              style={{ 
                width: 40, 
                height: 40, 
                resizeMode: 'contain'
              }} 
            />
          </View>
          {currentScreen !== 'config' && (
            <SearchBar label={pageLabels[currentScreen]} />
          )}
          {PageComponent}
          <Footer current={currentScreen} onNavigate={screen => setCurrentScreen(screen as PageKey)} />
        </SafeAreaView>
      </SQLite.SQLiteProvider>
    </>
  );
}
