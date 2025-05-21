import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Note } from '../../db/services/noteService';

interface NoteFormModalProps {
  visible: boolean;
  note: Note | null;
  onClose: () => void;
  onSave: (titulo: string, conteudo: string, imagem: string | null) => void;
}

const NoteFormModal: React.FC<NoteFormModalProps> = ({
  visible,
  note,
  onClose,
  onSave
}) => {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [imagem, setImagem] = useState<string | null>(null);

  useEffect(() => {
    if (note) {
      setTitulo(note.titulo);
      setConteudo(note.conteudo || '');
      setImagem(note.imagem || null);
    } else {
      resetForm();
    }
  }, [note, visible]);

  const resetForm = () => {
    setTitulo('');
    setConteudo('');
    setImagem(null);
  };

  const handleSave = () => {
    if (!titulo.trim()) {
      alert("O título é obrigatório!");
      return;
    }
    
    onSave(titulo, conteudo, imagem);
    resetForm();
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImagem(result.assets[0].uri);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {note?.id ? 'Editar Nota' : 'Nova Nota'}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Feather name="x" size={24} color="#554b46" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <Text style={styles.label}>Título</Text>
            <TextInput
              style={styles.input}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Digite o título da nota"
            />

            <Text style={styles.label}>Conteúdo</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={conteudo}
              onChangeText={setConteudo}
              placeholder="Digite o conteúdo da nota"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Imagem</Text>
            <TouchableOpacity style={styles.imageSelector} onPress={pickImage}>
              {imagem ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: imagem }} style={styles.previewImage} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => setImagem(null)}
                  >
                    <Feather name="x-circle" size={24} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Feather name="image" size={24} color="#aaa" />
                  <Text style={styles.imagePlaceholderText}>Selecionar imagem</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>
                {note?.id ? 'Atualizar' : 'Salvar Nota'}
              </Text>
            </TouchableOpacity>
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
  },
  formContainer: {
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#554b46',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  textArea: {
    height: 100,
  },
  imageSelector: {
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 5,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: '#aaa',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 5,
    zIndex: 1,
  },
  saveButton: {
    backgroundColor: '#554b46',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default NoteFormModal; 