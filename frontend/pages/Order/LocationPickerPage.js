import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Impor AsyncStorage
import MapView, { Marker } from 'react-native-maps'; // Impor MapView dan Marker
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const LocationPicker = () => {
  const navigation = useNavigation();
  const [platNomor, setPlatNomor] = useState('');
  const [kendala, setKendala] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [error, setError] = useState('');
  const [isLocationSelected, setIsLocationSelected] = useState(false); // Untuk cek apakah lokasi sudah dipilih

  // Mendapatkan lokasi pengguna
  const getLiveLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Izin akses lokasi ditolak.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      setLokasi('Lokasi Terpilih');
      setIsLocationSelected(true); // Menandakan lokasi sudah dipilih
      setError('');
    } catch (error) {
      setError('Gagal mendapatkan lokasi');
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    // Pastikan semua kolom terisi
    if (platNomor === '' || kendala === '' || lokasi === '' || latitude === 0 || longitude === 0) {
      Alert.alert('Error', 'Harap isi semua kolom!');
      return;
    }

    try {
      // Mengambil userId dari AsyncStorage
      const userId = await AsyncStorage.getItem('idUser');
      
      // Periksa apakah userId ada
      if (!userId) {
        Alert.alert('Error', 'Anda harus login terlebih dahulu!');
        return;
      }

      // Siapkan data untuk dikirim
      const data = {
        platNomor,
        kendala,
        lokasi,
        latitude,
        longitude,
        userId, // Sertakan userId
      };

      // Kirim data ke API
      fetch('http://192.168.18.20:3000/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((responseData) => {
          if (responseData.success) {
            Alert.alert('Sukses', 'Data telah berhasil dikirim!');
            // Reset form
            setPlatNomor('');
            setKendala('');
            setLokasi('');
            setLatitude(0);
            setLongitude(0);
            setIsLocationSelected(false);
          } else {
            Alert.alert('Error', responseData.error || 'Terjadi kesalahan!');
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          Alert.alert('Error', 'Terjadi kesalahan saat mengirim data!');
        });
    } catch (error) {
      console.error('Error retrieving userId from AsyncStorage:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat mengambil userId!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Form Kendala & Lokasi</Text>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home2')}>
          <Icon name="arrow-left" size={24} color="#000" style={styles.icon} />
        </TouchableOpacity>

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
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="Masukkan Lokasi"
        value={lokasi}
        editable={false} // Lokasi diambil otomatis
      />

      <TouchableOpacity style={styles.button} onPress={getLiveLocation}>
        <Text style={styles.buttonText}>Ambil Lokasi Saya</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Tampilkan peta jika lokasi sudah dipilih */}
      {isLocationSelected && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker coordinate={{ latitude, longitude }} title="Lokasi Anda" />
        </MapView>
      )}

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
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  map: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  icon: {
    color: '#000',
  },
});

export default LocationPicker;


// import React, { useState, useEffect } from 'react';
// import { View, StyleSheet, Text } from 'react-native';
// import { WebView } from 'react-native-webview';

// const LocationPicker = () => {
//   const [coords, setCoords] = useState(null);

//   useEffect(() => {
//     // Menetapkan lokasi Jogja
//     setCoords({
//       latitude: -7.7956, // Koordinat latitude Yogyakarta
//       longitude: 110.3695, // Koordinat longitude Yogyakarta
//     });
//   }, []);

//   if (!coords) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text>Loading...</Text>
//       </View>
//     );
//   }

//   // Membuat URL embeddable OpenStreetMap
//   const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.longitude - 0.02}%2C${coords.latitude - 0.02}%2C${coords.longitude + 0.02}%2C${coords.latitude + 0.02}&layer=mapnik&marker=${coords.latitude}%2C${coords.longitude}`;

//   return (
//     <View style={styles.container}>
//       <WebView
//         style={styles.map}
//         source={{
//           uri: osmUrl,
//         }}
//         javaScriptEnabled={true} // Aktifkan JavaScript
//         scalesPageToFit={true} // Memastikan peta bisa discroll
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   map: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// export default LocationPicker;
