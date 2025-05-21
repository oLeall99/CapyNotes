import React, { useState, useCallback, useEffect } from 'react';
import { SafeAreaView, StatusBar, View, Image } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { initializeDatabse } from './db/initializeDatabase';
import { Home } from './screen/home';
import Notes from './screen/notes';
import Tasks from './screen/tasks';
import Goals from './screen/goals';
import Config from './screen/config';
import SearchBar from './components/search';
import Footer from './components/footer';
import LogoHeader from './components/Logo/LogoHeader';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Previne que a splash screen seja escondida automaticamente
SplashScreen.preventAutoHideAsync();


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
  const [searchQuery, setSearchQuery] = useState('');
  
  // Carrega todas as fontes necessárias para o app
  const [fontsLoaded] = useFonts({
    'Jua': require('./assets/fonts/Jua-Regular.ttf'),
    'Caveat': require('./assets/fonts/Caveat-VariableFont.ttf'),
    'Merriweather': require('./assets/fonts/Merriweather-VariableFont_opsz,wdth,wght.ttf'),
    'Nunito': require('./assets/fonts/Nunito-VariableFont_wght.ttf'),
  });

  // Esconde a splash screen quando as fontes estiverem carregadas
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Se as fontes não estiverem carregadas, não renderiza nada ainda
  if (!fontsLoaded) {
    return null;
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  let PageComponent = null;
  switch (currentScreen) {
    case 'home':
      PageComponent = <Home />;
      break;
    case 'notas':
      PageComponent = <Notes />;
      break;
    case 'tarefas':
      PageComponent = <Tasks />;
      break;
    case 'metas':
      PageComponent = <Goals />;
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
        <StatusBar 
          backgroundColor="#ddd0c2"
          translucent={true}
          barStyle="dark-content"
        />
        <SafeAreaView 
          style={{ flex: 1, backgroundColor: '#ddd0c2', alignItems: 'center', paddingTop: 0 }}
          onLayout={onLayoutRootView}>
          <View style={{ 
            width: '100%', 
            paddingHorizontal: 20, 
            marginTop: 40, 
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <LogoHeader />
            <Image 
              source={require('./assets/capybara.png')} 
              style={{ 
                width: 40, 
                height: 40, 
                resizeMode: 'contain'
              }} 
            />
          </View>
          {currentScreen !== 'config' && (
            <View style={{ width: '100%' }}>
              {/* Componente SearchBar não necessário aqui pois agora é renderizado diretamente dentro da tela Notes */}
            </View>
          )}
          {PageComponent}
          <Footer current={currentScreen} onNavigate={screen => setCurrentScreen(screen as PageKey)} />
        </SafeAreaView>
      </SQLite.SQLiteProvider>
    </>
  );
}
