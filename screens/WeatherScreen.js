// screens/WeatherScreen.js
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Dữ liệu mẫu - trong ứng dụng thật, dữ liệu này sẽ được lấy từ API thời tiết
const mockWeatherData = {
  current: {
    temperature: 24,
    feelsLike: 26,
    condition: 'Mây rải rác',
    humidity: 65,
    windSpeed: 8,
    windDirection: 'ĐB',
    pressure: 1012,
    uvIndex: 6,
    visibility: 10,
    precipitation: 0,
  },
  hourly: [
    { time: 'Bây giờ', temp: 24, condition: 'Mây rải rác', icon: 'partly-sunny-outline' },
    { time: '12 giờ', temp: 25, condition: 'Mây rải rác', icon: 'partly-sunny-outline' },
    { time: '13 giờ', temp: 26, condition: 'Nắng nhẹ', icon: 'sunny-outline' },
    { time: '14 giờ', temp: 27, condition: 'Nắng', icon: 'sunny-outline' },
    { time: '15 giờ', temp: 27, condition: 'Nắng', icon: 'sunny-outline' },
    { time: '16 giờ', temp: 26, condition: 'Nắng', icon: 'sunny-outline' },
    { time: '17 giờ', temp: 25, condition: 'Nắng', icon: 'sunny-outline' },
    { time: '18 giờ', temp: 24, condition: 'Quang đãng', icon: 'sunny-outline' },
    { time: '19 giờ', temp: 22, condition: 'Quang đãng', icon: 'moon-outline' },
    { time: '20 giờ', temp: 21, condition: 'Quang đãng', icon: 'moon-outline' },
  ],
  daily: [
    { day: 'Hôm nay', high: 27, low: 19, condition: 'Mây rải rác', icon: 'partly-sunny-outline', precipitation: 10 },
    { day: 'Thứ 4', high: 29, low: 20, condition: 'Nắng', icon: 'sunny-outline', precipitation: 0 },
    { day: 'Thứ 5', high: 22, low: 18, condition: 'Mưa', icon: 'rainy-outline', precipitation: 70 },
    { day: 'Thứ 6', high: 23, low: 17, condition: 'Nhiều mây', icon: 'cloud-outline', precipitation: 30 },
    { day: 'Thứ 7', high: 25, low: 18, condition: 'Mây rải rác', icon: 'partly-sunny-outline', precipitation: 20 },
    { day: 'CN', high: 26, low: 19, condition: 'Nắng', icon: 'sunny-outline', precipitation: 0 },
    { day: 'Thứ 2', high: 27, low: 20, condition: 'Nắng', icon: 'sunny-outline', precipitation: 0 },
  ],
  farmImpact: [
    {
      title: 'Tưới tiêu',
      description: 'Cân nhắc tưới nước trong 2 ngày tới vì khả năng mưa thấp.',
      icon: 'water-outline',
    },
    {
      title: 'Làm đồng',
      description: 'Điều kiện tốt cho công việc đồng áng hôm nay và ngày mai. Chuẩn bị cho mưa vào thứ Năm.',
      icon: 'construct-outline',
    },
    {
      title: 'Nguy cơ Sâu bệnh',
      description: 'Nguy cơ trung bình về bệnh nấm với độ ẩm sắp tới.',
      icon: 'bug-outline',
    },
  ],
  location: 'Trang trại Thung lũng Xanh',
  lastUpdated: '11/04, 11:25 Sáng',
};

const WeatherScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [weatherData, setWeatherData] = useState(mockWeatherData);
  const [activeSection, setActiveSection] = useState('daily');

  // Mô phỏng làm mới
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Trong ứng dụng thật, bạn sẽ lấy dữ liệu mới ở đây
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Tiêu đề với vị trí */}
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={20} color="#2c6e49" />
            <Text style={styles.locationText}>{weatherData.location}</Text>
          </View>
          <Text style={styles.lastUpdated}>
            Cập nhật: {weatherData.lastUpdated}
          </Text>
        </View>

        {/* Thời tiết Hiện tại */}
        <View style={styles.currentWeatherContainer}>
          <View style={styles.currentWeatherMain}>
            <Ionicons
              name={
                weatherData.current.condition.toLowerCase().includes('nắng')
                  ? 'sunny-outline'
                  : weatherData.current.condition.toLowerCase().includes('mây')
                  ? weatherData.current.condition.toLowerCase().includes('rải rác')
                    ? 'partly-sunny-outline'
                    : 'cloud-outline'
                  : weatherData.current.condition.toLowerCase().includes('mưa')
                  ? 'rainy-outline'
                  : 'cloud-outline'
              }
              size={80}
              color="#2c6e49"
            />
            <View style={styles.temperatureContainer}>
              <Text style={styles.temperature}>
                {weatherData.current.temperature}°C
              </Text>
              <Text style={styles.condition}>
                {weatherData.current.condition}
              </Text>
              <Text style={styles.feelsLike}>
                Cảm giác như {weatherData.current.feelsLike}°C
              </Text>
            </View>
          </View>

          <View style={styles.currentWeatherDetails}>
            <View style={styles.weatherDetail}>
              <Ionicons name="water-outline" size={18} color="#2c6e49" />
              <Text style={styles.weatherDetailText}>
                {weatherData.current.humidity}%
              </Text>
              <Text style={styles.weatherDetailLabel}>Độ ẩm</Text>
            </View>

            <View style={styles.weatherDetail}>
              <Ionicons name="speedometer-outline" size={18} color="#2c6e49" />
              <Text style={styles.weatherDetailText}>
                {weatherData.current.windSpeed} km/h
              </Text>
              <Text style={styles.weatherDetailLabel}>Gió</Text>
            </View>

            <View style={styles.weatherDetail}>
              <Ionicons name="rainy-outline" size={18} color="#2c6e49" />
              <Text style={styles.weatherDetailText}>
                {weatherData.current.precipitation}%
              </Text>
              <Text style={styles.weatherDetailLabel}>Mưa</Text>
            </View>

            <View style={styles.weatherDetail}>
              <Ionicons name="sunny-outline" size={18} color="#2c6e49" />
              <Text style={styles.weatherDetailText}>
                {weatherData.current.uvIndex}
              </Text>
              <Text style={styles.weatherDetailLabel}>Chỉ số UV</Text>
            </View>
          </View>
        </View>

        {/* Thẻ Dự báo */}
        <View style={styles.forecastTabsContainer}>
          <TouchableOpacity
            style={[
              styles.forecastTab,
              activeSection === 'hourly' && styles.activeTab,
            ]}
            onPress={() => setActiveSection('hourly')}
          >
            <Text
              style={[
                styles.forecastTabText,
                activeSection === 'hourly' && styles.activeTabText,
              ]}
            >
              Theo giờ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.forecastTab,
              activeSection === 'daily' && styles.activeTab,
            ]}
            onPress={() => setActiveSection('daily')}
          >
            <Text
              style={[
                styles.forecastTabText,
                activeSection === 'daily' && styles.activeTabText,
              ]}
            >
              7 Ngày
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.forecastTab,
              activeSection === 'impact' && styles.activeTab,
            ]}
            onPress={() => setActiveSection('impact')}
          >
            <Text
              style={[
                styles.forecastTabText,
                activeSection === 'impact' && styles.activeTabText,
              ]}
            >
              Ảnh hưởng Nông nghiệp
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dự báo Theo giờ */}
        {activeSection === 'hourly' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.hourlyContainer}
            contentContainerStyle={styles.hourlyContent}
          >
            {weatherData.hourly.map((hour, index) => (
              <View key={index} style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>{hour.time}</Text>
                <Ionicons name={hour.icon} size={24} color="#555" />
                <Text style={styles.hourlyTemp}>{hour.temp}°</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Dự báo Hàng ngày */}
        {activeSection === 'daily' && (
          <View style={styles.dailyContainer}>
            {weatherData.daily.map((day, index) => (
              <View key={index} style={styles.dailyItem}>
                <Text style={styles.dailyDay}>
                  {index === 0 ? 'Hôm nay' : day.day}
                </Text>
                <View style={styles.dailyIconContainer}>
                  <Ionicons name={day.icon} size={24} color="#555" />
                </View>
                <Text style={styles.dailyCondition}>{day.condition}</Text>
                <View style={styles.dailyTempContainer}>
                  <Text style={styles.dailyTempHigh}>{day.high}°</Text>
                  <Text style={styles.dailyTempLow}>{day.low}°</Text>
                </View>
                <View style={styles.precipitationContainer}>
                  <Ionicons name="water-outline" size={16} color="#4fc3f7" />
                  <Text style={styles.precipitationText}>{day.precipitation}%</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Ảnh hưởng Nông nghiệp */}
        {activeSection === 'impact' && (
          <View style={styles.impactContainer}>
            {weatherData.farmImpact.map((impact, index) => (
              <View key={index} style={styles.impactItem}>
                <View
                  style={[
                    styles.impactIconContainer,
                    {
                      backgroundColor:
                        impact.title === 'Tưới tiêu'
                          ? '#e3f2fd'
                          : impact.title === 'Làm đồng'
                          ? '#e8f5e9'
                          : '#fff3e0',
                    },
                  ]}
                >
                  <Ionicons
                    name={impact.icon}
                    size={24}
                    color={
                      impact.title === 'Tưới tiêu'
                        ? '#2196f3'
                        : impact.title === 'Làm đồng'
                        ? '#2c6e49'
                        : '#ff9800'
                    }
                  />
                </View>
                <View style={styles.impactInfo}>
                  <Text style={styles.impactTitle}>{impact.title}</Text>
                  <Text style={styles.impactDescription}>
                    {impact.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Thông tin Thời tiết Bổ sung */}
        <View style={styles.additionalInfoContainer}>
          <Text style={styles.additionalInfoTitle}>Thông tin Bổ sung</Text>

          <View style={styles.additionalInfoGrid}>
            <View style={styles.additionalInfoItem}>
              <Text style={styles.additionalInfoLabel}>Áp suất</Text>
              <Text style={styles.additionalInfoValue}>
                {weatherData.current.pressure} hPa
              </Text>
            </View>

            <View style={styles.additionalInfoItem}>
              <Text style={styles.additionalInfoLabel}>Tầm nhìn</Text>
              <Text style={styles.additionalInfoValue}>
                {weatherData.current.visibility} km
              </Text>
            </View>

            <View style={styles.additionalInfoItem}>
              <Text style={styles.additionalInfoLabel}>Hướng gió</Text>
              <Text style={styles.additionalInfoValue}>
                {weatherData.current.windDirection}
              </Text>
            </View>

            <View style={styles.additionalInfoItem}>
              <Text style={styles.additionalInfoLabel}>Chỉ số UV</Text>
              <Text style={styles.additionalInfoValue}>
                {weatherData.current.uvIndex} ({weatherData.current.uvIndex < 3 ? 'Thấp' : weatherData.current.uvIndex < 6 ? 'Trung bình' : weatherData.current.uvIndex < 8 ? 'Cao' : 'Rất cao'})
              </Text>
            </View>
          </View>
        </View>

        {/* Hành động */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="notifications-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Đặt Cảnh báo Thời tiết</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.secondaryActionButton]}>
            <Ionicons name="share-outline" size={20} color="#2c6e49" />
            <Text style={styles.secondaryActionButtonText}>Chia sẻ Dự báo</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 5,
    fontFamily: 'Arial',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Arial',
  },
  currentWeatherContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentWeatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  temperatureContainer: {
    marginLeft: 20,
  },
  temperature: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Arial',
  },
  condition: {
    fontSize: 18,
    color: '#555',
    marginBottom: 5,
    fontFamily: 'Arial',
  },
  feelsLike: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Arial',
  },
  currentWeatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  weatherDetail: {
    alignItems: 'center',
  },
  weatherDetailText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
    fontFamily: 'Arial',
  },
  weatherDetailLabel: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Arial',
  },
  forecastTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 10,
    padding: 5,
  },
  forecastTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  forecastTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'Arial',
  },
  activeTabText: {
    color: '#2c6e49',
    fontWeight: 'bold',
  },
  hourlyContainer: {
    marginBottom: 20,
  },
  hourlyContent: {
    paddingHorizontal: 15,
    paddingBottom: 5,
  },
  hourlyItem: {
    alignItems: 'center',
    marginHorizontal: 10,
    width: 60,
  },
  hourlyTime: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    fontFamily: 'Arial',
  },
  hourlyTemp: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 8,
    fontFamily: 'Arial',
  },
  dailyContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dailyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dailyDay: {
    width: 70,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    fontFamily: 'Arial',
  },
  dailyIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  dailyCondition: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    fontFamily: 'Arial',
  },
  dailyTempContainer: {
    flexDirection: 'row',
    width: 70,
    justifyContent: 'flex-end',
  },
  dailyTempHigh: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 5,
    fontFamily: 'Arial',
  },
  dailyTempLow: {
    fontSize: 15,
    color: '#888',
    fontFamily: 'Arial',
  },
  precipitationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 50,
    justifyContent: 'flex-end',
  },
  precipitationText: {
    fontSize: 14,
    color: '#4fc3f7',
    marginLeft: 4,
    fontFamily: 'Arial',
  },
  impactContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  impactIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  impactInfo: {
    flex: 1,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
    fontFamily: 'Arial',
  },
  impactDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontFamily: 'Arial',
  },
  additionalInfoContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  additionalInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    fontFamily: 'Arial',
  },
  additionalInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  additionalInfoItem: {
    width: '48%',
    marginBottom: 15,
  },
  additionalInfoLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 3,
    fontFamily: 'Arial',
  },
  additionalInfoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    fontFamily: 'Arial',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  actionButton: {
    backgroundColor: '#2c6e49',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
    marginLeft: 8,
    fontFamily: 'Arial',
  },
  secondaryActionButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2c6e49',
  },
  secondaryActionButtonText: {
    color: '#2c6e49',
    fontWeight: '500',
    fontSize: 16,
    marginLeft: 8,
    fontFamily: 'Arial',
  },
});

export default WeatherScreen;