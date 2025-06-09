// src/screens/JobSeeker/InterviewScreen.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from '../../contexts/AuthContext';
import { getJobSeekerInterviews } from '../../api/jobSeeker';

const { width, height } = Dimensions.get('window');

export default function InterviewScreen({ route, navigation }) {
  const { interviewId } = route.params;
  const { userToken } = useAuth();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef(null);

  useEffect(() => {
    fetchInterviewDetails();
  }, []);

  const fetchInterviewDetails = async () => {
    try {
      const response = await getJobSeekerInterviews(userToken, { id: interviewId });
      if (response.results && response.results.length > 0) {
        setInterview(response.results[0]);
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin phỏng vấn');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching interview:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin phỏng vấn');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* WebView for Video Call */}
      {interview && interview.location && (
        <WebView
          ref={webViewRef}
          source={{ uri: interview.location }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          allowsFullscreenVideo={true}
          mediaPlaybackRequiresUserAction={false}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
            Alert.alert('Lỗi', 'Không thể kết nối đến phòng họp. Vui lòng thử lại.');
          }}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    width: width,
    height: height,
  },
});