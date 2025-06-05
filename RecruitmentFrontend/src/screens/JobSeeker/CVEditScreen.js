import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Switch } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { getResumeDetail, updateResume, activateResume } from '../../api/user';
import { AuthContext } from '../../contexts/AuthContext';

export default function CVEditScreen({ route, navigation }) {
  const { id } = route.params;
  const { userToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null); // file object khi upload mới
  const [fileUrl, setFileUrl] = useState(null); // url file hiện tại
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const data = await getResumeDetail(userToken, id);
      setTitle(data.title || '');
      setFileUrl(data.file_path || null);
      setFileName(data.file_path ? getFileNameFromUrl(data.file_path) : '');
      setFileSize(data.file_path ? 0 : 0); // Nếu muốn lấy size thật, cần backend trả về
      setIsActive(!!data.is_active);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lấy thông tin CV: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const getFileNameFromUrl = (url) => {
    if (!url) return '';
    try {
      return decodeURIComponent(url.split('/').pop().split('?')[0]);
    } catch {
      return url;
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFile(result.assets[0]);
        setFileUrl(null);
        setFileName(result.assets[0].name);
        setFileSize(result.assets[0].size);
      } else if (result.canceled) {
        Alert.alert('Thông báo', 'Bạn đã hủy chọn tài liệu.');
      } else {
        Alert.alert('Lỗi', 'Không thể chọn tài liệu. Vui lòng thử lại.');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi chọn tài liệu: ' + error.message);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileUrl(null);
    setFileName('');
    setFileSize(0);
  };

  const handleToggleActive = async (value) => {
    if (value) {
      try {
        await activateResume(userToken, id);
        await fetchDetail();
        Alert.alert('Thành công', 'CV đã được kích hoạt!');
      } catch (e) {
        Alert.alert('Lỗi', 'Không thể kích hoạt CV: ' + e.message);
      }
    } else {
      try {
        await updateResume(userToken, id, { is_active: false });
        setIsActive(false);
      } catch (e) {
        Alert.alert('Lỗi', 'Không thể hủy kích hoạt CV: ' + e.message);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        title: title.trim(),
      };
      if (file) {
        data.file_path = {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
        };
      } else if (!fileUrl) {
        data.file_path = null;
      }
      await updateResume(userToken, id, data);
      Alert.alert('Thành công', 'Cập nhật CV thành công!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể cập nhật CV: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#2563eb" style={{ flex: 1, marginTop: 60 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Resume</Text>
      <Text style={styles.sectionTitle}>Resume or CV</Text>
      <TextInput
        style={styles.cvTitleInputHeader}
        placeholder="Resume name"
        value={title}
        onChangeText={setTitle}
        maxLength={50}
      />
      <View style={styles.uploadBox}>
        <Text style={styles.uploadDesc}>Upload your CV or Resume and use it when you apply for jobs</Text>
        {(!file && !fileUrl) && (
          <TouchableOpacity style={styles.uploadBtn} onPress={pickDocument}>
            <Text style={styles.uploadBtnText}>Upload</Text>
          </TouchableOpacity>
        )}
        {(file || fileUrl) && (
          <View style={styles.selectedFileBox}>
            <View style={styles.selectedFileInfoRow}>
              <View style={styles.selectedFileInfoLeft}>
                <Ionicons name="document" size={36} color="#e53e3e" style={{marginRight: 12}} />
                <View>
                  <Text style={styles.selectedFileName}>{fileName}</Text>
                  <Text style={styles.selectedFileMeta}>{fileName.split('.').pop().toUpperCase()} • {fileSize ? (fileSize / 1024).toFixed(0) : ''} KB</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.selectedFileRemoveBtn} onPress={handleRemoveFile}>
                <Ionicons name="close-circle" size={24} color="#888" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      <View style={styles.activeRow}>
        <Switch value={isActive} onValueChange={handleToggleActive} />
        <Text style={styles.activeLabel}>Is activated</Text>
      </View>
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafbff', padding: 18 },
  header: { fontSize: 22, fontWeight: '700', alignSelf: 'center', marginVertical: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 18, marginBottom: 8 },
  cvTitleInputHeader: {
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#2563eb',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    marginBottom: 18,
  },
  uploadDesc: { color: '#888', fontSize: 15, textAlign: 'center', marginBottom: 18 },
  uploadBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginBottom: 8,
  },
  uploadBtnText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  selectedFileBox: {
    backgroundColor: '#f7f7fa',
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
    marginBottom: 8,
    flexDirection: 'column',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    position: 'relative',
  },
  selectedFileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedFileInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedFileName: {
    color: '#222',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 2,
  },
  selectedFileMeta: {
    color: '#888',
    fontSize: 14,
  },
  selectedFileRemoveBtn: {
    marginLeft: 12,
    padding: 2,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 18,
  },
  activeLabel: {
    fontSize: 16,
    marginLeft: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#a0a0a0',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
});