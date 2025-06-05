// src/screens/JobSeeker/CVListScreen.js
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator, TextInput, WebView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getResumes, uploadResume, deleteResume, getResumeDetail } from '../../api/user';
import { AuthContext } from '../../contexts/AuthContext';

export default function CVListScreen({ navigation }) {
  const { userToken } = useContext(AuthContext);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [cvTitle, setCVTitle] = useState('');

  const fetchResumes = async () => {
    setLoading(true);
    try {
      console.log('Fetching resumes with token:', userToken);
      const data = await getResumes(userToken);
      console.log('Resumes API data:', data);
      if (Array.isArray(data)) {
        setResumes(data);
      } else if (data && Array.isArray(data.results)) {
        setResumes(data.results);
      } else {
        setResumes([]);
      }
    } catch (e) {
      Alert.alert('Error fetching resumes', e.message);
      console.error('Error fetching resumes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        setCVTitle('');
        setUploadProgress(0);
      } else if (result.canceled) {
        Alert.alert('Thông báo', 'Bạn đã hủy chọn tài liệu.');
      } else {
        Alert.alert('Lỗi', 'Không thể chọn tài liệu. Vui lòng thử lại.');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi nghiêm trọng khi chọn tài liệu: ' + error.message);
    }
  };

  const handleUpload = async (file, title) => {
    const uploadFile = file || selectedFile;
    if (!uploadFile) return;
    setUploading(true);
    setUploadProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress <= 100) {
        setUploadProgress(progress);
      } else {
        clearInterval(interval);
      }
    }, 200);
    try {
      // Chuẩn bị file cho FormData
      const fileData = {
        uri: uploadFile.uri,
        name: uploadFile.name,
        type: uploadFile.mimeType || 'application/octet-stream',
      };
      await uploadResume(userToken, fileData, title);
      clearInterval(interval);
      setUploadProgress(100);
      setUploading(false);
      setSelectedFile(null);
      setCVTitle('');
      fetchResumes();
      // Reset trạng thái để hiển thị lại nút Upload
      setTimeout(() => {
        setUploadProgress(0);
      }, 500);
    } catch (e) {
      clearInterval(interval);
      setUploadProgress(0);
      setUploading(false);
      Alert.alert('Upload lỗi', e.message);
    }
  };

  const handleSave = () => {
    if (!selectedFile) return;
    const title = cvTitle.trim() ? cvTitle.trim() : selectedFile.name;
    handleUpload(selectedFile, title);
  };

  const handleDelete = (id) => {
    console.log('Delete id:', id);
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa CV này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          try {
            await deleteResume(userToken, id);
            fetchResumes();
          } catch (e) {
            Alert.alert('Lỗi', e.message);
          }
        }
      }
    ]);
  };

  const handlePreview = async (id) => {
    try {
      const detail = await getResumeDetail(userToken, id);
      if (detail && detail.file_path) {
        const googleViewer = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(detail.file_path)}`;
        navigation.navigate('CVPreview', { fileUrl: googleViewer });
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy file CV.');
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lấy thông tin CV: ' + e.message);
    }
  };

  const renderResume = ({ item }) => (
    <View style={styles.resumeCard}>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
        <MaterialIcons name="delete" size={24} color="#d33" />
      </TouchableOpacity>
      <Text style={styles.resumeTitle}>{item.title || 'Resume or CV Title'}</Text>
      <View style={styles.row}>
        <Ionicons name="calendar-outline" size={16} color="#888" />
        <Text style={styles.resumeMeta}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}   {item.created_at ? new Date(item.created_at).toLocaleTimeString().slice(0,5) : ''}</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name={item.is_active ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={item.is_active ? '#2563eb' : '#bbb'} />
        <Text style={[styles.resumeStatus, item.is_active && { color: '#2563eb' }]}>{item.is_active ? 'Is activated' : 'Is activated'}</Text>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handlePreview(item.id)}>
          <Text style={styles.actionText}>Preview</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('CVEdit', { id: item.id })}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
  <View style={styles.container}>
    <Text style={styles.header}>Resume Management</Text>
    <Text style={styles.sectionTitle}>Resume or CV</Text>
    {/* Upload Box */}
    <View style={styles.uploadBox}>
      {/* Header với label và TextInput nhập title ngang hàng */}
      <View style={styles.uploadHeaderRow}>
        {selectedFile && !uploading && uploadProgress !== 100 && (
          <TextInput
            style={styles.cvTitleInputHeader}
            placeholder="Resume name"
            value={cvTitle}
            onChangeText={setCVTitle}
            maxLength={50}
          />
        )}
      </View>
      <Text style={styles.uploadDesc}>Upload your CV or Resume and use it when you apply for jobs</Text>
      <Text style={styles.uploadFileText}>Upload a Doc/Docx/PDF</Text>
      {/* Nút Upload thực sự */}
      {!uploading && uploadProgress === 0 && !selectedFile && (
        <TouchableOpacity style={styles.uploadBtn} onPress={pickDocument}>
          <Text style={styles.uploadBtnText}>Upload</Text>
        </TouchableOpacity>
      )}
      {/* Hiển thị file đã chọn */}
      {selectedFile && !uploading && uploadProgress !== 100 && (
        <View style={styles.selectedFileBox}>
          <View style={styles.selectedFileInfoRow}>
            <View style={styles.selectedFileInfoLeft}>
              <Ionicons name="document" size={36} color="#e53e3e" style={{marginRight: 12}} />
              <View>
                <Text style={styles.selectedFileName}>{selectedFile.name}</Text>
                <Text style={styles.selectedFileMeta}>PDF • {(selectedFile.size / 1024).toFixed(0)} KB</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.selectedFileRemoveBtn} onPress={() => {
              setSelectedFile(null);
              setUploadProgress(0);
              setCVTitle('');
            }}>
              <Ionicons name="close-circle" size={24} color="#888" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Khi đang upload */}
      {uploading && (
        <View style={styles.uploadingContainer}>
          <View style={styles.circularProgress}>
            <Text style={styles.progressText}>{Math.round(uploadProgress)}%</Text>
          </View>
          <Text style={styles.uploadingText}>Uploading...</Text>
        </View>
      )}
    </View>

    {/* Danh sách CV */}
    <Text style={styles.sectionTitle}>Resume or CV List</Text>
    {loading ? <ActivityIndicator size="large" color="#2563eb" /> : (
      <FlatList
        data={resumes}
        keyExtractor={item => item.id}
        renderItem={renderResume}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    )}

    {/* Nút Save luôn hiện khi upload hoặc upload xong, chỉ enable khi upload xong và đã nhập title */}
    {(selectedFile || uploading || uploadProgress === 100) && (
      <TouchableOpacity
        style={[
          styles.saveButton,
          (uploading) && styles.saveButtonDisabled
        ]}
        onPress={handleSave}
        disabled={uploading}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    )}
  </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafbff', padding: 18 },
  header: { fontSize: 22, fontWeight: '700', alignSelf: 'center', marginVertical: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 18, marginBottom: 8 },
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
  uploadFileText: { color: '#2563eb', fontWeight: '700', fontSize: 18 },
  uploadBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginBottom: 8,
  },
  uploadBtnDisabled: {
    backgroundColor: '#a0a0a0',
  },
  uploadBtnText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  selectedFile: { color: '#2563eb', marginTop: 6, fontSize: 14 },
  resumeCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    position: 'relative',
  },
  deleteBtn: { position: 'absolute', top: 12, right: 12, zIndex: 2 },
  resumeTitle: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  resumeMeta: { color: '#888', fontSize: 14, marginLeft: 6 },
  resumeStatus: { fontSize: 15, marginLeft: 6, color: '#bbb' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  actionBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 28,
    marginHorizontal: 4,
    width: '40%',
  },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 16, textAlign: 'center' },
  uploadingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  circularProgress: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  uploadingText: {
    fontSize: 16,
    color: '#555',
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
  uploadedFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  fileName: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  fileSize: {
    color: '#888',
    fontSize: 14,
    marginLeft: 12,
  },
  removeBtn: {
    padding: 8,
  },
  uploadedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  uploadedFileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  uploadedFileLabel: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '700',
  },
  cvTitleInput: {
    flex: 1,
    padding: 8,
  },
  uploadHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cvTitleInputHeader: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    minWidth: 160,
    fontSize: 16,
    backgroundColor: '#fff',
  },
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
});
