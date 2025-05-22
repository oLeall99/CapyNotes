import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  submessage?: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  submessage,
  onCancel,
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmButtonColor = '#FF6B6B'
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      statusBarTranslucent={false}
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.confirmModalContent}>
          <Text style={styles.confirmTitle}>{title}</Text>
          <Text style={styles.confirmText}>{message}</Text>
          {submessage && <Text style={styles.confirmText}>{submessage}</Text>}
          
          <View style={styles.confirmButtonsContainer}>
            <TouchableOpacity 
              style={[styles.confirmButton, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.confirmButtonText}>{cancelText}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.confirmButton, styles.deleteButton, { backgroundColor: confirmButtonColor }]}
              onPress={onConfirm}
            >
              <Text style={[styles.confirmButtonText, styles.deleteButtonText]}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
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
  confirmModalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#554b46',
    marginBottom: 15,
    textAlign: 'center',
  },
  confirmText: {
    fontSize: 16,
    color: '#554b46',
    marginBottom: 5,
    textAlign: 'center',
  },
  confirmButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
  },
  confirmButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#554b46',
  },
  deleteButtonText: {
    color: '#fff',
  },
});

export default ConfirmationModal; 