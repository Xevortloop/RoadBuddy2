import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function EmailVerificationPage({ route }) {
  const { email, verificationCode } = route.params; // Data dari halaman sebelumnya
  const navigation = useNavigation();

  const handleContinue = () => {
    // Navigasi ke halaman berikutnya setelah verifikasi
    navigation.navigate('Login'); // Ubah sesuai kebutuhan Anda
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verifikasi Email</Text>
      <Text style={styles.subtitle}>
        Kode verifikasi telah dikirim ke email Anda: {email}
      </Text>
      <View style={styles.codeContainer}>
        <Text style={styles.verificationCode}>{verificationCode}</Text>
      </View>
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Lanjutkan</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  codeContainer: {
    backgroundColor: '#e0f7fa',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  verificationCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007BFF',
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
