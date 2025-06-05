import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Modal,
  Image,
} from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import { getSkills, updateUserPatch } from '../../api/user';
import DateTimePicker from '@react-native-community/datetimepicker';

const GENDER_CHOICES = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' },
];

export default function JobSeekerProfileEditScreen({ navigation }) {
  const { userInfo, userToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillsList, setSkillsList] = useState([]);
  const [showSkills, setShowSkills] = useState(false);
  const [showGender, setShowGender] = useState(false);
  const [initialProfile, setInitialProfile] = useState(null);
  const [profile, setProfile] = useState({
    summary: '',
    experience: '',
    education: '',
    skills: [],
    phone_number: '',
    date_of_birth: '',
    gender: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Lấy profile và skills khi vào màn hình
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy profile từ API backend
        const res = await fetch(
          `http://192.168.2.178:8000/job-seeker-profiles/me/`,
          {
            headers: { Authorization: `Bearer ${userToken}` },
          }
        );
        if (!res.ok) throw new Error('No profile');
        const data = await res.json();
        setProfile({
          summary: data.summary || '',
          experience: data.experience || '',
          education: data.education || '',
          skills: data.skills?.map((s) => s.id) || [],
          phone_number: data.phone_number || '',
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || '',
          id: data.id,
        });
        setInitialProfile({
          summary: data.summary || '',
          experience: data.experience || '',
          education: data.education || '',
          skills: data.skills?.map((s) => s.id) || [],
          phone_number: data.phone_number || '',
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || '',
          id: data.id,
        });
      } catch (e) {
        // Nếu chưa có profile, setProfile với id = null
        setProfile({
          summary: '',
          experience: '',
          education: '',
          skills: [],
          phone_number: '',
          date_of_birth: '',
          gender: '',
          id: null,
        });
        setInitialProfile({
          summary: '',
          experience: '',
          education: '',
          skills: [],
          phone_number: '',
          date_of_birth: '',
          gender: '',
          id: null,
        });
      }
      try {
        const skills = await getSkills(userToken);
        console.log('Skills API response:', skills);
        setSkillsList(Array.isArray(skills.results) ? skills.results : []);
      } catch (e) {}
      setLoading(false);
    };
    fetchData();
  }, [userToken]);

  // Kiểm tra có thay đổi không để enable nút Save
  const isChanged = useCallback(() => {
    if (!initialProfile) return false;
    return (
      profile.experience !== initialProfile.experience ||
      profile.education !== initialProfile.education ||
      profile.phone_number !== initialProfile.phone_number ||
      profile.date_of_birth !== initialProfile.date_of_birth ||
      profile.gender !== initialProfile.gender ||
      JSON.stringify(profile.skills) !== JSON.stringify(initialProfile.skills) ||
      profile.summary !== initialProfile.summary
    );
  }, [profile, initialProfile]);

  // Xử lý chọn skill
  const toggleSkill = (id) => {
    setProfile((prev) => {
      const exists = prev.skills.includes(id);
      return {
        ...prev,
        skills: exists ? prev.skills.filter((s) => s !== id) : [...prev.skills, id],
      };
    });
  };

  // Xử lý chọn gender
  const selectGender = (value) => {
    setProfile((prev) => ({ ...prev, gender: value }));
    setShowGender(false);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Format YYYY-MM-DD
      const iso = selectedDate.toISOString().split('T')[0];
      setProfile((p) => ({ ...p, date_of_birth: iso }));
    }
  };

  // Xử lý lưu
  const handleSave = async () => {
    if (!isChanged()) return;
    setSaving(true);
    try {
      if (!profile.id) {
        // Chưa có profile, gọi POST
        const res = await fetch('http://192.168.2.178:8000/job-seeker-profiles/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            summary: profile.summary,
            experience: profile.experience,
            education: profile.education,
            phone_number: profile.phone_number,
            date_of_birth: profile.date_of_birth,
            gender: profile.gender,
            skills_ids: profile.skills,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setProfile({ ...profile, id: data.id });
          setInitialProfile({ ...profile, id: data.id });
        }
      } else {
        // Đã có profile, PATCH như cũ
        const res = await fetch(
          `http://192.168.2.178:8000/job-seeker-profiles/${profile.id}/`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({
              summary: profile.summary,
              experience: profile.experience,
              education: profile.education,
              phone_number: profile.phone_number,
              date_of_birth: profile.date_of_birth,
              gender: profile.gender,
              skills_ids: profile.skills,
            }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          setInitialProfile({
            summary: data.summary || '',
            experience: data.experience || '',
            education: data.education || '',
            skills: data.skills?.map((s) => s.id) || [],
            phone_number: data.phone_number || '',
            date_of_birth: data.date_of_birth || '',
            gender: data.gender || '',
            id: data.id,
          });
        }
      }
    } catch (e) {}
    setSaving(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}><ActivityIndicator size="large" color="#004aad" /></View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f7f9ff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Avatar, Name, Email */}
        <View style={styles.headerProfile}>
          <Image
            source={{ uri: userInfo?.avatar_url || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{userInfo?.first_name || ''} {userInfo?.last_name || ''}</Text>
          <Text style={styles.email}>{userInfo?.email || ''}</Text>
        </View>
        {/* Summary */}
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.box}>
          <TextInput
            style={styles.textArea}
            value={profile.summary}
            onChangeText={(t) => setProfile((p) => ({ ...p, summary: t }))}
            placeholder="Summary about yourself..."
            multiline
          />
        </View>
        {/* Experience */}
        <Text style={styles.sectionTitle}>Experience</Text>
        <View style={styles.box}>
          <TextInput
            style={styles.textArea}
            value={profile.experience}
            onChangeText={(t) => setProfile((p) => ({ ...p, experience: t }))}
            placeholder="Describe your experience..."
            multiline
          />
        </View>
        {/* Education */}
        <Text style={styles.sectionTitle}>Education</Text>
        <View style={styles.box}>
          <TextInput
            style={styles.textArea}
            value={profile.education}
            onChangeText={(t) => setProfile((p) => ({ ...p, education: t }))}
            placeholder="Describe your education..."
            multiline
          />
        </View>
        {/* Skills */}
        <TouchableOpacity style={styles.comboBox} onPress={() => setShowSkills(true)}>
          <Text style={styles.comboLabel}>Skills</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
            {Array.isArray(skillsList) && skillsList
              .filter(item => profile.skills.includes(item.id))
              .map(item => (
                <View key={item.id} style={styles.selectedSkillTag}>
                  <Text style={styles.selectedSkillText}>{item.name}</Text>
                </View>
              ))}
          </View>
        </TouchableOpacity>
        <Modal
          visible={showSkills}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSkills(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Skills</Text>
              <ScrollView style={{ maxHeight: 350 }}>
                {Array.isArray(skillsList) && skillsList.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.dropdownItem,
                      profile.skills.includes(item.id) && styles.selectedItem,
                    ]}
                    onPress={() => toggleSkill(item.id)}
                  >
                    <Text style={styles.dropdownText}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setShowSkills(false)}>
                <Text style={styles.closeBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* Phone */}
        <View style={styles.inputRow}>
          <Text style={styles.inputIcon}>📞</Text>
          <TextInput
            style={styles.input}
            value={profile.phone_number}
            onChangeText={(t) => setProfile((p) => ({ ...p, phone_number: t }))}
            placeholder="Phone"
            keyboardType="phone-pad"
          />
        </View>
        {/* Date of Birth */}
        <View style={styles.inputRow}>
          <Text style={styles.inputIcon}>📅</Text>
          <TouchableOpacity
            style={[styles.input, { justifyContent: 'center' }]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={{ color: profile.date_of_birth ? '#333' : '#aaa', fontSize: 16 }}>
              {profile.date_of_birth || 'Select date of birth'}
            </Text>
          </TouchableOpacity>
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={profile.date_of_birth ? new Date(profile.date_of_birth) : new Date(2000, 0, 1)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
        {/* Gender */}
        <TouchableOpacity style={styles.comboBox} onPress={() => setShowGender((v) => !v)}>
          <Text style={styles.comboLabel}>Gender</Text>
        </TouchableOpacity>
        {showGender && (
          <View style={styles.dropdown}>
            {GENDER_CHOICES.map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[
                  styles.dropdownItem,
                  profile.gender === g.value && styles.selectedItem,
                ]}
                onPress={() => selectGender(g.value)}
              >
                <Text style={styles.dropdownText}>{g.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveBtn, isChanged() ? styles.saveBtnActive : styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!isChanged() || saving}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f7f9ff',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginTop: 20,
    marginBottom: 8,
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 60,
    fontSize: 16,
    color: '#333',
  },
  comboBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  comboLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    paddingVertical: 4,
    elevation: 2,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  selectedItem: {
    backgroundColor: '#b7c9e9',
  },
  dropdownText: {
    fontSize: 17,
    color: '#222',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  saveBtn: {
    marginTop: 30,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnActive: {
    backgroundColor: '#004aad',
  },
  saveBtnDisabled: {
    backgroundColor: '#bfc9d9',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f9ff',
  },
  selectedSkillTag: {
    backgroundColor: '#b7c9e9',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  selectedSkillText: {
    color: '#004aad',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#004aad',
  },
  closeBtn: {
    marginTop: 16,
    backgroundColor: '#004aad',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  headerProfile: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ddd',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 15,
    color: '#004aad',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginBottom: 10,
  },
});
