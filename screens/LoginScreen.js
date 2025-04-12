// screens/LoginScreen.js
import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('farmer');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password, userType);

      if (!result.success) {
        Alert.alert('Đăng nhập thất bại', result.error);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/150' }}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>AGRVN</Text>
            <Text style={styles.subtitle}>Giải pháp quản lý trang trại tiên tiến </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập email của bạn"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu của bạn"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Text style={styles.label}>Đăng nhập với tư cách</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={userType}
                onValueChange={(itemValue) => setUserType(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Nông dân" value="farmer" />
                <Picker.Item label="Nhà đầu tư" value="investor" />
                <Picker.Item label="Công nhân" value="worker" />
                <Picker.Item label="Nhà cung cấp" value="supplier" />
              </Picker>
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerButtonText}>
                Chưa có tài khoản? Đăng ký
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c6e49',
    marginBottom: 5,
    fontFamily: 'Arial',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Arial',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
    fontFamily: 'Arial',
  },
  input: {
    backgroundColor: '#f9f9f9',
    height: 50,
    borderRadius: 6,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    fontFamily: 'Arial',
  },
  pickerContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    fontFamily: 'Arial',
  },
  loginButton: {
    backgroundColor: '#2c6e49',
    height: 50,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Arial',
  },
  registerButton: {
    alignItems: 'center',
    marginTop: 5,
  },
  registerButtonText: {
    color: '#2c6e49',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Arial',
  },
});

export default LoginScreen;