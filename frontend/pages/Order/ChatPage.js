import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { db } from '../../components/firebase'; // Import Firebase DB
import { collection, addDoc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';

const ChatPage = ({ route }) => {
  const { userId, mechanicId, transactionId } = route.params; // Get userId, mechanicId, and transactionId from route params
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUser, setIsUser] = useState(true); // Track if logged in as user or mechanic

  // Fetch chat messages in real-time
  useEffect(() => {
    if (userId && mechanicId && transactionId) {
      // Query Firestore based on participants and transactionId
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId), // Ensure userId is in participants
        where('transactionId', '==', transactionId),    // Ensure transactionId matches
        orderBy('timestamp', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const loadedMessages = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setMessages(loadedMessages);
        },
        (error) => {
          console.error('Error fetching messages:', error);
        }
      );

      // Cleanup unsubscribe when the component is unmounted
      return () => unsubscribe();
    }
  }, [userId, mechanicId, transactionId]);

  // Set isUser to true or false based on the logged-in user
  useEffect(() => {
    setIsUser(userId !== mechanicId); // Set true if the logged in user is not mechanic
  }, [userId, mechanicId]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        await addDoc(collection(db, 'chats'), {
          participants: [userId, mechanicId],
          senderId: userId,
          message: newMessage,
          timestamp: new Date(),
          transactionId: transactionId, // Include transactionId
        });
        setNewMessage(''); // Clear message input
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageBox,
        {
          alignSelf: item.senderId === userId ? 'flex-end' : 'flex-start', // Align right for user and left for mechanic
          backgroundColor: item.senderId === userId ? '#00ADB5' : '#E0E0E0', // Different background colors for user and mechanic
        },
      ]}
    >
      <Text style={[styles.message, { color: item.senderId === userId ? '#FFF' : '#333' }]}>
        {item.message}
      </Text>
      <Text style={styles.timestamp}>
        {item.timestamp?.seconds
          ? new Date(item.timestamp.seconds * 1000).toLocaleTimeString()
          : ''}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        inverted // To show the latest message at the bottom
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Icon name="paper-plane" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 10,
  },
  messageBox: {
    maxWidth: '80%',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  message: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 10,
    color: '#555',
    marginTop: 5,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F0F0F0',
  },
  sendButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00ADB5',
    borderRadius: 20,
    padding: 10,
  },
});

export default ChatPage;
