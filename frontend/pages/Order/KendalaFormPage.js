import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const FormKendala = () => {
  const [platNomor, setPlatNomor] = useState('');
  const [kendala, setKendala] = useState('');

  const handleSubmit = () => {
    if (platNomor === '' || kendala === '') {
      Alert.alert('Error', 'Harap isi semua kolom!');
    } else {
      // Proses data (misalnya simpan ke database atau kirim ke server)
      console.log('Plat Nomor:', platNomor);
      console.log('Kendala:', kendala);
      Alert.alert('Sukses', 'Data telah berhasil dikirim!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Form Kendala</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Masukkan Plat Nomor"
        value={platNomor}
        onChangeText={setPlatNomor}
      />

      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Masukkan Deskripsi Kendala"
        value={kendala}
        onChangeText={setKendala}
        multiline={true}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Kirim</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top', // Agar teks dimulai dari atas pada textarea
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FormKendala;
