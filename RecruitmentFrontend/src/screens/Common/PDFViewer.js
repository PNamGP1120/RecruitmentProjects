// src/screens/Common/PDFViewer.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Text,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

const PDFViewer = ({ route, navigation }) => {
  const { uri, title } = route.params;
  const [loading, setLoading] = useState(true);

  // Xác định source dựa trên URI
  const getSource = () => {
    // Nếu là URI trực tiếp từ web (https://...)
    if (uri.startsWith('http')) {
      // Đối với Google Drive, cần chuyển đổi URL
      if (uri.includes('drive.google.com')) {
        const fileId = uri.match(/[-\w]{25,}/);
        if (fileId) {
          return {
            uri: `https://drive.google.com/viewerng/viewer?embedded=true&url=https://drive.google.com/uc?export=download&id=${fileId[0]}`,
          };
        }
      }
      
      // Đối với Cloudinary hoặc các URL khác
      return {
        uri: `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(uri)}`,
      };
    }
    
    // Nếu là file local
    return { uri };
  };

  // HTML để hiển thị PDF trực tiếp trong WebView (cho các URL không cần Google Viewer)
  const pdfHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title || 'PDF Viewer'}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style>
        body, html {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        #pdf-viewer {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
      </style>
    </head>
    <body>
      <div id="pdf-viewer">
        <iframe src="${uri}" allowfullscreen></iframe>
      </div>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title || 'Xem PDF'}</Text>
        <View style={styles.headerRight} />
      </View>
      
      {/* PDF Viewer */}
      <View style={styles.webViewContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Đang tải tài liệu...</Text>
          </View>
        )}
        
        <WebView
          source={uri.endsWith('.pdf') ? getSource() : { html: pdfHTML }}
          style={styles.webView}
          onLoadEnd={() => setLoading(false)}
          onError={() => setLoading(false)}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => null}
          scalesPageToFit={true}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          allowFileAccessFromFileURLs={true}
          mixedContentMode={'always'}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight + 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
});

export default PDFViewer;