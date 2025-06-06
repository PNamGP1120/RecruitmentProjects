// src/screens/Admin/SkillManagement/SkillList.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import {
  List,
  FAB,
  Searchbar,
  IconButton,
  Portal,
  Dialog,
  Button,
  TextInput,
  ActivityIndicator,
} from 'react-native-paper';
import * as adminAPI from '../../../api/admin';

const SkillList = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [skillName, setSkillName] = useState('');
  const [skillDescription, setSkillDescription] = useState('');

  const fetchSkills = async () => {
    try {
      const response = await adminAPI.getSkills();
      setSkills(response.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSkills();
  };

  const handleAdd = () => {
    setEditingSkill(null);
    setSkillName('');
    setSkillDescription('');
    setDialogVisible(true);
  };

  const handleEdit = (skill) => {
    setEditingSkill(skill);
    setSkillName(skill.name);
    setSkillDescription(skill.description || '');
    setDialogVisible(true);
  };

  const handleDelete = async (skillId) => {
    try {
      await adminAPI.deleteSkill(skillId);
      fetchSkills();
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (editingSkill) {
        await adminAPI.updateSkill(editingSkill.id, {
          name: skillName,
          description: skillDescription,
        });
      } else {
        await adminAPI.createSkill({
          name: skillName,
          description: skillDescription,
        });
      }
      setDialogVisible(false);
      fetchSkills();
    } catch (error) {
      console.error('Error saving skill:', error);
    }
  };

  const renderSkillItem = ({ item }) => (
    <List.Item
      title={item.name}
      description={item.description}
      right={() => (
        <View style={styles.actions}>
          <IconButton
            icon="pencil"
            onPress={() => handleEdit(item)}
          />
          <IconButton
            icon="delete"
            onPress={() => handleDelete(item.id)}
          />
        </View>
      )}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Tìm kiếm kỹ năng..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={skills.filter(skill => 
          skill.name.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        renderItem={renderSkillItem}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ItemSeparatorComponent={() => <List.Divider />}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleAdd}
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>
            {editingSkill ? 'Chỉnh sửa kỹ năng' : 'Thêm kỹ năng mới'}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Tên kỹ năng"
              value={skillName}
              onChangeText={setSkillName}
              style={styles.input}
            />
            <TextInput
              label="Mô tả"
              value={skillDescription}
              onChangeText={setSkillDescription}
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Hủy</Button>
            <Button onPress={handleSave}>Lưu</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchbar: {
    margin: 16,
    elevation: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976D2',
  },
  input: {
    marginBottom: 16,
  },
});

export default SkillList;