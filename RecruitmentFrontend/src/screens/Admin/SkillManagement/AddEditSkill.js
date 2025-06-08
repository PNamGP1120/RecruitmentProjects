// src/screens/Admin/SkillManagement/AddEditSkill.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Portal,
  Dialog,
  Chip,
  ActivityIndicator,
  HelperText,
  IconButton,
  List,
  Divider,
} from 'react-native-paper';
import * as adminAPI from '../../../api/admin';

const AddEditSkill = ({ route, navigation }) => {
  const { skillId } = route.params || {};
  const isEditing = !!skillId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [usageDialogVisible, setUsageDialogVisible] = useState(false);

  const [skill, setSkill] = useState({
    name: '',
    description: '',
    category: '',
    level: 'Beginner',
    tags: [],
  });

  const [errors, setErrors] = useState({});
  const [skillUsage, setSkillUsage] = useState({
    users: [],
    jobs: [],
  });

  // Các level kỹ năng
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  useEffect(() => {
    if (isEditing) {
      fetchSkillDetails();
    }
  }, [skillId]);

  const fetchSkillDetails = async () => {
    try {
      const response = await adminAPI.getSkillDetail(skillId);
      setSkill(response.data);
      // Fetch skill usage statistics
      const usageResponse = await adminAPI.getSkillUsage(skillId);
      setSkillUsage(usageResponse.data);
    } catch (error) {
      console.error('Error fetching skill details:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin kỹ năng');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!skill.name.trim()) {
      newErrors.name = 'Tên kỹ năng không được để trống';
    }

    if (!skill.category.trim()) {
      newErrors.category = 'Danh mục không được để trống';
    }

    if (skill.description.trim().length < 10) {
      newErrors.description = 'Mô tả phải có ít nhất 10 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      if (isEditing) {
        await adminAPI.updateSkill(skillId, skill);
        Alert.alert('Thành công', 'Đã cập nhật kỹ năng');
      } else {
        await adminAPI.createSkill(skill);
        Alert.alert('Thành công', 'Đã thêm kỹ năng mới');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving skill:', error);
      Alert.alert('Lỗi', 'Không thể lưu kỹ năng');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminAPI.deleteSkill(skillId);
      Alert.alert('Thành công', 'Đã xóa kỹ năng');
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting skill:', error);
      Alert.alert('Lỗi', 'Không thể xóa kỹ năng');
    }
  };

  const addTag = (tag) => {
    if (tag.trim() && !skill.tags.includes(tag)) {
      setSkill({
        ...skill,
        tags: [...skill.tags, tag.trim()],
      });
    }
  };

  const removeTag = (tagToRemove) => {
    setSkill({
      ...skill,
      tags: skill.tags.filter(tag => tag !== tagToRemove),
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>
            {isEditing ? 'Chỉnh sửa kỹ năng' : 'Thêm kỹ năng mới'}
          </Title>

          {/* Basic Information */}
          <TextInput
            label="Tên kỹ năng *"
            value={skill.name}
            onChangeText={(text) => setSkill({ ...skill, name: text })}
            style={styles.input}
            error={!!errors.name}
          />
          <HelperText type="error" visible={!!errors.name}>
            {errors.name}
          </HelperText>

          <TextInput
            label="Danh mục *"
            value={skill.category}
            onChangeText={(text) => setSkill({ ...skill, category: text })}
            style={styles.input}
            error={!!errors.category}
          />
          <HelperText type="error" visible={!!errors.category}>
            {errors.category}
          </HelperText>

          <TextInput
            label="Mô tả *"
            value={skill.description}
            onChangeText={(text) => setSkill({ ...skill, description: text })}
            multiline
            numberOfLines={4}
            style={styles.input}
            error={!!errors.description}
          />
          <HelperText type="error" visible={!!errors.description}>
            {errors.description}
          </HelperText>

          {/* Skill Level */}
          <Title style={styles.sectionTitle}>Cấp độ</Title>
          <View style={styles.levelContainer}>
            {skillLevels.map((level) => (
              <Chip
                key={level}
                selected={skill.level === level}
                onPress={() => setSkill({ ...skill, level })}
                style={[
                  styles.levelChip,
                  skill.level === level && styles.selectedLevelChip,
                ]}
              >
                {level}
              </Chip>
            ))}
          </View>

          {/* Tags */}
          <Title style={styles.sectionTitle}>Tags</Title>
          <View style={styles.tagsContainer}>
            {skill.tags.map((tag) => (
              <Chip
                key={tag}
                onClose={() => removeTag(tag)}
                style={styles.tagChip}
              >
                {tag}
              </Chip>
            ))}
          </View>
          <TextInput
            label="Thêm tag"
            placeholder="Nhập tag và nhấn Enter"
            onSubmitEditing={(event) => addTag(event.nativeEvent.text)}
            style={styles.input}
          />

          {/* Usage Statistics for Editing */}
          {isEditing && (
            <>
              <Divider style={styles.divider} />
              <Title style={styles.sectionTitle}>Thống kê sử dụng</Title>
              <List.Item
                title="Số người dùng"
                description={`${skillUsage.users.length} người dùng`}
                left={(props) => <List.Icon {...props} icon="account-group" />}
                onPress={() => setUsageDialogVisible(true)}
              />
              <List.Item
                title="Số tin tuyển dụng"
                description={`${skillUsage.jobs.length} tin tuyển dụng`}
                left={(props) => <List.Icon {...props} icon="briefcase" />}
                onPress={() => setUsageDialogVisible(true)}
              />
            </>
          )}
        </Card.Content>

        <Card.Actions style={styles.actions}>
          {isEditing && (
            <Button
              mode="outlined"
              onPress={() => setDeleteDialogVisible(true)}
              style={styles.deleteButton}
              icon="delete"
            >
              Xóa
            </Button>
          )}
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            Hủy
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            style={styles.saveButton}
          >
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </Card.Actions>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Xác nhận xóa</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Bạn có chắc chắn muốn xóa kỹ năng này? Hành động này không thể hoàn tác.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Hủy</Button>
            <Button onPress={handleDelete} color="#F44336">Xóa</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Usage Statistics Dialog */}
        <Dialog
          visible={usageDialogVisible}
          onDismiss={() => setUsageDialogVisible(false)}
        >
          <Dialog.Title>Chi tiết sử dụng</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView>
              <List.Section>
                <List.Subheader>Người dùng ({skillUsage.users.length})</List.Subheader>
                {skillUsage.users.map((user) => (
                  <List.Item
                    key={user.id}
                    title={user.username}
                    description={user.email}
                    left={(props) => <List.Icon {...props} icon="account" />}
                  />
                ))}
              </List.Section>
              <List.Section>
                <List.Subheader>Tin tuyển dụng ({skillUsage.jobs.length})</List.Subheader>
                {skillUsage.jobs.map((job) => (
                  <List.Item
                    key={job.id}
                    title={job.title}
                    description={job.company_name}
                    left={(props) => <List.Icon {...props} icon="briefcase" />}
                  />
                ))}
              </List.Section>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setUsageDialogVisible(false)}>Đóng</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  levelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  levelChip: {
    margin: 4,
  },
  selectedLevelChip: {
    backgroundColor: '#1976D2',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tagChip: {
    margin: 4,
  },
  divider: {
    marginVertical: 16,
  },
  actions: {
    justifyContent: 'flex-end',
    padding: 16,
  },
  deleteButton: {
    borderColor: '#F44336',
    marginRight: 'auto',
  },
  cancelButton: {
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  dialogScrollArea: {
    maxHeight: 400,
  },
});

export default AddEditSkill;