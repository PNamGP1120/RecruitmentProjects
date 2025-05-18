import React, {useState, useContext, useEffect} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import {AuthContext} from '../../contexts/AuthContext';
import {Ionicons, FontAwesome} from '@expo/vector-icons';

const {width} = Dimensions.get('window');

export default function LoginScreen({navigation}) {
    const {signIn, userInfo} = useContext(AuthContext);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [hidePassword, setHidePassword] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (loading) return;
        if (!username.trim() || !password) {
            Alert.alert('Lỗi', 'Vui lòng nhập username và mật khẩu');
            return;
        }

        setLoading(true);
        try {
            await signIn(username, password);
        } catch (error) {
            Alert.alert('Đăng nhập thất bại', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log(userInfo)
        // if (userInfo?.active_role) {
        //     switch (userInfo.active_role) {
        //         case 'JobSeeker':
        //             navigation.reset({index: 0, routes: [{name: 'JobSeekerHome'}]});
        //             break;
        //         case 'Recruiter':
        //             navigation.reset({index: 0, routes: [{name: 'RecruiterHome'}]});
        //             break;
        //         case 'Admin':
        //             navigation.reset({index: 0, routes: [{name: 'AdminDashboard'}]});
        //             break;
        //         default:
        //             navigation.reset({index: 0, routes: [{name: 'Start'}]});
        //             break;
        //     }
        // }
    }, [userInfo]);


    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.select({ios: 'padding', android: undefined})}
        >
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={28} color="#004aad"/>
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>JobOU</Text>
                    <Text style={styles.subtitle}>Welcome Back</Text>
                    <Text style={styles.text}>Let's log in. Apply to jobs!</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={24} color="gray" style={styles.icon}/>
                        <TextInput
                            placeholder="Username"
                            value={username}
                            onChangeText={setUsername}
                            style={styles.input}
                            autoCapitalize="none"
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={24} color="gray" style={styles.icon}/>
                        <TextInput
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            style={styles.input}
                            secureTextEntry={hidePassword}
                            editable={!loading}
                        />
                        <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
                            <Ionicons
                                name={hidePassword ? 'eye-off-outline' : 'eye-outline'}
                                size={24}
                                color="gray"
                                style={{marginRight: 10}}
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.loginButtonText}>{loading ? 'Đang đăng nhập...' : 'Log in'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => Alert.alert('Forgot Password pressed')}>
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.orText}>Or continue with</Text>

                    <View style={styles.socialContainer}>
                        <TouchableOpacity style={styles.socialButton}>
                            <FontAwesome name="apple" size={32} color="black"/>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <FontAwesome name="google" size={32} color="#DB4437"/>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <FontAwesome name="facebook" size={32} color="#4267B2"/>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.registerContainer}>
                        <Text>Haven't an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.registerText}>Register</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 40,
        paddingBottom: 30,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 10,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'flex-start', // sửa 'right' thành 'flex-end'
        marginBottom: 15,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#004aad',
    },
    subtitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 5,
    },
    text: {
        fontSize: 14,
        color: 'gray',
        marginTop: 5,
    },
    form: {
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 10,
        height: 50,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    loginButton: {
        backgroundColor: '#004aad',
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 10,
    },
    loginButtonDisabled: {
        backgroundColor: '#7a9cd9',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    forgotText: {
        color: '#004aad',
        textAlign: 'center',
        marginTop: 15,
    },
    footer: {
        alignItems: 'center',
    },
    orText: {
        marginBottom: 15,
        color: 'gray',
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '60%',
        marginBottom: 15,
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    registerText: {
        color: '#004aad',
        fontWeight: 'bold',
    },
});
