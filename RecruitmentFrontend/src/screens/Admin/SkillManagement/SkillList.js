// src/screens/Admin/SkillManagement/SkillList.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  RefreshControl, 
  Dimensions, 
  SafeAreaView, 
  TouchableOpacity, 
  StatusBar,
  FlatList
} from 'react-native';
import { 
  Text, 
  ActivityIndicator, 
  Divider, 
  Surface, 
  Avatar,
  Searchbar,
  FAB,
  IconButton,
  Menu,
  Portal,
  Dialog,
  Button,
  TextInput,
  HelperText,
  Snackbar,
  Provider,
  useTheme
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as adminAPI from '../../../api/admin';
import { useAuth } from '../../../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const STATUSBAR_HEIGHT = StatusBar.currentHeight || 0;

// Main Component
const SkillList = ({ navigation }) => {
  const { userToken } = useAuth();
  const theme = useTheme();
  
  // States
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  
  // Dialog states
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [skillName, setSkillName] = useState('');
  const [skillDescription, setSkillDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  
  // Menu states
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [anchorPosition, setAnchorPosition] = useState({ x: 0, y: 0 });
  
  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Fetch data
  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getSkills(userToken);
      
      // Xử lý response
      let skillsData = [];
      
      if (response && Array.isArray(response)) {
        skillsData = response;
      } else if (response && typeof response === 'object') {
        if (response.results && Array.isArray(response.results)) {
          skillsData = response.results;
        } else {
          const possibleArrays = Object.values(response).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            skillsData = possibleArrays[0];
          }
        }
      }
      
      setSkills(skillsData);
      setFilteredSkills(skillsData);
    } catch (error) {
      console.error('Error fetching skills:', error);
      setError(error.message || 'Không thể tải danh sách kỹ năng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSkills();
  };
  
  // Load data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchSkills();
      return () => {};
    }, [])
  );
  
  // Filter skills based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSkills(skills);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results = skills.filter(skill => 
      (skill.name && skill.name.toLowerCase().includes(query)) || 
      (skill.description && skill.description.toLowerCase().includes(query))
    );
    
    setFilteredSkills(results);
  }, [searchQuery, skills]);
  
  // Show snackbar
  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };
  
  // Handle adding a skill
  const handleAddSkill = () => {
    setEditingSkill(null);
    setSkillName('');
    setSkillDescription('');
    setErrors({});
    setDialogVisible(true);
  };
  
  // Handle editing a skill
  const handleEditSkill = (skill) => {
    if (!skill) return;
    
    setEditingSkill(skill);
    setSkillName(skill.name || '');
    setSkillDescription(skill.description || '');
    setErrors({});
    setDialogVisible(true);
    setMenuVisible(false);
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!skillName.trim()) {
      newErrors.name = 'Tên kỹ năng không được để trống';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Save skill
  const handleSaveSkill = async () => {
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      
      const skillData = {
        name: skillName.trim(),
        description: skillDescription.trim() || null
      };
      
      if (editingSkill && editingSkill.id) {
        // Update existing skill
        await adminAPI.updateSkill(userToken, editingSkill.id, skillData);
        
        // Update state
        const updatedSkills = skills.map(s => 
          s.id === editingSkill.id ? { ...s, ...skillData } : s
        );
        setSkills(updatedSkills);
        setFilteredSkills(updatedSkills);
        
        showSnackbar('Đã cập nhật kỹ năng thành công');
      } else {
        // Create new skill
        const newSkill = await adminAPI.createSkill(userToken, skillData);
        
        if (newSkill && newSkill.id) {
          setSkills([...skills, newSkill]);
          setFilteredSkills([...skills, newSkill]);
        } else {
          // Refresh to get updated list
          fetchSkills();
        }
        
        showSnackbar('Đã thêm kỹ năng mới thành công');
      }
      
      setDialogVisible(false);
    } catch (error) {
      console.error('Error saving skill:', error);
      
      if (error.response && error.response.status === 400 && 
          error.response.data && error.response.data.name) {
        setErrors({
          name: error.response.data.name[0] || 'Tên kỹ năng đã tồn tại'
        });
      } else {
        showSnackbar('Không thể lưu kỹ năng');
      }
    } finally {
      setSaving(false);
    }
  };
  
  // Handle deleting a skill
  const handleDeletePrompt = (skill) => {
    if (!skill) return;
    
    setSelectedSkill(skill);
    setDeleteDialogVisible(true);
    setMenuVisible(false);
  };
  
  // Confirm delete
  const handleDeleteSkill = async () => {
    if (!selectedSkill || !selectedSkill.id) {
      showSnackbar('Không thể xác định kỹ năng cần xóa');
      return;
    }
    
    try {
      setLoading(true);
      await adminAPI.deleteSkill(userToken, selectedSkill.id);
      setDeleteDialogVisible(false);
      
      // Update state
      const updatedSkills = skills.filter(s => s.id !== selectedSkill.id);
      setSkills(updatedSkills);
      setFilteredSkills(updatedSkills);
      
      showSnackbar('Đã xóa kỹ năng thành công');
    } catch (error) {
      console.error('Error deleting skill:', error);
      showSnackbar('Không thể xóa kỹ năng');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle long press
  const handleSkillLongPress = (skill, event) => {
    if (!skill) return;
    
    const { locationX, locationY } = event.nativeEvent;
    
    setSelectedSkill(skill);
    setAnchorPosition({ x: locationX, y: locationY });
    setMenuVisible(true);
  };
  
  // Get color for skill
  const getSkillColor = (name) => {
    if (!name) return '#607D8B';
    
    const colors = [
      '#1E88E5', '#42A5F5', '#2196F3',
      '#43A047', '#66BB6A', '#4CAF50',
      '#FB8C00', '#FFA726', '#FF9800',
      '#E53935', '#EF5350', '#F44336',
      '#8E24AA', '#AB47BC', '#9C27B0',
    ];
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#1E3A8A" />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>Quản lý kỹ năng</Text>
      
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={onRefresh}
      >
        <MaterialCommunityIcons name="refresh" size={24} color="#1E3A8A" />
      </TouchableOpacity>
    </View>
  );
  
  // Render search bar
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Tìm kiếm kỹ năng..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor="#757575"
      />
    </View>
  );
  
  // Render skill item
  const renderSkillItem = ({ item }) => {
    const skillColor = getSkillColor(item.name);
    
    return (
      <Surface style={styles.skillCard} elevation={1}>
        <View style={styles.skillCardContent}>
          <Avatar.Icon 
            size={40} 
            icon="star-outline" 
            style={{ backgroundColor: `${skillColor}15` }}
            color={skillColor}
          />
          
          <View style={styles.skillInfo}>
            <Text style={styles.skillName}>{item.name || 'Unnamed Skill'}</Text>
            {item.description && (
              <Text style={styles.skillDescription} numberOfLines={1}>
                {item.description}
              </Text>
            )}
          </View>
          
          <View style={styles.actionButtons}>
            <IconButton 
              icon="pencil" 
              size={20} 
              onPress={() => handleEditSkill(item)}
              color="#1E3A8A"
              style={styles.actionButton}
            />
            <IconButton 
              icon="delete" 
              size={20} 
              onPress={() => handleDeletePrompt(item)}
              color="#F44336"
              style={styles.actionButton}
            />
          </View>
        </View>
      </Surface>
    );
  };
  
  // Render error message
  const renderError = () => {
    if (!error) return null;
    
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          mode="contained" 
          onPress={fetchSkills}
          style={styles.retryButton}
          color="#1E3A8A"
        >
          Thử lại
        </Button>
      </View>
    );
  };
  
  // Render empty state
  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="star-off" size={48} color="#BBDEFB" />
        <Text style={styles.emptyTitle}>
          {searchQuery ? 'Không tìm thấy kỹ năng' : 'Chưa có kỹ năng nào'}
        </Text>
        <Text style={styles.emptyText}>
          {searchQuery 
            ? 'Thử tìm kiếm với từ khóa khác' 
            : 'Hãy thêm kỹ năng đầu tiên của bạn'}
        </Text>
        {searchQuery && (
          <Button 
            mode="outlined" 
            onPress={() => setSearchQuery('')}
            style={styles.resetButton}
            icon="close"
          >
            Xóa tìm kiếm
          </Button>
        )}
      </View>
    );
  };
  
  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#F8FAFC" barStyle="dark-content" />
        
        {/* Header */}
        {renderHeader()}
        
        {/* Content */}
        <View style={styles.content}>
          {/* Search bar */}
          {renderSearchBar()}
          
          {/* Skills list with total count */}
          {error ? (
            renderError()
          ) : loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1E3A8A" />
              <Text style={styles.loadingText}>Đang tải kỹ năng...</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              <View style={styles.listHeader}>
                <View style={styles.listTitleContainer}>
                  <MaterialCommunityIcons name="star-circle-outline" size={20} color="#1E3A8A" />
                  <Text style={styles.listTitle}>Danh sách kỹ năng</Text>
                </View>
                <Text style={styles.totalCount}>({skills.length})</Text>
              </View>
              
              <FlatList
                data={filteredSkills}
                renderItem={renderSkillItem}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                  <RefreshControl 
                    refreshing={refreshing} 
                    onRefresh={onRefresh}
                    colors={['#1E3A8A']} 
                  />
                }
              />
            </View>
          )}
        </View>
        
        {/* FAB */}
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={handleAddSkill}
          color="#fff"
          theme={{ colors: { accent: '#1E3A8A' } }}
        />
        
        {/* Dialogs & Menus */}
        <Portal>
          {/* Context Menu */}
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={anchorPosition}
          >
            <Menu.Item 
              icon="pencil" 
              onPress={() => selectedSkill && handleEditSkill(selectedSkill)} 
              title="Chỉnh sửa" 
            />
            <Divider />
            <Menu.Item 
              icon="delete" 
              onPress={() => selectedSkill && handleDeletePrompt(selectedSkill)} 
              title="Xóa" 
              titleStyle={{ color: '#F44336' }}
            />
          </Menu>
          
          {/* Add/Edit Dialog */}
          <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
            <Dialog.Title>
              {editingSkill ? 'Chỉnh sửa kỹ năng' : 'Thêm kỹ năng mới'}
            </Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Tên kỹ năng *"
                value={skillName}
                onChangeText={setSkillName}
                style={styles.dialogInput}
                error={!!errors.name}
              />
              <HelperText type="error" visible={!!errors.name}>
                {errors.name}
              </HelperText>
              
              <TextInput
                label="Mô tả"
                value={skillDescription}
                onChangeText={setSkillDescription}
                multiline
                numberOfLines={3}
                style={styles.dialogInput}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDialogVisible(false)}>Hủy</Button>
              <Button 
                onPress={handleSaveSkill}
                loading={saving}
                disabled={saving}
                mode="contained"
                color="#1E3A8A"
              >
                Lưu
              </Button>
            </Dialog.Actions>
          </Dialog>
          
          {/* Delete Dialog */}
          <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
            <Dialog.Title>Xác nhận xóa</Dialog.Title>
            <Dialog.Content>
              <Text>
                Bạn có chắc chắn muốn xóa kỹ năng "{selectedSkill?.name}"?
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDeleteDialogVisible(false)}>Hủy</Button>
              <Button 
                onPress={handleDeleteSkill}
                loading={loading}
                disabled={loading}
                color="#F44336"
              >
                Xóa
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        
        {/* Snackbar */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          action={{
            label: 'Đóng',
            onPress: () => setSnackbarVisible(false)
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </SafeAreaView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: STATUSBAR_HEIGHT + 10,
    paddingBottom: 10,
    backgroundColor: '#F8FAFC',
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  searchBar: {
    elevation: 2,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  listTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginLeft: 8,
  },
  totalCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748B',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  skillCard: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 1,
  },
  skillCardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  skillInfo: {
    flex: 1,
    marginLeft: 12,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  skillDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    margin: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  resetButton: {
    marginTop: 16,
  },
  retryButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1E3A8A',
  },
  dialogInput: {
    marginBottom: 8,
  },
});

export default SkillList;