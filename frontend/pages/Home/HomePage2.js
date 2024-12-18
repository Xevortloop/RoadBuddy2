import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomePageScreen2() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');  // Menyimpan nama pengguna
  const [balance, setBalance] = useState(0); // Default saldo

  const fetchBalance = async () => {
    try {
      const token = await AsyncStorage.getItem('token'); // Ambil token dari AsyncStorage
  
      if (!token) {
        console.error('Token tidak ditemukan');
        return;
      }
  
      const response = await fetch('http://192.168.18.20:3000/mechanic/balance', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Kirim token dalam header
        },
      });
  
      const data = await response.json();
      
      if (response.ok) {
        setBalance(data.balance); // Set saldo ke state
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(0); // Default saldo 0 jika ada error
    }
  };
  
  
  
  // Fungsi untuk mengambil nama pengguna dari API
  const fetchUserName = async () => {
    try {
      const name = await AsyncStorage.getItem('name');
      console.log(name)
      
      // Asumsikan data API mengembalikan objek dengan properti `name`
      setUserName(name); 
    } catch (error) {
      console.error('Error fetching user name:', error);
      setUserName('User'); // Jika terjadi error, tampilkan 'User'
    }
  };

  // Mengambil nama pengguna saat komponen pertama kali dimuat
  useEffect(() => {
    fetchUserName(); // Memuat nama pengguna
    fetchBalance();  // Memuat saldo pengguna
  }, []);

  return (
    <View style={styles.container}>
      {/* Welcome User Section */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome, {userName || 'User'}</Text> {/* Tampilkan nama pengguna */}
      </View>

      {/* RoadPay Box with Top Up Button */}
      <View style={styles.roadPayBox}>
        <View style={styles.roadPayContainer}>
          <Text style={styles.roadPayText}>RoadPay</Text>
          <Text style={styles.balanceText}>Rp {typeof balance === 'number' ? balance.toLocaleString('id-ID') : '0'}</Text>  
          <TouchableOpacity style={styles.historyButton}>
            <Text style={styles.historyText}>Tap for History</Text>
          </TouchableOpacity>
        </View>
        {/* Top Up Button */}
        <TouchableOpacity style={styles.topUpButton} onPress={() => navigation.navigate('TopUpPage')}>
          <Text style={styles.topUpText}>Top Up</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Category Section */}
      <View style={styles.menuCategorySection}>
        <Text style={styles.menuCategoryText}>Menu Category</Text>
        <View style={styles.menuCategoryContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('TakeOrder')}  >
            <Image source={require('../../assets/lokasi.png')} style={styles.icon} />
            <Text style={styles.menuText}>Take Order</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              console.log("Navigating to TransaksiMechanic...");
              navigation.navigate('TransaksiMechanic');
            }}
          >
            <Image source={require('../../assets/transaksi.png')} style={styles.icon} />
            <Text style={styles.menuText}>Transaksi</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('Login')}>
        <View style={styles.logoutContainer}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </View>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="home-outline" size={24} color="#333" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="settings-outline" size={24} color="#333" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="person-outline" size={24} color="#333" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  welcomeContainer: {
    marginTop: 40,
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  roadPayBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#00ADB5',
    padding: 20,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roadPayContainer: {
    flexDirection: 'column',
  },
  roadPayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ADB5',
    marginBottom: 5,
  },
  balanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  historyButton: {
    marginTop: 10,
  },
  historyText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: 'bold',
  },
  topUpButton: {
    backgroundColor: '#00ADB5',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topUpText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  menuCategorySection: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -250,  // Increased margin to create more space between RoadPay and Menu Category
  },
  menuCategoryText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  menuCategoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  menuItem: {
    alignItems: 'center',
  },
  icon: {
    width: 60,
    height: 60,
    marginBottom: 10,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
    padding: 10,
  },
  menuText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: '80%',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  navButton: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#333',
  },
});
