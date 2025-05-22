import React from 'react';
import { View, Text, StyleSheet, Image, Linking, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import LogoHeader from '../Logo/LogoHeader';

interface AboutComponentProps {
  title?: string;
}

const AboutComponent: React.FC<AboutComponentProps> = ({ title = 'Sobre o Aplicativo' }) => {
  
  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Erro ao abrir o link:', err));
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.appInfoSection}>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/capynotes-icon.png')} style={styles.logo} />
            <LogoHeader/>
            <Text style={styles.appVersion}>Versão 1.0.0</Text>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description}>
            Capy Notes é um aplicativo de organização pessoal que permite gerenciar notas, tarefas e metas em um único lugar.
            Organize suas ideias, acompanhe seus objetivos e mantenha-se produtivo com uma interface simples e intuitiva.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Funcionalidades</Text>
          
          <View style={styles.featureItem}>
            <MaterialIcons name="note" size={24} color="#554b46" style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Notas</Text>
              <Text style={styles.featureDescription}>Crie e organize suas anotações com imagens e marcações.</Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <MaterialIcons name="check-circle" size={24} color="#554b46" style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Tarefas</Text>
              <Text style={styles.featureDescription}>Gerencie suas tarefas diárias e acompanhe seu progresso.</Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <MaterialIcons name="emoji-events" size={24} color="#554b46" style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Metas</Text>
              <Text style={styles.featureDescription}>Defina metas e acompanhe seu progresso ao longo do tempo.</Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <MaterialIcons name="label" size={24} color="#554b46" style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Tags</Text>
              <Text style={styles.featureDescription}>Organize itens com tags coloridas personalizáveis.</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Contato</Text>
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleLinkPress('https://github.com/oLeall99/notes-app')}
          >
            <Feather name="github" size={24} color="#554b46" style={styles.contactIcon} />
            <Text style={styles.contactText}>GitHub</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleLinkPress('mailto:art5mussio@outlook.com')}
          >
            <MaterialIcons name="email" size={24} color="#554b46" style={styles.contactIcon} />
            <Text style={styles.contactText}>art5mussio@outlook.com</Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Desenvolvido por</Text>
            <Text style={styles.description}>Artur Leal Mussio</Text>
          <View style={styles.divider} />
          
          <Text style={styles.copyright}>© 2025 Capy Notes. Todos os direitos reservados.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#554b46',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Nunito',
  },
  content: {
    flex: 1,
  },
  appInfoSection: {
    padding: 20,
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginBottom: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Nunito',
  },
  appVersion: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: 'Nunito',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#554b46',
    marginBottom: 12,
    fontFamily: 'Nunito',
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    fontFamily: 'Nunito',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'Nunito',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontFamily: 'Nunito',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactIcon: {
    marginRight: 12,
  },
  contactText: {
    fontSize: 16,
    color: '#555',
    fontFamily: 'Nunito',
  },
  copyright: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Nunito',
  },
});

export default AboutComponent; 