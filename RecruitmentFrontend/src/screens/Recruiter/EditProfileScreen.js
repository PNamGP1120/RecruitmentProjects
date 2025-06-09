import React, { useState, useContext, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    Platform,
    StatusBar,
    SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../../contexts/AuthContext';
import { updateRecruiterProfile, uploadCompanyLogo } from '../../api/recruiter';
import { useFocusEffect } from '@react-navigation/native';

const LogoImage = React.memo(({ logoUrl }) => (
    <Image
        source={{ 
            uri: logoUrl || 'https://via.placeholder.com/150'
        }}
        style={styles.logo}
    />
));

const EditProfileScreen = ({ route, navigation }) => {
    const { profile: initialProfile } = route.params;
    const { userToken, userInfo, updateUserInfoInContext } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [logoUrl, setLogoUrl] = useState(initialProfile?.company_logo || null);
    const [profile, setProfile] = useState({
        company_name: initialProfile?.company_name || '',
        company_website: initialProfile?.company_website || '',
        company_description: initialProfile?.company_description || '',
        industry: initialProfile?.industry || '',
        address: initialProfile?.address || '',
    });

    // Tối ưu hóa hàm xử lý input với useCallback
    const handleInputChange = useCallback((field) => (text) => {
        setProfile(prev => ({
            ...prev,
            [field]: text
        }));
    }, []);

    // Tối ưu hóa hàm xử lý chọn ảnh
    const pickImage = useCallback(async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                setUploading(true);
                const uri = result.assets[0].uri;
                try {
                    const formData = new FormData();
                    formData.append('company_logo', {
                        uri,
                        type: 'image/jpeg',
                        name: 'company_logo.jpg',
                    });

                    const response = await uploadCompanyLogo(userToken, formData);
                    if (response?.company_logo) {
                        setLogoUrl(response.company_logo);
                        Alert.alert('Thành công', 'Logo đã được cập nhật');
                    }
                } catch (error) {
                    Alert.alert('Lỗi', 'Không thể tải lên logo. Vui lòng thử lại');
                }
                setUploading(false);
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại');
            setUploading(false);
        }
    }, [userToken]);

    // Tối ưu hóa hàm xử lý lưu
    const handleSave = useCallback(async () => {
        if (!profile.company_name.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên công ty');
            return;
        }

        setLoading(true);
        try {
            const response = await updateRecruiterProfile(userToken, {
                ...profile,
                company_logo: logoUrl,
            });

            if (response) {
                updateUserInfoInContext({
                    ...userInfo,
                    ...response,
                });
                Alert.alert('Thành công', 'Thông tin công ty đã được cập nhật', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            Alert.alert('Lỗi', error.message || 'Không thể cập nhật thông tin. Vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    }, [profile, logoUrl, userToken, userInfo, navigation, updateUserInfoInContext]);

    // Tối ưu hóa component InputField
    const InputField = useCallback(({ label, value, onChangeText, required, multiline, placeholder }) => (
        <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
                <Text style={styles.label}>{label}</Text>
                {required && <Text style={styles.required}>*</Text>}
            </View>
            <TextInput
                style={[
                    styles.input,
                    multiline && styles.textArea
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#999"
                multiline={multiline}
                numberOfLines={multiline ? 5 : 1}
                textAlignVertical={multiline ? 'top' : 'center'}
            />
        </View>
    ), []);

    const logoImageUrl = React.useMemo(() => {
        return logoUrl || 'https://via.placeholder.com/150';
    }, [logoUrl]);


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
                <TouchableOpacity 
                    style={[styles.saveButton, loading && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#004aad" />
                    ) : (
                        <Text style={styles.saveButtonText}>Lưu</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.logoSection}>
                    <TouchableOpacity 
                        onPress={pickImage} 
                        disabled={uploading}
                        style={styles.logoContainer}
                    >
                        {uploading ? (
                            <ActivityIndicator size="large" color="#004aad" />
                        ) : (
                            <>
                                <LogoImage logoUrl={logoImageUrl} />
                                <View style={styles.editLogoButton}>
                                    <Ionicons name="camera" size={20} color="#fff" />
                                </View>
                            </>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.logoHint}>Nhấn để thay đổi logo công ty</Text>
                </View>

                <View style={styles.form}>
                    <InputField
                        label="Tên công ty"
                        value={profile.company_name}
                        onChangeText={handleInputChange('company_name')}
                        placeholder="Nhập tên công ty"
                        required
                    />

                    <InputField
                        label="Website"
                        value={profile.company_website}
                        onChangeText={handleInputChange('company_website')}
                        placeholder="https://example.com"
                    />

                    <InputField
                        label="Ngành nghề"
                        value={profile.industry}
                        onChangeText={handleInputChange('industry')}
                        placeholder="Ngành nghề kinh doanh"
                    />

                    <InputField
                        label="Địa chỉ"
                        value={profile.address}
                        onChangeText={handleInputChange('address')}
                        placeholder="Địa chỉ công ty"
                    />

                    <InputField
                        label="Giới thiệu công ty"
                        value={profile.company_description}
                        onChangeText={handleInputChange('company_description')}
                        placeholder="Mô tả về công ty"
                        multiline
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight + 10,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    saveButton: {
        padding: 8,
    },
    saveButtonText: {
        color: '#004aad',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.5,
    },
    content: {
        flex: 1,
    },
    logoSection: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    editLogoButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#004aad',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    logoHint: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
    },
    form: {
        padding: 16,
    },
    inputGroup: {
        marginBottom: 20,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    required: {
        color: '#dc3545',
        marginLeft: 4,
        fontSize: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#fff',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
});

export default EditProfileScreen;