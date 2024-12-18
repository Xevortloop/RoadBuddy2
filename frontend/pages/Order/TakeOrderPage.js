import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TakeOrderPage() {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [isLocationSelected, setIsLocationSelected] = useState(false);

  // Fetch transactions from API
  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://192.168.18.20:3000/list-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending' }), // filter by pending status
      });
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle taking an order
  const handleTakeOrder = (mechanicId, transactionId, lokasi, lat, long) => {
    setLatitude(lat);
    setLongitude(long);
    setIsLocationSelected(true);
  
    Alert.alert('Konfirmasi', 'Apakah Anda yakin ingin mengambil transaksi ini?', [
      {
        text: 'Batal',
        style: 'cancel',
      },
      {
        text: 'Ambil Transaksi',
        onPress: async () => {
          try {
            // Retrieve mechanicId from AsyncStorage (if it's not null)
            const mechanicId = await AsyncStorage.getItem('idUser');
  
            // Check if mechanicId is retrieved correctly
            if (!mechanicId) {
              Alert.alert('Error', 'Tidak ada ID mekanik yang ditemukan!');
              return;
            }  
            console.log(mechanicId)
  
            // Prepare the request payload
            const payload = {
              mechanicId: mechanicId,
              lokasi: lokasi,
              latitude: lat,
              longitude: long,
            };
  
            // Send PUT request to update transaction status
            const response = await fetch(`http://192.168.18.20:3000/transaksi/${transactionId}/ambil`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload), // Send the payload with mechanicId
            });
  
            const result = await response.json();
  
            // Handle response based on the result
            if (result.success) {
              Alert.alert('Berhasil', 'Transaksi berhasil diambil.');
              fetchTransactions(); // Refresh the transaction list
            } else {
              Alert.alert('Gagal', 'Gagal mengambil transaksi.');
            }
          } catch (error) {
            console.error('Error taking order:', error);
            Alert.alert('Error', 'Terjadi kesalahan saat mengambil transaksi.');
          }
        },
      },
    ]);
  };
  

  useEffect(() => {
    fetchTransactions(); // Load transactions on mount
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.transactionItem} onPress={() => handleTakeOrder(item.mechanicId, item.id_transaksi, item.lokasi, item.latitude, item.longitude)}>
      <View style={styles.transactionBox}>
        <Text style={styles.transactionText}>Lokasi: {item.lokasi}</Text>
        <Text style={styles.transactionText}>Plat Nomor: {item.plat_nomor}</Text>
        <Text style={styles.transactionText}>Status: {item.status}</Text>
        <Text style={styles.transactionText}>Kendala: {item.kendala}</Text>
        <Text style={styles.transactionText}>Waktu: {new Date(item.created_at).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home2')}>
          <Icon name="arrow-left" size={24} color="#000" style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Daftar Transaksi Tersedia</Text>
      </View>

      {isLocationSelected && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker coordinate={{ latitude: latitude, longitude: longitude }} title="Lokasi Anda" />
        </MapView>
      )}

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id_transaksi.toString()}
        />
      )}
    </View>
  );
}

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
  icon: {
    color: '#000',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 20,
  },
  transactionItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  transactionBox: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  transactionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  map: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
  },
});
