// screens/ProfileScreen.js
import React, { useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

const ProfileScreen = () => {
  const { user, userType, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Lỗi', 'Đăng xuất thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Tiêu đề Hồ sơ */}
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/150' }}
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.name}>{user?.name || 'Tên Người dùng'}</Text>
          <Text style={styles.role}>{userType?.charAt(0).toUpperCase() + userType?.slice(1) || 'Người dùng'}</Text>
        </View>

        {/* Thông tin Hồ sơ */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={22} color="#2c6e49" />
            <Text style={styles.infoText}>{user?.email || 'email@example.com'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={22} color="#2c6e49" />
            <Text style={styles.infoText}>Trang trại Thung lũng Xanh</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="call-outline" size={22} color="#2c6e49" />
            <Text style={styles.infoText}>(+84) 123-456-789</Text>
          </View>
        </View>

        {/* Tùy chọn Menu */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="person-outline" size={22} color="#333" />
            <Text style={styles.menuItemText}>Chỉnh sửa Hồ sơ</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={22} color="#333" />
            <Text style={styles.menuItemText}>Thông báo</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="lock-closed-outline" size={22} color="#333" />
            <Text style={styles.menuItemText}>Quyền riêng tư & Bảo mật</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings-outline" size={22} color="#333" />
            <Text style={styles.menuItemText}>Cài đặt Ứng dụng</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={22} color="#333" />
            <Text style={styles.menuItemText}>Trợ giúp & Hỗ trợ</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Nút Đăng xuất */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#e74c3c" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
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
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
    backgroundColor: 'white',
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#2c6e49',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    fontFamily: 'Arial',
  },
  role: {
    fontSize: 16,
    color: '#2c6e49',
    marginBottom: 5,
    fontFamily: 'Arial',
  },
  infoContainer: {
    backgroundColor: 'white',
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    fontFamily: 'Arial',
  },
  menuContainer: {
    backgroundColor: 'white',
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    fontFamily: 'Arial',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginTop: 20,
    padding: 15,
  },
  logoutText: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '500',
    marginLeft: 10,
    fontFamily: 'Arial',
  },
  versionContainer: {
    alignItems: 'center',
    padding: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Arial',
  },
});

export default ProfileScreen;