import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigation = useNavigation();
  const handleLogin = async () => {
    if (!email || !password) {
      alert('Email dan password wajib diisi!');
      return;
    }
  
    const userData = { email, password };
  
    try {
      const response = await axios.post('http://192.168.18.20:3000/login', userData);
  
      console.log('Server Response:', response.data);
      const { token, name, phone, email, fullname, idUser, role } = response.data;
  
      if (!token || !name) {
        throw new Error('Data tidak valid dari server.');
      }
  
      // Store data in AsyncStorage
      await AsyncStorage.setItem('idUser', JSON.stringify(idUser));
      await AsyncStorage.setItem('fname', fullname);
      await AsyncStorage.setItem('email', email);
      await AsyncStorage.setItem('phone', phone);
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('name', name);
      await AsyncStorage.setItem('role', role);
  
      alert('Login berhasil!');
      
      // Navigate based on user role
      if (role === 'user') {
        navigation.navigate('Home');
      } else if (role === 'mechanic') {
        navigation.navigate('Home2');
      }
    } catch (error) {
      if (error.response) {
        console.error('Error:', error.response.data);
        // Provide more detailed feedback from the server
        alert(error.response.data.error || 'Login gagal! Periksa kembali email dan password Anda.');
      } else {
        console.error('Error:', error);
        alert('Gagal terhubung ke server. Pastikan perangkat Anda terkoneksi ke jaringan.');
      }
    }
  };
  
  

  const handleChoice = (choice) => {
    setIsModalVisible(false);
    if (choice === 'User') {
      navigation.navigate('RegisterUser');
    } else if (choice === 'Mechanic') {
      navigation.navigate('RegisterMechanic');
    }
  };

  const navigateToForgotPassword = () => {
    alert('Fitur lupa password sedang dalam pengembangan.');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ImageBackground
        source={{ uri: 'https://your-image-url.com/background.jpg' }}
        style={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>RoadBuddy</Text>
          <Text style={styles.subtitle}>Login to your account</Text>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Password"
                value={password}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.showPasswordButton}
              >
                <Text style={styles.showPasswordText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsModalVisible(true)}>
              <Text style={styles.registerText}>
                Belum punya akun? <Text style={styles.registerLink}>Daftar</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={navigateToForgotPassword}>
              <Text style={styles.forgotPasswordText}>
                Lupa Password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Modal untuk memilih antara User atau Mechanic */}
          <Modal
            visible={isModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setIsModalVisible(false)}
          >
            <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
              <View style={styles.modalOverlay} />
            </TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Pilih Role</Text>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => handleChoice('User')}
              >
                <Icon name="user" size={24} color="#fff" style={styles.icon} />
                <Text style={styles.modalButtonText}>Daftar sebagai User</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => handleChoice('Mechanic')}
              >
                <Icon name="wrench" size={24} color="#fff" style={styles.icon} />
                <Text style={styles.modalButtonText}>Daftar sebagai Mechanic</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 20,
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  inputPassword: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  showPasswordButton: {
    marginLeft: 10,
  },
  showPasswordText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#00ADB5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerText: {
    fontSize: 14,
    color: '#fff',
  },
  registerLink: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignSelf: 'center',
    position: 'absolute',
    top: '30%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00ADB5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
  closeButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
