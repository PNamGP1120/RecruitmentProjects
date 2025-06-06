import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../../contexts/AuthContext';
import { getJobDetails, updateJob } from '../../api/job';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const EditJobScreen = ({ route, navigation }) => {
    const { slug } = route.params;
    const { userToken } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        location: '',
        salary_min: '',
        salary_max: '',
        job_type: 'Full-time',
        expiration_date: new Date(),
    });

    const jobTypes = [
        { label: 'Toàn thời gian', value: 'Full-time' },
        { label: 'Bán thời gian', value: 'Part-time' },
        { label: 'Thực tập', value: 'Intern' },
        { label: 'Freelance', value: 'Freelance' },
    ];

    useEffect(() => {
        fetchJobDetails();
    }, []);

    const fetchJobDetails = async () => {
        try {
            const response = await getJobDetails(userToken, slug);
            setFormData({
                title: response.title,
                description: response.description,
                requirements: response.requirements || '',
                location: response.location,
                salary_min: response.salary_min?.toString() || '',
                salary_max: response.salary_max?.toString() || '',
                job_type: response.job_type,
                expiration_date: response.expiration_date ? new Date(response.expiration_date) : new Date(),
            });
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải thông tin tin tuyển dụng');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        // Validate dữ liệu
        if (!formData.title.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề');
            return;
        }
        if (!formData.description.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mô tả công việc');
            return;
        }
        if (!formData.location.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập địa điểm làm việc');
            return;
        }
    
        try {
            setSubmitting(true);
    
            // Format dữ liệu trước khi gửi
            const updatedData = {
                ...formData,
                salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
                salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
                expiration_date: formData.expiration_date.toISOString().split('T')[0],
            };
    
            console.log('Submitting data:', updatedData); // Log để debug
    
            await updateJob(userToken, slug, updatedData);
    
            Alert.alert(
                'Thành công',
                'Đã cập nhật tin tuyển dụng',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Quay lại màn hình trước và refresh data
                            navigation.goBack();
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert(
                'Lỗi',
                error.message || 'Không thể cập nhật tin tuyển dụng. Vui lòng thử lại sau.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const Header = () => (
        <View style={styles.header}>
            <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chỉnh sửa tin tuyển dụng</Text>
            <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSubmit}
                disabled={submitting}
            >
                {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.saveButtonText}>Lưu</Text>
                )}
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#004aad" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <Header />
            <ScrollView style={styles.content}>
                <View style={styles.formSection}>
                    <Text style={styles.label}>Tiêu đề *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.title}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                        placeholder="Nhập tiêu đề tin tuyển dụng"
                    />

                    <Text style={styles.label}>Mô tả công việc *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.description}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                        placeholder="Nhập mô tả chi tiết công việc"
                        multiline
                        numberOfLines={6}
                    />

                    <Text style={styles.label}>Yêu cầu ứng viên</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.requirements}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, requirements: text }))}
                        placeholder="Nhập yêu cầu đối với ứng viên"
                        multiline
                        numberOfLines={6}
                    />

                    <Text style={styles.label}>Địa điểm *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.location}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                        placeholder="Nhập địa điểm làm việc"
                    />

                    <View style={styles.row}>
                        <View style={styles.halfWidth}>
                            <Text style={styles.label}>Lương tối thiểu</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.salary_min}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, salary_min: text }))}
                                placeholder="Nhập lương tối thiểu"
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.halfWidth}>
                            <Text style={styles.label}>Lương tối đa</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.salary_max}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, salary_max: text }))}
                                placeholder="Nhập lương tối đa"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Loại công việc</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={formData.job_type}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, job_type: value }))}
                            style={styles.picker}
                        >
                            {jobTypes.map((type) => (
                                <Picker.Item 
                                    key={type.value} 
                                    label={type.label} 
                                    value={type.value} 
                                />
                            ))}
                        </Picker>
                    </View>

                    <Text style={styles.label}>Ngày hết hạn</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={styles.dateButtonText}>
                            {formData.expiration_date.toLocaleDateString('vi-VN')}
                        </Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={formData.expiration_date}
                            mode="date"
                            display="default"
                            minimumDate={new Date()}
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) {
                                    setFormData(prev => ({ ...prev, expiration_date: selectedDate }));
                                }
                            }}
                        />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 48,
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
    },
    saveButton: {
        backgroundColor: '#004aad',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '500',
    },
    content: {
        flex: 1,
    },
    formSection: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    label: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 16,
        fontSize: 15,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 16,
    },
    picker: {
        height: 50,
    },
    dateButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 16,
    },
    dateButtonText: {
        fontSize: 15,
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default EditJobScreen;