import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  TouchableWithoutFeedback, 
  Keyboard, 
  ScrollView,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Goal } from '../../db/services/goalService';

interface GoalFormModalProps {
  visible: boolean;
  goal: Goal | null;
  onClose: () => void;
  onSave: (titulo: string, descricao: string, valorInicial: number, valorAtual: number, valorFinal: number, tipo: 'inteiro' | 'dinheiro') => void;
}

const GoalFormModal: React.FC<GoalFormModalProps> = ({
  visible,
  goal,
  onClose,
  onSave
}) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valorInicial, setValorInicial] = useState('0');
  const [valorAtual, setValorAtual] = useState('0');
  const [valorFinal, setValorFinal] = useState('0');
  const [tipo, setTipo] = useState<'inteiro' | 'dinheiro'>('inteiro');

  useEffect(() => {
    if (goal) {
      setTitulo(goal.titulo);
      setDescricao(goal.descricao || '');
      setValorInicial(goal.valorInicial.toString());
      setValorAtual(goal.valorAtual.toString());
      setValorFinal(goal.valorFinal.toString());
      setTipo(goal.tipo);
    } else {
      // Valores padrão para nova meta
      setTitulo('');
      setDescricao('');
      setValorInicial('0');
      setValorAtual('0');
      setValorFinal('100');
      setTipo('inteiro');
    }
  }, [goal, visible]);

  const handleSave = () => {
    // Validação básica
    if (!titulo.trim()) {
      alert('O título é obrigatório');
      return;
    }

    const vInicial = parseFloat(valorInicial);
    const vAtual = parseFloat(valorAtual);
    const vFinal = parseFloat(valorFinal);

    if (isNaN(vInicial) || isNaN(vAtual) || isNaN(vFinal)) {
      alert('Valores numéricos inválidos');
      return;
    }

    if (vFinal <= vInicial) {
      alert('O valor final deve ser maior que o valor inicial');
      return;
    }

    if (vAtual < vInicial || vAtual > vFinal) {
      alert('O valor atual deve estar entre o valor inicial e final');
      return;
    }

    onSave(
      titulo, 
      descricao, 
      vInicial, 
      vAtual, 
      vFinal, 
      tipo
    );
    
    // Limpar formulário
    setTitulo('');
    setDescricao('');
    setValorInicial('0');
    setValorAtual('0');
    setValorFinal('100');
    setTipo('inteiro');
  };

  const formatarValorInput = (valor: string, inputType: 'inicial' | 'atual' | 'final') => {
    // Remove caracteres não numéricos, exceto o ponto decimal
    let valorLimpo = valor.replace(/[^\d.]/g, '');
    
    // Garante apenas um ponto decimal
    const pontos = valorLimpo.split('.').length - 1;
    if (pontos > 1) {
      const partes = valorLimpo.split('.');
      valorLimpo = partes[0] + '.' + partes.slice(1).join('');
    }
    
    // Atualiza o estado correto
    switch (inputType) {
      case 'inicial':
        setValorInicial(valorLimpo);
        break;
      case 'atual':
        setValorAtual(valorLimpo);
        break;
      case 'final':
        setValorFinal(valorLimpo);
        break;
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.header}>
              <Text style={styles.modalTitle}>
                {goal ? 'Editar Meta' : 'Nova Meta'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <AntDesign name="close" size={24} color="#554b46" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Título*</Text>
                <TextInput
                  style={styles.input}
                  value={titulo}
                  onChangeText={setTitulo}
                  placeholder="Nome da meta"
                  maxLength={50}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descrição</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={descricao}
                  onChangeText={setDescricao}
                  placeholder="Descreva sua meta (opcional)"
                  multiline
                  numberOfLines={4}
                  maxLength={200}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={styles.tipoContainer}>
                  <Text style={styles.label}>Tipo</Text>
                  <View style={styles.tipoSelector}>
                    <TouchableOpacity 
                      style={[
                        styles.tipoButton, 
                        tipo === 'inteiro' && styles.tipoButtonActive
                      ]}
                      onPress={() => setTipo('inteiro')}
                    >
                      <Text style={tipo === 'inteiro' ? styles.tipoTextActive : styles.tipoText}>
                        Inteiro
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.tipoButton, 
                        tipo === 'dinheiro' && styles.tipoButtonActive
                      ]}
                      onPress={() => setTipo('dinheiro')}
                    >
                      <Text style={tipo === 'dinheiro' ? styles.tipoTextActive : styles.tipoText}>
                        Dinheiro
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Valor Inicial</Text>
                <View style={styles.valorInputContainer}>
                  {tipo === 'dinheiro' && <Text style={styles.currencySymbol}>R$</Text>}
                  <TextInput
                    style={styles.valorInput}
                    value={valorInicial}
                    onChangeText={(text) => formatarValorInput(text, 'inicial')}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Valor Atual</Text>
                <View style={styles.valorInputContainer}>
                  {tipo === 'dinheiro' && <Text style={styles.currencySymbol}>R$</Text>}
                  <TextInput
                    style={styles.valorInput}
                    value={valorAtual}
                    onChangeText={(text) => formatarValorInput(text, 'atual')}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Valor Final</Text>
                <View style={styles.valorInputContainer}>
                  {tipo === 'dinheiro' && <Text style={styles.currencySymbol}>R$</Text>}
                  <TextInput
                    style={styles.valorInput}
                    value={valorFinal}
                    onChangeText={(text) => formatarValorInput(text, 'final')}
                    keyboardType="numeric"
                    placeholder="100"
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#554b46',
    fontFamily: 'Nunito',
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: '#554b46',
    fontFamily: 'Nunito',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#554b46',
    fontFamily: 'Nunito',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  tipoContainer: {
    flex: 1,
  },
  tipoSelector: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tipoButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  tipoButtonActive: {
    backgroundColor: '#554b46',
  },
  tipoText: {
    color: '#554b46',
    fontFamily: 'Nunito',
  },
  tipoTextActive: {
    color: 'white',
    fontFamily: 'Nunito',
  },
  valorInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  currencySymbol: {
    paddingLeft: 12,
    fontSize: 16,
    color: '#554b46',
    fontFamily: 'Nunito',
  },
  valorInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#554b46',
    fontFamily: 'Nunito',
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#554b46',
  },
  cancelButtonText: {
    color: '#554b46',
    fontWeight: 'bold',
    fontFamily: 'Nunito',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Nunito',
  },
});

export default GoalFormModal; 