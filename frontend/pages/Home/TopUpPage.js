import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TopUpPage = () => {
  const [amount, setAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [userName, setUserName] = useState('');
  const [balance, setBalance] = useState(0);
  const navigation = useNavigation();

  const fetchBalance = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('Token tidak ditemukan');
        return;
      }
      const response = await fetch('http://192.168.18.20:3000/user/balance', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setBalance(data.balance);
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(0);
    }
  };

  const fetchUserName = async () => {
    try {
      const name = await AsyncStorage.getItem('name');
      setUserName(name);
    } catch (error) {
      console.error('Error fetching user name:', error);
      setUserName('User');
    }
  };

  useEffect(() => {
    console.log("refresh")
    fetchUserName();
    fetchBalance();
  }, []);

  const topUpOptions = [50000.00, 100000.00, 200000.00, 500000.00, 1000000.00];

  const handleTopUp = () => {
    if (!selectedAmount && !amount) {
      Alert.alert('Error', 'Silakan pilih atau masukkan nominal top-up!');
      return;
    }

    const topUpValue = selectedAmount || parseInt(amount);

    if (topUpValue <= 0) {
      Alert.alert('Error', 'Nominal top-up harus lebih besar dari 0!');
      return;
    }

    // Fetch transaction token and navigate to PaymentScreen
    fetchTransactionToken(topUpValue);
  };

  const fetchTransactionToken = async (topUpValue) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('Token tidak ditemukan');
        return;
      }

      const fullName = await AsyncStorage.getItem('fname');
      const email = await AsyncStorage.getItem('email');
      const phone = await AsyncStorage.getItem('phone');
  
      const response = await fetch('http://192.168.18.20:3000/api/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gross_amount: topUpValue,
          customer_details: {
            full_name: fullName || 'Default Name',
            email: email || 'user@example.com',
            phone: phone || '08111222333',
          },
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const snapToken = data.token;
        // Navigate to PaymentScreen with snapToken and topUpValue
        navigation.navigate('PaymentScreen', { snapToken, topUpValue });
      } else {
        console.error('Error:', data.error);
        Alert.alert('Error', 'Gagal mendapatkan token transaksi');
      }
    } catch (error) {
      console.error('Error fetching transaction token:', error);
      Alert.alert('Error', 'Gagal mendapatkan token transaksi');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
          <Icon name="arrow-left" size={24} color="#000" style={styles.icon} />
        </TouchableOpacity>
        <Text>Top Up</Text>
      </View>

      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome, {userName || 'User'}</Text>
      </View>

      <View style={styles.userBox}>
        <Text style={styles.userName}>{userName || 'User'}</Text>
        <Text style={styles.balanceText}>Rp {balance.toLocaleString('id-ID')}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Pilih nominal top-up</Text>

        <View style={styles.topUpBox}>
          <FlatList
            data={topUpOptions}
            keyExtractor={(item) => item.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.topUpOption, selectedAmount === item && styles.topUpOptionSelected]}
                onPress={() => setSelectedAmount(item)}
              >
                <Text style={[styles.topUpOptionText, selectedAmount === item && styles.topUpOptionTextSelected]}>
                  Rp{item.toLocaleString()}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <Text style={styles.label}>Atau masukkan nominal lainnya</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan nominal (Rp)"
          keyboardType="numeric"
          value={amount}
          onChangeText={(text) => {
            setAmount(text);
            setSelectedAmount(null);
          }}
        />

        <TouchableOpacity style={styles.topUpButton} onPress={handleTopUp}>
          <Text style={styles.topUpButtonText}>Top Up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  topUpButton: {
    backgroundColor: '#00ADB5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  topUpButtonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  userBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#00ADB5',
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  balance: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  topUpBox: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  topUpOption: {
    backgroundColor: '#FFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  topUpOptionSelected: {
    backgroundColor: '#00ADB5',
    borderColor: '#00ADB5',
  },
  topUpOptionText: {
    fontSize: 16,
    color: '#333',
  },
  topUpOptionTextSelected: {
    color: '#FFF',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
  }
});

export default TopUpPage;
