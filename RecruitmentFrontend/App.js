import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { ChatProvider } from './src/contexts/ChatContext';
import AppNavigator from './src/navigation/AppNavigator';
import { PaperProvider } from 'react-native-paper';
import { auth } from './src/utils/rnFirebase'; // Thay đổi import

export default function App() {
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    // Kiểm tra xem Firebase Auth đã sẵn sàng chưa
    const checkFirebaseAuth = async () => {
      try {
        // Với React Native Firebase, không cần đợi lâu
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Kiểm tra xem auth có sẵn sàng không
        if (auth()) {
          console.log("Firebase auth ready");
          setFirebaseReady(true);
        } else {
          console.warn("Firebase auth not ready");
          setFirebaseReady(true); // Vẫn tiếp tục
        }
      } catch (error) {
        console.error("Firebase auth initialization error:", error);
        setFirebaseReady(true);
      }
    };

    checkFirebaseAuth();
  }, []);

  if (!firebaseReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#004aad" />
        <Text style={{ marginTop: 10 }}>Đang khởi tạo...</Text>
      </View>
    );
  }

  return (
    <PaperProvider>
      <AuthProvider>
        <ChatProvider>
          <AppNavigator />
        </ChatProvider>
      </AuthProvider>
    </PaperProvider>
  );
}