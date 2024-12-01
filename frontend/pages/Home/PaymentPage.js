import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';


const PaymentScreen =   ({ route, navigation }) => {
  const { snapToken, topUpValue } = route.params; // Get the snapToken and topUpValue from params

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return token; // Return the token for further use
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  };

  const handlePaymentSuccess = async (result) => {
    // Handle payment success
    console.log('Payment Success:', result);

    const token = await getToken();
    if (!token) {
      console.error('No token found');
      return;
    }

    fetch('http://192.168.18.20:3000/api/update-balance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Add the Bearer prefix
      },
      body: JSON.stringify({
        order_id: result.order_id, // Send the order_id in the body
      }),
    });

    navigation.navigate('Home'); // Go back to TopUpPage
  };

  const handlePaymentPending = (result) => {
    // Handle payment pending
    console.log('Payment Pending:', result);
  };

  const handlePaymentError = (result) => {
    // Handle payment error
    console.log('Payment Error:', result);
  };

  return (
    <View style={styles.container}>
      
      <WebView
        originWhitelist={['*']}
        javaScriptEnabled={true}
        scalesPageToFit={true} // Ensures the content scales to fit the screen
        source={{
          html: `
              <html>
                <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
                <script type="text/javascript" src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key="SB-Mid-client-BmkU1ClZL9jluo5U"></script>
                </head>
                <body style="margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden;">
                <script type="text/javascript">
                    snap.pay('${snapToken}', {
                    onSuccess: function(result) {
                        window.ReactNativeWebView.postMessage(JSON.stringify(result));
                    },
                    onPending: function(result) {
                        window.ReactNativeWebView.postMessage(JSON.stringify(result));
                    },
                    onError: function(result) {
                        window.ReactNativeWebView.postMessage(JSON.stringify(result));
                    },
                    onClose: function() {
                        window.ReactNativeWebView.postMessage('CLOSED');
                    }
                    });
                </script>
                </body>
            </html>
          `,
        }}
        onMessage={(event) => {
          const result = JSON.parse(event.nativeEvent.data);
          if (result === 'CLOSED') {
            console.log('Payment closed');
            navigation.goBack(); // Go back when the user closes the payment
          } else if (result.status_code === '200') {
            handlePaymentSuccess(result);
          } else if (result.status_code === '201') {
            handlePaymentPending(result);
          } else {
            handlePaymentError(result);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,  // Make the container take the full screen height
    paddingTop: 20,  // Optional padding if you need some space on top
  },
  amountText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
});

export default PaymentScreen;
