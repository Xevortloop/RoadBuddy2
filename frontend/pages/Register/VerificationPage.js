import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

export default function EmailVerificationPage({ route }) {
  const { email, userId } = route.params;
  const [enteredCode, setEnteredCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigation = useNavigation();

  const handleVerify = () => {
    if (!enteredCode) {
      Alert.alert('Error', 'Kode verifikasi tidak boleh kosong.');
      return;
    }
  
    setIsSubmitting(true);
    
    // Debug log sebelum mengirim request
    console.log('Entered Code:', enteredCode);
    
    axios.post('http://192.168.18.20:3000/verify-email', {
      userId,
      verificationCode: enteredCode,  // Kirim enteredCode yang dimasukkan pengguna
    })
    .then((response) => {
      if (response.data.success) {
        Alert.alert('Success', 'Email berhasil diverifikasi!');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', 'Kode verifikasi tidak valid. Silakan coba lagi.');
        setEnteredCode('');
      }
    })
    .catch((error) => {
      console.error(error.response ? error.response.data : error);
      Alert.alert('Error', 'Terjadi kesalahan. Silakan coba lagi nanti.');
    })
    .finally(() => {
      setIsSubmitting(false);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verifikasi Email</Text>
      <Text style={styles.subtitle}>
        Kode verifikasi telah dikirim ke email Anda: {email}
      </Text>
      <View style={styles.codeInputContainer}>
        <Text style={styles.inputLabel}>Masukkan Kode Verifikasi</Text>
        <TextInput
          style={styles.inputField}
          placeholder="Kode Verifikasi"
          keyboardType="numeric"
          maxLength={6}
          value={enteredCode}
          onChangeText={(text) => setEnteredCode(text)}
        />
      </View>
      <TouchableOpacity 
        style={styles.verifyButton} 
        onPress={handleVerify} 
        disabled={isSubmitting}
      >
        <Text style={styles.verifyButtonText}>
          {isSubmitting ? 'Memverifikasi...' : 'Verifikasi'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00ADB5',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  codeInputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  inputField: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#00ADB5',
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  verifyButton: {
    width: '100%',
    backgroundColor: '#00ADB5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
