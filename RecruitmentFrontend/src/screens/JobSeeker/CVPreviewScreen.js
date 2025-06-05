import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

export default function CVPreviewScreen({ route }) {
  const { fileUrl } = route.params;
  // Kích thước A4: 595 x 842pt ~ 1:1.414
  const width = Dimensions.get('window').width - 32;
  const height = width * 1.414;

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: fileUrl }}
        style={{ width, height, alignSelf: 'center', backgroundColor: '#fff', borderRadius: 12 }}
        scalesPageToFit
        bounces={false}
        useWebKit
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});