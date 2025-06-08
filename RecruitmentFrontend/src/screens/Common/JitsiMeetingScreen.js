// src/screens/Common/JitsiMeetingScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import {
  AudioSession,
  LiveKitRoom,
  useCallStateHooks,
  VideoRenderer,
  registerGlobals,
} from '@livekit/react-native';
import { Track } from 'livekit-client';
import { Ionicons } from '@expo/vector-icons';
import IncallManager from 'react-native-incall-manager';

// Đăng ký các thành phần toàn cục cần thiết cho LiveKit
registerGlobals();

const JitsiMeetingScreen = ({ route, navigation }) => {
  const { meetingUrl, roomName, token, userName } = route.params;
  const [loading, setLoading] = useState(true);

  // Khởi động phiên âm thanh
  useEffect(() => {
    const setupAudio = async () => {
      await AudioSession.startAudioSession();
    };

    setupAudio();
    return () => {
      AudioSession.stopAudioSession();
    };
  }, []);

  // Xử lý khi người dùng muốn thoát khỏi cuộc họp
  const handleEndCall = () => {
    Alert.alert(
      'Kết thúc cuộc họp',
      'Bạn có chắc muốn rời khỏi cuộc họp này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Rời khỏi', 
          style: 'destructive', 
          onPress: () => navigation.goBack() 
        }
      ]
    );
  };

  // Phân tích URL phòng họp để lấy thông tin server và token
  const getServerUrl = () => {
    try {
      // Trong thực tế, bạn sẽ nhận URL máy chủ và token từ backend
      return "wss://your-livekit-server.com";
    } catch (error) {
      console.error('Error parsing meeting URL:', error);
      return null;
    }
  };

  const serverUrl = getServerUrl();

  // Nếu không thể phân tích URL phòng họp
  if (!serverUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không thể kết nối đến phòng họp.</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <LiveKitRoom
        serverUrl={serverUrl}
        token={token}
        connect={true}
        options={{
          adaptiveStream: { pixelDensity: 'screen' },
        }}
        audio={true}
        video={true}
        onConnected={() => setLoading(false)}
        onDisconnected={() => navigation.goBack()}
        onError={(error) => {
          console.error('LiveKit error:', error);
          setLoading(false);
          Alert.alert(
            'Lỗi kết nối',
            'Không thể kết nối đến phòng họp. Vui lòng thử lại sau.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }}
      >
        <MeetingView 
          loading={loading} 
          roomName={roomName} 
          onEndCall={handleEndCall}
        />
      </LiveKitRoom>
    </SafeAreaView>
  );
};

const MeetingView = ({ loading, roomName, onEndCall }) => {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();

  // Tự động định tuyến âm thanh đến loa
  useEffect(() => {
    IncallManager.start({ media: 'video' });
    return () => IncallManager.stop();
  }, []);

  return (
    <View style={styles.meetingContainer}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Đang kết nối vào phòng họp...</Text>
        </View>
      ) : (
        <>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.roomName} numberOfLines={1}>
              {roomName || 'Phòng phỏng vấn'}
            </Text>
            <TouchableOpacity style={styles.endCallButton} onPress={onEndCall}>
              <Ionicons name="call" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {/* Video Grid */}
          <View style={styles.videoGrid}>
            {participants.length === 0 ? (
              <View style={styles.waitingContainer}>
                <Text style={styles.waitingText}>
                  Đang chờ người tham gia khác...
                </Text>
              </View>
            ) : participants.length === 1 ? (
              // Hiển thị một người tham gia duy nhất
              <VideoRenderer
                participant={participants[0]}
                trackType={Track.Source.Camera}
                style={styles.singleVideo}
              />
            ) : (
              // Hiển thị lưới video cho nhiều người tham gia
              <View style={styles.multipleVideosContainer}>
                {participants.map((participant, index) => (
                  <View 
                    key={participant.sid} 
                    style={[
                      styles.videoContainer,
                      participants.length <= 2 ? styles.halfVideo : styles.quarterVideo
                    ]}
                  >
                    <VideoRenderer
                      participant={participant}
                      trackType={Track.Source.Camera}
                      style={styles.video}
                    />
                    <View style={styles.nameTag}>
                      <Text style={styles.nameText}>
                        {participant.name || `Người tham gia ${index + 1}`}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
          
          {/* Controls */}
          <View style={styles.controls}>
            {/* Các nút điều khiển khác có thể được thêm vào đây */}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  meetingContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  roomName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  endCallButton: {
    backgroundColor: '#FF3B30',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoGrid: {
    flex: 1,
    backgroundColor: '#2c2c2c',
  },
  singleVideo: {
    flex: 1,
  },
  multipleVideosContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  videoContainer: {
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  halfVideo: {
    width: '50%',
    height: '50%',
  },
  quarterVideo: {
    width: '50%',
    height: '50%',
  },
  video: {
    flex: 1,
  },
  nameTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  nameText: {
    color: '#fff',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingText: {
    color: '#fff',
    fontSize: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default JitsiMeetingScreen;