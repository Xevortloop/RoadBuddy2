import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Linking, Platform, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TransactionUser = () => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Fetch userId from AsyncStorage
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('idUser');
        if (id) {
          setUserId(id);
        } else {
          setError('User ID not found in storage.');
        }
      } catch (err) {
        console.error('Error reading AsyncStorage:', err);
      }
    };

    loadUserId();
  }, []);

  // Fetch transactions based on userId
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId) return;

      try {
        const response = await axios.get(`http://192.168.18.20:3000/transaksi/user/${userId}`);
        if (response.data.success && Array.isArray(response.data.transactions)) {
          setTransactions(response.data.transactions);
        } else {
          setError('No transactions found.');
        }
      } catch (err) {
        setError('Error fetching transactions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId]);

  // Handle chat click and navigate to ChatPage
  const handleChatClick = async (transactionId) => {
    try {
      const response = await axios.get(`http://192.168.18.20:3000/api/chat/${transactionId}`);
      if (response.data.success) {
        const { userId, mechanicId } = response.data;
        if (!userId || !mechanicId) {
          console.error('User ID or Mechanic ID is missing');
          return;
        }
        navigation.navigate('ChatPage', { userId, mechanicId, transactionId });
      } else {
        console.log('Transaction not found');
      }
    } catch (error) {
      console.error('Error fetching chat data:', error);
    }
  };

  const handleOpenMap = (latitude, longitude) => {
    let url = '';
    if (Platform.OS === 'ios') {
      url = `maps:0,0?q=${latitude},${longitude}`;
    } else {
      url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    }

    Linking.openURL(url).catch((err) => console.error('Error opening map:', err));
  };

  // Handle transaction completion

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00ADB5" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
          <Icon name="arrow-left" size={24} color="#000" style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Active Transactions</Text>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id_transaksi.toString()}
        renderItem={({ item }) => (
          <View style={styles.transactionBox}>
            <Text style={[styles.locationText, styles.boldText]}>Location: {item.lokasi}</Text>
            <Text style={[styles.statusText, styles.boldText]}>Status: {item.status}</Text>
            <Text style={[styles.dateText, styles.boldText]}>Created At: {new Date(item.created_at).toLocaleString()}</Text>
            <Text style={[styles.userNameText, styles.boldText]}>Username: {item.user_name}</Text>
            
            {/* Display Mechanic's Full Name and License Plate */}
            <Text style={[styles.mechanicNameText, styles.boldText]}>Mechanic: {item.mechanic_name}</Text>
            <Text style={[styles.licensePlateText, styles.boldText]}>License Plate: {item.license_plate}</Text>

            <View style={styles.iconContainer}>
              {/* Chat Icon */}
              <TouchableOpacity onPress={() => handleChatClick(item.id_transaksi)}>
                <Icon name="comments" size={24} color="#00ADB5" />
              </TouchableOpacity>

              {/* Open Map Icon */}

              {/* Complete Transaction Icon */}

            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 50,
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
  },
  locationText: {
    fontSize: 16,
    color: '#333',
  },
  statusText: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  userNameText: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  mechanicNameText: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  licensePlateText: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  mapIcon: {
    marginLeft: 15,
  },
  completeIcon: {
    marginLeft: 15,
  },
  boldText: {
    fontWeight: 'bold',
  },
});

export default TransactionUser;
