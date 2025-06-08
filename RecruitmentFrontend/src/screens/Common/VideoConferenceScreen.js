// src/screens/Common/VideoConferenceScreen.js
import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  BackHandler,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Text,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';

const VideoConferenceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { meetingUrl, meetingTitle } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef(null);

  // Script để tùy chỉnh giao diện Jitsi trên WebView
  const INJECTED_JAVASCRIPT = `
    (function() {
      // Ẩn các phần tử không cần thiết của Jitsi
      document.querySelector('.watermark').style.display = 'none';
      document.querySelector('.welcome-page-content').style.display = 'none';
      
      // Tự động tham gia cuộc họp
      const joinButton = document.querySelector('.welcome-page-button');
      if (joinButton) {
        joinButton.click();
      }
      
      // Ẩn thanh header
      const header = document.querySelector('.header');
      if (header) {
        header.style.display = 'none';
      }
      
      // Thông báo khi đã sẵn sàng
      window.ReactNativeWebView.postMessage('CONFERENCE_READY');
    })();
  `;

  // Xử lý sự kiện khi nhận message từ WebView
  const handleMessage = (event) => {
    const { data } = event.nativeEvent;
    
    if (data === 'CONFERENCE_READY') {
      setIsLoading(false);
    }
  };

  // Xử lý sự kiện khi người dùng nhấn nút back
  React.useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Thoát phòng họp?',
        'Bạn có chắc muốn thoát khỏi phòng họp không?',
        [
          { text: 'Hủy', style: 'cancel', onPress: () => {} },
          { text: 'Thoát', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />
      
      <WebView
        ref={webViewRef}
        source={{ uri: meetingUrl }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        injectedJavaScript={INJECTED_JAVASCRIPT}
        onMessage={handleMessage}
        onLoad={() => setTimeout(() => setIsLoading(false), 3000)}
        userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
      />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Đang kết nối vào phòng họp...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
  },
});

export default VideoConferenceScreen;