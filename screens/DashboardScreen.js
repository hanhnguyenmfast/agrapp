// screens/DashboardScreen.js
// screens/DashboardScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

// Dữ liệu mẫu - trong ứng dụng thực tế, sẽ lấy từ API
const mockWeatherData = {
  temperature: 24,
  condition: 'Mây rải rác',
  humidity: 65,
  windSpeed: 8,
  forecast: [
    { day: 'Hôm nay', temp: 24, condition: 'Mây rải rác' },
    { day: 'Ngày mai', temp: 27, condition: 'Nắng' },
    { day: 'Thứ 4', temp: 26, condition: 'Nắng' },
    { day: 'Thứ 5', temp: 22, condition: 'Mưa' },
    { day: 'Thứ 6', temp: 23, condition: 'Nhiều mây' },
  ],
};

const mockCrops = [
  { id: '1', name: 'Ngô', area: '10 mẫu', status: 'Đang phát triển', health: 'Tốt', daysToHarvest: 35 },
  { id: '2', name: 'Lúa mì', area: '15 mẫu', status: 'Đang phát triển', health: 'Xuất sắc', daysToHarvest: 20 },
  { id: '3', name: 'Đậu nành', area: '8 mẫu', status: 'Đang phát triển', health: 'Khá', daysToHarvest: 45 },
];

const mockTasks = [
  { id: '1', title: 'Kiểm tra hệ thống tưới', dueDate: '11/04/2025', priority: 'Cao', completed: false },
  { id: '2', title: 'Bón phân', dueDate: '12/04/2025', priority: 'Trung bình', completed: false },
  { id: '3', title: 'Lập kế hoạch thu hoạch', dueDate: '15/04/2025', priority: 'Thấp', completed: true },
];

const DashboardScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [weatherData, setWeatherData] = useState(mockWeatherData);
  const [crops, setCrops] = useState(mockCrops);
  const [tasks, setTasks] = useState(mockTasks);

  // Lấy các công việc chưa hoàn thành
  const incompleteTasks = tasks.filter(task => !task.completed);

  // Mô phỏng làm mới
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Trong ứng dụng thật, bạn sẽ lấy dữ liệu mới ở đây
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Lấy biểu tượng thời tiết dựa trên điều kiện
  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'nắng':
        return 'sunny-outline';
      case 'mây rải rác':
        return 'partly-sunny-outline';
      case 'nhiều mây':
        return 'cloud-outline';
      case 'mưa':
        return 'rainy-outline';
      default:
        return 'cloud-outline';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Tiêu đề */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Chào mừng trở lại,</Text>
            <Text style={styles.nameText}>{user?.name || 'Nông dân'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image
              source={{ uri: 'https://via.placeholder.com/150' }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        {/* Thẻ Thời tiết */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Thời tiết Hôm nay</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Weather')}>
              <Text style={styles.viewAll}>Xem Chi tiết</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weatherMain}>
            <View style={styles.weatherInfo}>
              <Text style={styles.temperature}>{weatherData.temperature}°C</Text>
              <Text style={styles.weatherCondition}>{weatherData.condition}</Text>
              <Text style={styles.weatherSubInfo}>
                Độ ẩm: {weatherData.humidity}% | Gió: {weatherData.windSpeed} km/h
              </Text>
            </View>
            <View style={styles.weatherIconContainer}>
              <Ionicons
                name={getWeatherIcon(weatherData.condition)}
                size={70}
                color="#2c6e49"
              />
            </View>
          </View>

          <View style={styles.forecastContainer}>
            {weatherData.forecast.map((day, index) => (
              <View key={index} style={styles.forecastDay}>
                <Text style={styles.forecastDayText}>{day.day}</Text>
                <Ionicons
                  name={getWeatherIcon(day.condition)}
                  size={24}
                  color="#555"
                />
                <Text style={styles.forecastTemp}>{day.temp}°</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tổng quan về Mùa vụ */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Tình trạng Cây trồng</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Farm')}>
              <Text style={styles.viewAll}>Xem Tất cả</Text>
            </TouchableOpacity>
          </View>

          {crops.map((crop) => (
            <View key={crop.id} style={styles.cropItem}>
              <View style={styles.cropInfo}>
                <Text style={styles.cropName}>{crop.name}</Text>
                <Text style={styles.cropDetails}>
                  {crop.area} | Trạng thái: {crop.status}
                </Text>
              </View>
              <View style={styles.cropHealthContainer}>
                <Text
                  style={[
                    styles.cropHealth,
                    crop.health === 'Xuất sắc'
                      ? styles.excellent
                      : crop.health === 'Tốt'
                      ? styles.good
                      : styles.fair,
                  ]}
                >
                  {crop.health}
                </Text>
                <Text style={styles.harvestDays}>
                  {crop.daysToHarvest} ngày đến thu hoạch
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Công việc */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Công việc Sắp tới</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
              <Text style={styles.viewAll}>Xem Tất cả</Text>
            </TouchableOpacity>
          </View>

          {incompleteTasks.length > 0 ? (
            incompleteTasks.map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <View style={styles.taskLeftContent}>
                  <View
                    style={[
                      styles.priorityIndicator,
                      task.priority === 'Cao'
                        ? styles.highPriority
                        : task.priority === 'Trung bình'
                        ? styles.mediumPriority
                        : styles.lowPriority,
                    ]}
                  />
                  <Text style={styles.taskName}>{task.title}</Text>
                </View>
                <View style={styles.taskRightContent}>
                  <Text style={styles.dueDate}>Hạn: {task.dueDate}</Text>
                  <TouchableOpacity style={styles.checkButton}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={24}
                      color="#2c6e49"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noTasksText}>Không có công việc sắp tới</Text>
          )}

          <TouchableOpacity style={styles.addTaskButton}>
            <Ionicons name="add-circle-outline" size={20} color="white" />
            <Text style={styles.addTaskText}>Thêm Công việc Mới</Text>
          </TouchableOpacity>
        </View>

        {/* Tóm tắt Kho hàng */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Tóm tắt Kho hàng</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Inventory')}>
              <Text style={styles.viewAll}>Xem Chi tiết</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inventoryStats}>
            <View style={styles.inventoryStat}>
              <Ionicons name="leaf-outline" size={24} color="#2c6e49" />
              <Text style={styles.inventoryStatNumber}>24</Text>
              <Text style={styles.inventoryStatLabel}>Hạt giống & Vật tư</Text>
            </View>

            <View style={styles.inventoryStat}>
              <Ionicons name="construct-outline" size={24} color="#2c6e49" />
              <Text style={styles.inventoryStatNumber}>12</Text>
              <Text style={styles.inventoryStatLabel}>Thiết bị</Text>
            </View>

            <View style={styles.inventoryStat}>
              <Ionicons name="warning-outline" size={24} color="#e74c3c" />
              <Text style={styles.inventoryStatNumber}>3</Text>
              <Text style={styles.inventoryStatLabel}>Mặt hàng sắp hết</Text>
            </View>
          </View>
        </View>

        {/* Tổng quan Tài chính */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Tổng quan Tài chính</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Xem Thêm</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.financialInfo}>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Doanh thu Tháng này</Text>
              <Text style={styles.financialValue}>12.850.000 đ</Text>
              <View style={styles.financialChange}>
                <Ionicons name="trending-up-outline" size={16} color="#2c6e49" />
                <Text style={styles.financialChangeText}>+8.5%</Text>
              </View>
            </View>

            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Chi phí Tháng này</Text>
              <Text style={styles.financialValue}>7.230.000 đ</Text>
              <View style={styles.financialChange}>
                <Ionicons name="trending-down-outline" size={16} color="#e74c3c" />
                <Text style={[styles.financialChangeText, {color: '#e74c3c'}]}>+12.3%</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Arial',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c6e49',
    fontFamily: 'Arial',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#2c6e49',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Arial',
  },
  viewAll: {
    fontSize: 14,
    color: '#2c6e49',
    fontWeight: '500',
    fontFamily: 'Arial',
  },
  weatherMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  weatherInfo: {
    flex: 1,
  },
  temperature: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Arial',
  },
  weatherCondition: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
    fontFamily: 'Arial',
  },
  weatherSubInfo: {
    fontSize: 14,
    color: '#777',
    fontFamily: 'Arial',
  },
  weatherIconContainer: {
    marginLeft: 10,
  },
  forecastContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  forecastDay: {
    alignItems: 'center',
  },
  forecastDayText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    fontFamily: 'Arial',
  },
  forecastTemp: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 5,
    fontFamily: 'Arial',
  },
  cropItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
    fontFamily: 'Arial',
  },
  cropDetails: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Arial',
  },
  cropHealthContainer: {
    alignItems: 'flex-end',
  },
  cropHealth: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
    fontFamily: 'Arial',
  },
  excellent: {
    color: '#2c6e49',
  },
  good: {
    color: '#4d9e39',
  },
  fair: {
    color: '#e9a23b',
  },
  harvestDays: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Arial',
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  taskLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  highPriority: {
    backgroundColor: '#e74c3c',
  },
  mediumPriority: {
    backgroundColor: '#f39c12',
  },
  lowPriority: {
    backgroundColor: '#3498db',
  },
  taskName: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Arial',
  },
  taskRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDate: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
    fontFamily: 'Arial',
  },
  checkButton: {
    padding: 5,
  },
  noTasksText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 15,
    fontFamily: 'Arial',
  },
  addTaskButton: {
    backgroundColor: '#2c6e49',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 15,
  },
  addTaskText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
    marginLeft: 5,
    fontFamily: 'Arial',
  },
  inventoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inventoryStat: {
    alignItems: 'center',
    flex: 1,
    padding: 10,
  },
  inventoryStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
    fontFamily: 'Arial',
  },
  inventoryStatLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Arial',
  },
  financialInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  financialItem: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  financialLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontFamily: 'Arial',
  },
  financialValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    fontFamily: 'Arial',
  },
  financialChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  financialChangeText: {
    fontSize: 14,
    color: '#2c6e49',
    marginLeft: 5,
    fontWeight: '500',
    fontFamily: 'Arial',
  },
});

export default DashboardScreen;