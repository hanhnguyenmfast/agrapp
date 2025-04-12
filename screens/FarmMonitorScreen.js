// screens/FarmMonitorScreen.js
// screens/FarmMonitorScreen.js
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Dữ liệu mẫu - trong ứng dụng thật, dữ liệu này sẽ đến từ API
const mockCrops = [
  {
    id: '1',
    name: 'Ngô',
    area: '10 mẫu',
    status: 'Đang phát triển',
    health: 'Tốt',
    soilMoisture: 68,
    plantHeight: 4.2,
    daysToHarvest: 35,
    lastActivity: 'Tưới tiêu (2 ngày trước)',
    notes: 'Phát triển tốt sau đợt mưa gần đây',
    image: { uri: 'https://via.placeholder.com/150' },
  },
  {
    id: '2',
    name: 'Lúa mì',
    area: '15 mẫu',
    status: 'Đang phát triển',
    health: 'Xuất sắc',
    soilMoisture: 72,
    plantHeight: 2.8,
    daysToHarvest: 20,
    lastActivity: 'Bón phân (5 ngày trước)',
    notes: 'Tình trạng xuất sắc, đúng tiến độ cho năng suất cao',
    image: require('../assets/crop-placeholder.png'),
  },
  {
    id: '3',
    name: 'Đậu nành',
    area: '8 mẫu',
    status: 'Đang phát triển',
    health: 'Khá',
    soilMoisture: 55,
    plantHeight: 1.5,
    daysToHarvest: 45,
    lastActivity: 'Kiểm soát sâu bệnh (1 ngày trước)',
    notes: 'Có dấu hiệu bị sâu hại, đã xử lý',
    image: require('../assets/crop-placeholder.png'),
  },
];

const FarmMonitorScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [crops, setCrops] = useState(mockCrops);
  const [selectedCrop, setSelectedCrop] = useState(crops[0]);
  const [activeTab, setActiveTab] = useState('overview');

  // Mô phỏng làm mới
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Trong ứng dụng thật, bạn sẽ lấy dữ liệu mới ở đây
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Lấy màu trạng thái
  const getHealthColor = (health) => {
    switch (health) {
      case 'Xuất sắc':
        return '#2c6e49';
      case 'Tốt':
        return '#4d9e39';
      case 'Khá':
        return '#e9a23b';
      case 'Kém':
        return '#e74c3c';
      default:
        return '#4d9e39';
    }
  };

  // Lấy trạng thái độ ẩm
  const getMoistureStatus = (value) => {
    if (value >= 70) return 'Tối ưu';
    if (value >= 60) return 'Tốt';
    if (value >= 50) return 'Khá';
    return 'Thấp';
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
          <Text style={styles.headerTitle}>Giám sát Trang trại</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Lựa chọn Cây trồng */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cropSelectionContainer}
          contentContainerStyle={styles.cropSelectionContent}
        >
          {crops.map((crop) => (
            <TouchableOpacity
              key={crop.id}
              style={[
                styles.cropSelectionItem,
                selectedCrop.id === crop.id && styles.cropSelectionItemActive,
              ]}
              onPress={() => setSelectedCrop(crop)}
            >
              <Text
                style={[
                  styles.cropSelectionName,
                  selectedCrop.id === crop.id && styles.cropSelectionNameActive,
                ]}
              >
                {crop.name}
              </Text>
              <View
                style={[
                  styles.cropHealthIndicator,
                  { backgroundColor: getHealthColor(crop.health) },
                ]}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Hình ảnh Cây trồng và Tóm tắt */}
        <View style={styles.cropSummaryContainer}>
          <Image source={selectedCrop.image} style={styles.cropImage} />

          <View style={styles.cropSummary}>
            <View style={styles.cropSummaryHeader}>
              <Text style={styles.cropName}>{selectedCrop.name}</Text>
              <View
                style={[
                  styles.healthBadge,
                  { backgroundColor: getHealthColor(selectedCrop.health) + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.healthText,
                    { color: getHealthColor(selectedCrop.health) },
                  ]}
                >
                  {selectedCrop.health}
                </Text>
              </View>
            </View>

            <View style={styles.cropDetails}>
              <View style={styles.cropDetailItem}>
                <Text style={styles.cropDetailLabel}>Diện tích:</Text>
                <Text style={styles.cropDetailValue}>{selectedCrop.area}</Text>
              </View>

              <View style={styles.cropDetailItem}>
                <Text style={styles.cropDetailLabel}>Trạng thái:</Text>
                <Text style={styles.cropDetailValue}>{selectedCrop.status}</Text>
              </View>

              <View style={styles.cropDetailItem}>
                <Text style={styles.cropDetailLabel}>Thu hoạch trong:</Text>
                <Text style={styles.cropDetailValue}>
                  {selectedCrop.daysToHarvest} ngày
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Thẻ */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'overview' && styles.activeTabText,
              ]}
            >
              Tổng quan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'metrics' && styles.activeTab]}
            onPress={() => setActiveTab('metrics')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'metrics' && styles.activeTabText,
              ]}
            >
              Chỉ số
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setActiveTab('history')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'history' && styles.activeTabText,
              ]}
            >
              Lịch sử
            </Text>
          </TouchableOpacity>
        </View>

        {/* Nội dung Thẻ */}
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Tóm tắt Tình trạng Cây trồng</Text>
              <Text style={styles.cropNotes}>{selectedCrop.notes}</Text>

              <Text style={styles.lastActivity}>
                Hoạt động gần nhất: {selectedCrop.lastActivity}
              </Text>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="add-circle-outline" size={18} color="white" />
                <Text style={styles.actionButtonText}>Thêm Hoạt động</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Cảnh báo & Khuyến nghị</Text>

              <View style={styles.alertItem}>
                <View style={[styles.alertIcon, { backgroundColor: '#ffe0b2' }]}>
                  <Ionicons name="water-outline" size={20} color="#f57c00" />
                </View>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertTitle}>Cần Tưới nước</Text>
                  <Text style={styles.alertDescription}>
                    Độ ẩm đất đang giảm. Lên lịch tưới trong 2-3 ngày tới.
                  </Text>
                </View>
              </View>

              <View style={styles.alertItem}>
                <View style={[styles.alertIcon, { backgroundColor: '#e8f5e9' }]}>
                  <Ionicons name="leaf-outline" size={20} color="#2c6e49" />
                </View>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertTitle}>Tăng trưởng Tối ưu</Text>
                  <Text style={styles.alertDescription}>
                    Chiều cao cây đúng mục tiêu cho giai đoạn phát triển này. Tiếp tục áp dụng các biện pháp quản lý hiện tại.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'metrics' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Chỉ số Đất & Tăng trưởng</Text>

              {/* Độ ẩm đất */}
              <View style={styles.metricItem}>
                <View style={styles.metricHeader}>
                  <View style={styles.metricLabelContainer}>
                    <Ionicons name="water-outline" size={18} color="#2c6e49" />
                    <Text style={styles.metricLabel}>Độ ẩm Đất</Text>
                  </View>
                  <View
                    style={[
                      styles.metricStatusBadge,
                      {
                        backgroundColor:
                          getMoistureStatus(selectedCrop.soilMoisture) === 'Tối ưu'
                            ? '#e8f5e9'
                            : getMoistureStatus(selectedCrop.soilMoisture) === 'Tốt'
                            ? '#fffde7'
                            : '#ffebee',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.metricStatusText,
                        {
                          color:
                            getMoistureStatus(selectedCrop.soilMoisture) === 'Tối ưu'
                              ? '#2c6e49'
                              : getMoistureStatus(selectedCrop.soilMoisture) === 'Tốt'
                              ? '#f9a825'
                              : '#e53935',
                        },
                      ]}
                    >
                      {getMoistureStatus(selectedCrop.soilMoisture)}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${selectedCrop.soilMoisture}%` },
                    ]}
                  />
                </View>

                <View style={styles.metricFooter}>
                  <Text style={styles.metricValue}>{selectedCrop.soilMoisture}%</Text>
                  <Text style={styles.metricRange}>Mục tiêu: 65-75%</Text>
                </View>
              </View>

              {/* Chiều cao cây */}
              <View style={styles.metricItem}>
                <View style={styles.metricHeader}>
                  <View style={styles.metricLabelContainer}>
                    <Ionicons name="trending-up-outline" size={18} color="#2c6e49" />
                    <Text style={styles.metricLabel}>Chiều cao Cây</Text>
                  </View>
                </View>

                <View style={styles.metricFooter}>
                  <Text style={styles.metricValue}>{selectedCrop.plantHeight} ft</Text>
                  <Text style={styles.metricRange}>Mục tiêu: 4.0-5.0 ft</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Ảnh hưởng Thời tiết</Text>
                <TouchableOpacity>
                  <Text style={styles.viewMore}>Xem Dự báo</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.weatherImpactItem}>
                <View style={styles.weatherImpactIcon}>
                  <Ionicons name="sunny-outline" size={24} color="#f9a825" />
                </View>
                <View style={styles.weatherImpactInfo}>
                  <Text style={styles.weatherImpactTitle}>Nhiệt độ</Text>
                  <Text style={styles.weatherImpactDescription}>
                    Nhiệt độ hiện tại lý tưởng cho sự phát triển cây trồng. Dự kiến cao nhất 29°C trong tuần tới.
                  </Text>
                </View>
              </View>

              <View style={styles.weatherImpactItem}>
                <View style={styles.weatherImpactIcon}>
                  <Ionicons name="rainy-outline" size={24} color="#4fc3f7" />
                </View>
                <View style={styles.weatherImpactInfo}>
                  <Text style={styles.weatherImpactTitle}>Lượng mưa</Text>
                  <Text style={styles.weatherImpactDescription}>
                    Dự kiến mưa nhẹ trong 3 ngày tới. Cân nhắc hoãn lịch tưới tiêu đã lên.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'history' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Lịch sử Hoạt động</Text>

              <View style={styles.activityItem}>
                <View style={styles.activityDate}>
                  <Text style={styles.activityDay}>09</Text>
                  <Text style={styles.activityMonth}>TH4</Text>
                </View>
                <View style={styles.activityDivider} />
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>Tưới nước</Text>
                  <Text style={styles.activityDescription}>
                    Tưới 1.5 inches nước trên toàn bộ khu vực trồng.
                  </Text>
                  <View style={styles.activityMeta}>
                    <Text style={styles.activityPerformedBy}>Bởi: Nguyễn Văn A</Text>
                  </View>
                </View>
              </View>

              <View style={styles.activityItem}>
                <View style={styles.activityDate}>
                  <Text style={styles.activityDay}>05</Text>
                  <Text style={styles.activityMonth}>TH4</Text>
                </View>
                <View style={styles.activityDivider} />
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>Bón phân</Text>
                  <Text style={styles.activityDescription}>
                    Bón phân giàu nitơ để hỗ trợ giai đoạn tăng trưởng ban đầu.
                  </Text>
                  <View style={styles.activityMeta}>
                    <Text style={styles.activityPerformedBy}>Bởi: Trần Thị B</Text>
                  </View>
                </View>
              </View>

              <View style={styles.activityItem}>
                <View style={styles.activityDate}>
                  <Text style={styles.activityDay}>28</Text>
                  <Text style={styles.activityMonth}>TH3</Text>
                </View>
                <View style={styles.activityDivider} />
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>Kiểm tra Đất</Text>
                  <Text style={styles.activityDescription}>
                    Tiến hành phân tích đất toàn diện. Kết quả: pH 6.8, hàm lượng nitơ tốt.
                  </Text>
                  <View style={styles.activityMeta}>
                    <Text style={styles.activityPerformedBy}>Bởi: Đội Kỹ thuật</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.viewMoreButton}>
                <Text style={styles.viewMoreButtonText}>Xem Lịch sử Đầy đủ</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c6e49',
    fontFamily: 'Arial',
  },
  addButton: {
    backgroundColor: '#2c6e49',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropSelectionContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  cropSelectionContent: {
    paddingHorizontal: 15,
  },
  cropSelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cropSelectionItemActive: {
    backgroundColor: '#2c6e49',
    borderColor: '#2c6e49',
  },
  cropSelectionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    fontFamily: 'Arial',
  },
  cropSelectionNameActive: {
    color: 'white',
  },
  cropHealthIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  cropSummaryContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cropImage: {
    width: '100%',
    height: 180,
  },
  cropSummary: {
    padding: 15,
  },
  cropSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cropName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Arial',
  },
  healthBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  healthText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Arial',
  },
  cropDetails: {
    marginTop: 5,
  },
  cropDetailItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  cropDetailLabel: {
    fontSize: 15,
    color: '#666',
    width: 110,
    fontFamily: 'Arial',
  },
  cropDetailValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    fontFamily: 'Arial',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 5,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  tabText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
    fontFamily: 'Arial',
  },
  activeTabText: {
    color: '#2c6e49',
    fontWeight: 'bold',
  },
  tabContent: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 10,
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
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    fontFamily: 'Arial',
  },
  viewMore: {
    fontSize: 14,
    color: '#2c6e49',
    fontWeight: '500',
    fontFamily: 'Arial',
  },
  cropNotes: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 15,
    fontFamily: 'Arial',
  },
  lastActivity: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 15,
    fontFamily: 'Arial',
  },
  actionButton: {
    backgroundColor: '#2c6e49',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
    marginLeft: 5,
    fontFamily: 'Arial',
  },
  alertItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 3,
    fontFamily: 'Arial',
  },
  alertDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontFamily: 'Arial',
  },
  metricItem: {
    marginBottom: 20,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 6,
    fontFamily: 'Arial',
  },
  metricStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  metricStatusText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Arial',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#f1f1f1',
    borderRadius: 6,
    marginBottom: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2c6e49',
    borderRadius: 6,
  },
  metricFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Arial',
  },
  metricRange: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Arial',
  },
  weatherImpactItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  weatherImpactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  weatherImpactInfo: {
    flex: 1,
  },
  weatherImpactTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 3,
    fontFamily: 'Arial',
  },
  weatherImpactDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontFamily: 'Arial',
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  activityDate: {
    width: 50,
    alignItems: 'center',
  },
  activityDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Arial',
  },
  activityMonth: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Arial',
  },
  activityDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 15,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 3,
    fontFamily: 'Arial',
  },
  activityDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 5,
    fontFamily: 'Arial',
  },
  activityMeta: {
    flexDirection: 'row',
  },
  activityPerformedBy: {
    fontSize: 13,
    color: '#888',
    fontFamily: 'Arial',
  },
  viewMoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 5,
  },
  viewMoreButtonText: {
    color: '#2c6e49',
    fontWeight: '500',
    fontSize: 14,
    fontFamily: 'Arial',
  },
});

export default FarmMonitorScreen;