import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Image } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { Note } from '../../db/services/noteService';

interface NoteDetailModalProps {
  visible: boolean;
  note: Note | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: number) => void;
}

const NoteDetailModal: React.FC<NoteDetailModalProps> = ({
  visible,
  note,
  onClose,
  onEdit,
  onDelete
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      statusBarTranslucent={false}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text 
              style={styles.modalTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {note?.titulo}
            </Text>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.headerActionButton}
                onPress={onEdit}
              >
                <MaterialIcons name="edit" size={24} color="#FFD700" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.headerActionButton}
                onPress={() => note?.id && onDelete(note.id)}
              >
                <MaterialIcons name="delete" size={24} color="#FF6B6B" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.headerActionButton}
                onPress={onClose}
              >
                <Feather name="x" size={24} color="#554b46" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.formContainer}>
            {note?.imagem ? (
              <Image 
                source={{ uri: note.imagem }} 
                style={styles.detailImage} 
                resizeMode="contain"
              />
            ) : null}
            
            {note?.tags && note.tags.length > 0 && (
              <View style={styles.tagsSection}>
                <Text style={styles.sectionTitle}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {note.tags.map(tag => (
                    <View 
                      key={tag.id} 
                      style={[styles.tagBadge, { backgroundColor: tag.color || '#808080' }]}
                    >
                      <Text style={styles.tagText}>{tag.titulo}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            <Text style={styles.sectionTitle}>Conteúdo</Text>
            {note?.conteudo ? (
              <Text style={styles.detailContent}>{note.conteudo}</Text>
            ) : (
              <Text style={styles.noContentText}>Essa nota não possui conteúdo.</Text>
            )}
            
            <View style={styles.detailDates}>
              <Text style={styles.detailDate}>
                Criado em: {note?.createdAt 
                  ? new Date(note.createdAt).toLocaleString('pt-BR') 
                  : ''}
              </Text>
              
              <Text style={styles.detailDate}>
                Atualizado em: {note?.updatedAt 
                  ? new Date(note.updatedAt).toLocaleString('pt-BR') 
                  : ''}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#554b46',
    flex: 1,
    marginRight: 10,
    fontFamily: 'Nunito',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    marginLeft: 8,
    padding: 5,
  },
  formContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#554b46',
    marginBottom: 8,
    marginTop: 8,
    fontFamily: 'Nunito',
  },
  tagsSection: {
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    fontFamily: 'Nunito',
  },
  detailImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailContent: {
    fontSize: 16,
    color: '#554b46',
    lineHeight: 24,
    marginBottom: 20,
    fontFamily: 'Nunito',
  },
  noContentText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Nunito',
  },
  detailDates: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  detailDate: {
    fontSize: 14,
    color: '#888',
    textAlign: 'right',
    marginTop: 5,
    fontFamily: 'Nunito',
  },
});

export default NoteDetailModal; 