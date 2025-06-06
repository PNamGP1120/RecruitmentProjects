import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    Platform,
    Modal,
    SafeAreaView,
    KeyboardAvoidingView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthContext } from '../../contexts/AuthContext';
import { createJob } from '../../api/job';

const JOB_TYPES = [
    { label: 'Toàn thời gian', value: 'Full-time' },
    { label: 'Bán thời gian', value: 'Part-time' },
    { label: 'Tự do', value: 'Freelance' },
    { label: 'Thực tập', value: 'Intern' },
];

// Custom Job Type Picker Component
const JobTypePicker = ({ visible, onClose, value, onSelect }) => (
    <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
    >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Chọn loại công việc</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
                {JOB_TYPES.map((type) => (
                    <TouchableOpacity
                        key={type.value}
                        style={[
                            styles.optionItem,
                            value === type.value && styles.selectedOption
                        ]}
                        onPress={() => {
                            onSelect(type.value);
                            onClose();
                        }}
                    >
                        <Text style={[
                            styles.optionText,
                            value === type.value && styles.selectedOptionText
                        ]}>
                            {type.label}
                        </Text>
                        {value === type.value && (
                            <Ionicons name="checkmark" size={24} color="#004aad" />
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    </Modal>
);

export default function CreateJobScreen({ navigation }) {
    const { userToken } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [showJobTypePicker, setShowJobTypePicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [jobData, setJobData] = useState({
        title: '',
        description: '',
        requirements: '',
        location: '',
        salary_min: '',
        salary_max: '',
        job_type: 'Full-time',
        expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });

    const validateForm = () => {
        if (!jobData.title.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề công việc');
            return false;
        }
        if (!jobData.description.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mô tả công việc');
            return false;
        }
        if (!jobData.location.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập địa điểm làm việc');
            return false;
        }
        if (jobData.salary_min && jobData.salary_max && 
            parseFloat(jobData.salary_min) > parseFloat(jobData.salary_max)) {
            Alert.alert('Lỗi', 'Lương tối thiểu không thể cao hơn lương tối đa');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            const formattedData = {
                ...jobData,
                salary_min: jobData.salary_min ? parseFloat(jobData.salary_min) : null,
                salary_max: jobData.salary_max ? parseFloat(jobData.salary_max) : null,
                expiration_date: jobData.expiration_date.toISOString().split('T')[0],
            };

            await createJob(userToken, formattedData);
            Alert.alert(
                'Thành công', 
                'Đã tạo tin tuyển dụng thành công',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            Alert.alert('Lỗi', error.message || 'Không thể tạo tin tuyển dụng');
        } finally {
            setLoading(false);
        }
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setJobData(prev => ({ ...prev, expiration_date: selectedDate }));
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <ScrollView style={styles.scrollView}>
                    <View style={styles.form}>
                        {/* Tiêu đề */}
                        <Text style={styles.label}>Tiêu đề công việc *</Text>
                        <TextInput
                            style={styles.input}
                            value={jobData.title}
                            onChangeText={(text) => setJobData(prev => ({ ...prev, title: text }))}
                            placeholder="VD: Senior React Native Developer"
                            placeholderTextColor="#999"
                        />

                        {/* Mô tả */}
                        <Text style={styles.label}>Mô tả công việc *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={jobData.description}
                            onChangeText={(text) => setJobData(prev => ({ ...prev, description: text }))}
                            placeholder="Mô tả chi tiết về công việc..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />

                        {/* Yêu cầu */}
                        <Text style={styles.label}>Yêu cầu ứng viên</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={jobData.requirements}
                            onChangeText={(text) => setJobData(prev => ({ ...prev, requirements: text }))}
                            placeholder="Các yêu cầu đối với ứng viên..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />

                        {/* Địa điểm */}
                        <Text style={styles.label}>Địa điểm làm việc *</Text>
                        <TextInput
                            style={styles.input}
                            value={jobData.location}
                            onChangeText={(text) => setJobData(prev => ({ ...prev, location: text }))}
                            placeholder="VD: Hà Nội, Hồ Chí Minh"
                            placeholderTextColor="#999"
                        />

                        {/* Mức lương */}
                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <Text style={styles.label}>Lương tối thiểu</Text>
                                <TextInput
                                    style={styles.input}
                                    value={jobData.salary_min}
                                    onChangeText={(text) => setJobData(prev => ({ ...prev, salary_min: text }))}
                                    placeholder="VD: 1000"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.halfWidth}>
                                <Text style={styles.label}>Lương tối đa</Text>
                                <TextInput
                                    style={styles.input}
                                    value={jobData.salary_max}
                                    onChangeText={(text) => setJobData(prev => ({ ...prev, salary_max: text }))}
                                    placeholder="VD: 2000"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        {/* Loại công việc */}
                        <Text style={styles.label}>Loại công việc</Text>
                        <TouchableOpacity
                            style={styles.pickerButton}
                            onPress={() => setShowJobTypePicker(true)}
                        >
                            <Text style={styles.pickerButtonText}>
                                {JOB_TYPES.find(t => t.value === jobData.job_type)?.label}
                            </Text>
                            <Ionicons name="chevron-down" size={24} color="#666" />
                        </TouchableOpacity>

                        {/* Ngày hết hạn */}
                        <Text style={styles.label}>Ngày hết hạn</Text>
                        <TouchableOpacity
                            style={styles.pickerButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.pickerButtonText}>
                                {jobData.expiration_date.toLocaleDateString('vi-VN')}
                            </Text>
                            <Ionicons name="calendar-outline" size={24} color="#666" />
                        </TouchableOpacity>

                        {/* Nút tạo */}
                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Text style={styles.submitButtonText}>
                                {loading ? 'Đang tạo...' : 'Tạo tin tuyển dụng'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Job Type Picker Modal */}
                <JobTypePicker
                    visible={showJobTypePicker}
                    onClose={() => setShowJobTypePicker(false)}
                    value={jobData.job_type}
                    onSelect={(value) => setJobData(prev => ({ ...prev, job_type: value }))}
                />

                {/* Date Picker */}
                {showDatePicker && (
                    <DateTimePicker
                        value={jobData.expiration_date}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                        minimumDate={new Date()}
                    />
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
    },
    form: {
        padding: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
        color: '#333',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    halfWidth: {
        width: '48%',
    },
    pickerButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerButtonText: {
        fontSize: 16,
        color: '#333',
    },
    submitButton: {
        backgroundColor: '#004aad',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selectedOption: {
        backgroundColor: '#f0f8ff',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedOptionText: {
        color: '#004aad',
        fontWeight: 'bold',
    },
});