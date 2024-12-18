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
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

export default function RegisterPageMechanic() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [plateLetter1, setPlateLetter1] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [plateLetter2, setPlateLetter2] = useState('');
  const [nik, setNik] = useState(''); // For storing NIK
  const navigation = useNavigation();

  const handleRegister = () => {
    const mechanicData = {
      full_name: fullName,
      username: username,
      email_user: email,
      phone_user: phone,
      password_user: password,
      plate_number: `${plateLetter1} ${plateNumber} ${plateLetter2}`,
      role_user: 'mechanic', // Default role as mechanic
      nik: nik, // NIK value
    };

    // Send data to the server using axios
    axios.post('http://192.168.18.20:3000/mechanic/register', mechanicData)
      .then((response) => {
        alert('Mechanic registered successfully!');
        navigation.navigate('Login');
      })
      .catch((error) => {
        console.error(error.response ? error.response.data : error);
        alert('Failed to register mechanic');
      });
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
          <Text style={styles.title}>Register as Mechanic</Text>
          <Text style={styles.subtitle}>Please fill in the details</Text>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nama Lengkap"
              value={fullName}
              onChangeText={(text) => setFullName(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={(text) => setUsername(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="No Telepon"
              value={phone}
              onChangeText={(text) => setPhone(text)}
              keyboardType="phone-pad"
            />

            {/* Input Plat Nomor */}
            <View style={styles.plateContainer}>
              <TextInput
                style={[styles.input, styles.plateInput]}
                placeholder="AB"
                value={plateLetter1}
                onChangeText={(text) => setPlateLetter1(text.toUpperCase())}
                maxLength={2}
              />
              <TextInput
                style={[styles.input, styles.plateInput]}
                placeholder="1234"
                value={plateNumber}
                onChangeText={setPlateNumber}
                keyboardType="numeric"
                maxLength={4}
              />
              <TextInput
                style={[styles.input, styles.plateInput]}
                placeholder="CD"
                value={plateLetter2}
                onChangeText={(text) => setPlateLetter2(text.toUpperCase())}
                maxLength={3}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nomor NIK"
              value={nik}
              onChangeText={(text) => setNik(text)}
              keyboardType="numeric"
              maxLength={16} // Adjust length based on NIK format
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

            {/* Input NIK */}

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>Daftar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginRedirectText}>
                Sudah punya akun? <Text style={styles.loginLink}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
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
  plateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  plateInput: {
    flex: 1,
    marginHorizontal: 5,
    textAlign: 'center',
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
  registerButton: {
    width: '100%',
    backgroundColor: '#00ADB5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginRedirectText: {
    fontSize: 14,
    color: '#fff',
  },
  loginLink: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
});
