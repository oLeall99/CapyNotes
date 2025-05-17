import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Evita que a tela de splash seja escondida automaticamente
SplashScreen.preventAutoHideAsync();

const LogoHeader: React.FC = () => {
  // Carrega as fontes com o hook useFonts
  const [fontsLoaded] = useFonts({
    'Jua': require('../../assets/fonts/Jua-Regular.ttf'),
    'Caveat': require('../../assets/fonts/Caveat-VariableFont.ttf'),
  });

  // Este useEffect vai esconder a tela de splash quando as fontes estiverem carregadas
  useEffect(() => {
    const hideSplash = async () => {
      if (fontsLoaded) {
        // Esconde a tela de splash quando as fontes carregarem
        await SplashScreen.hideAsync();
      }
    };

    hideSplash();
  }, [fontsLoaded]);

  // Se as fontes ainda não foram carregadas, retorna null
  // A tela de splash permanecerá visível
  if (!fontsLoaded) {
    return null;
  }

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