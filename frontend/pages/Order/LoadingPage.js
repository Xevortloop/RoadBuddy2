import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

const LoadingPage = () => {
  const [loading, setLoading] = useState(true);

  // Simulasi penantian verifikasi mekanik
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);  // Setelah beberapa detik, berikan hasil verifikasi
    }, 5000); // 5 detik simulasi verifikasi
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Text>Transaksi telah diverifikasi dan sedang diproses!</Text>
      )}
    </View>
  );
};

export default LoadingPage;
