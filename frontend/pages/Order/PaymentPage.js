import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';

const PaymentPage = ({ route, navigation }) => {
  const { transactionId } = route.params; // Mendapatkan transactionId dari parameter navigasi
  const [totalCost, setTotalCost] = useState('');
  const [damageDescription, setDamageDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!totalCost || !damageDescription) {
      setError('Harap isi semua kolom.');
      return;
    }
  
    try {
      const response = await fetch(`http://192.168.18.20:3000/api/transaction-mechanic/selesai/${transactionId}`, {
        method: 'PUT', // or POST depending on your backend
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalCost,
          damageDescription,
        }),
      });
  
      // Check if the response is OK (status code 200-299)
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const data = await response.json(); // Parse the JSON response
  
      // Check if the response contains success
      if (data.success) {
        Alert.alert('Sukses', 'Transaksi berhasil diselesaikan');
        navigation.navigate("Home2"); // Kembali ke daftar transaksi
      } else {
        Alert.alert('Error', 'Gagal menyelesaikan transaksi');
      }
    } catch (err) {
      console.error('Error menyelesaikan transaksi:', err);
      Alert.alert('Error', 'Terjadi kesalahan saat menyelesaikan transaksi');
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Selesaikan Transaksi</Text>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.transactionBox}>
        <TextInput
          style={styles.input}
          placeholder="Total Biaya"
          value={totalCost}
          keyboardType="numeric"
          onChangeText={setTotalCost}
        />

        <TextInput
          style={styles.input}
          placeholder="Deskripsi Kerusakan"
          value={damageDescription}
          onChangeText={setDamageDescription}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Kirim</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
    justifyContent: 'center', // Center the content vertically
    alignItems: 'center', // Center the content horizontally
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  transactionBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '100%', // Ensure inputs are not stretched too wide
    maxWidth: 400, // Limit the width of the input box
  },
  input: {
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 15,
    marginBottom: 15,
    backgroundColor: '#FFF',
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
    maxWidth: 400,
    marginTop: 20,
  },
  submitButtonText: {
    textAlign: 'center',
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PaymentPage;
