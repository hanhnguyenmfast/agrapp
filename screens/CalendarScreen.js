// screens/CalendarScreen.js
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Dữ liệu mẫu cho sự kiện lịch
const mockEvents = [
  { id: '1', title: 'Họp Nhóm', date: '11/04/2025', time: '09:00 AM', location: 'Văn phòng chính', type: 'meeting' },
  { id: '2', title: 'Bảo trì Thiết bị', date: '12/04/2025', time: '10:30 AM', location: 'Kho thiết bị', type: 'maintenance' },
  { id: '3', title: 'Kiểm tra Mùa vụ', date: '12/04/2025', time: '02:00 PM', location: 'Cánh đồng Bắc', type: 'inspection' },
  { id: '4', title: 'Gặp Nhà cung cấp', date: '15/04/2025', time: '11:00 AM', location: 'Cổng Trang trại', type: 'meeting' },
  { id: '5', title: 'Lập kế hoạch Thu hoạch', date: '18/04/2025', time: '09:30 AM', location: 'Phòng họp', type: 'planning' },
];

// Các ngày trong tuần
const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// Lấy ngày trong tuần hiện tại
const getCurrentWeekDates = () => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, v.v.

  return daysOfWeek.map((day, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - currentDay + index);
    return {
      day,
      date: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      isToday: index === currentDay,
    };
  });
};

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState(getCurrentWeekDates());
  const [events, setEvents] = useState(mockEvents);

  // Lấy biểu tượng sự kiện dựa trên loại
  const getEventIcon = (type) => {
    switch (type) {
      case 'meeting':
        return 'people-outline';
      case 'maintenance':
        return 'construct-outline';
      case 'inspection':
        return 'search-outline';
      case 'planning':
        return 'calendar-outline';
      default:
        return 'calendar-outline';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tiêu đề */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Xem Tuần */}
      <View style={styles.weekContainer}>
        <View style={styles.weekHeader}>
          <TouchableOpacity>
            <Ionicons name="chevron-back" size={24} color="#2c6e49" />
          </TouchableOpacity>
          <Text style={styles.monthText}>Tháng 4, 2025</Text>
          <TouchableOpacity>
            <Ionicons name="chevron-forward" size={24} color="#2c6e49" />
          </TouchableOpacity>
        </View>

        <View style={styles.daysContainer}>
          {weekDates.map((dateInfo, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayItem,
                dateInfo.isToday && styles.todayItem,
              ]}
              onPress={() => {
                // Trong ứng dụng thực tế, sẽ lọc sự kiện cho ngày này
              }}
            >
              <Text
                style={[
                  styles.dayText,
                  dateInfo.isToday && styles.todayText,
                ]}
              >
                {dateInfo.day}
              </Text>
              <View
                style={[
                  styles.dateCircle,
                  dateInfo.isToday && styles.todayCircle,
                ]}
              >
                <Text
                  style={[
                    styles.dateText,
                    dateInfo.isToday && styles.todayDateText,
                  ]}
                >
                  {dateInfo.date}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Danh sách Sự kiện */}
      <View style={styles.eventsHeader}>
        <Text style={styles.eventsTitle}>Sự kiện Sắp tới</Text>
        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={18} color="#2c6e49" />
            <Text style={styles.filterText}>Lọc</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.eventsList}>
        {events.map((event) => (
          <TouchableOpacity key={event.id} style={styles.eventItem}>
            <View
              style={[
                styles.eventIcon,
                {
                  backgroundColor:
                    event.type === 'meeting'
                      ? '#e3f2fd'
                      : event.type === 'maintenance'
                      ? '#ffe0b2'
                      : event.type === 'inspection'
                      ? '#e8f5e9'
                      : '#f3e5f5',
                },
              ]}
            >
              <Ionicons
                name={getEventIcon(event.type)}
                size={20}
                color={
                  event.type === 'meeting'
                    ? '#1976d2'
                    : event.type === 'maintenance'
                    ? '#f57c00'
                    : event.type === 'inspection'
                    ? '#2c6e49'
                    : '#9c27b0'
                }
              />
            </View>

            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <View style={styles.eventMeta}>
                <View style={styles.eventMetaItem}>
                  <Ionicons name="time-outline" size={14} color="#666" />
                  <Text style={styles.eventMetaText}>
                    {event.date}, {event.time}
                  </Text>
                </View>
                <View style={styles.eventMetaItem}>
                  <Ionicons name="location-outline" size={14} color="#666" />
                  <Text style={styles.eventMetaText}>{event.location}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="ellipsis-vertical" size={18} color="#666" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
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
  weekContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    fontFamily: 'Arial',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  dayItem: {
    alignItems: 'center',
  },
  todayItem: {
    // Không có kiểu cụ thể cho container
  },
  dayText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontFamily: 'Arial',
  },
  todayText: {
    color: '#2c6e49',
    fontWeight: '500',
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCircle: {
    backgroundColor: '#2c6e49',
  },
  dateText: {
    fontSize: 15,
    color: '#333',
    fontFamily: 'Arial',
  },
  todayDateText: {
    color: 'white',
    fontWeight: 'bold',
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Arial',
  },
  filterContainer: {
    flexDirection: 'row',
  },
  // Tiếp tục CalendarScreen.js styles
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  filterText: {
    fontSize: 14,
    color: '#2c6e49',
    marginLeft: 5,
    fontFamily: 'Arial',
  },
  eventsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  eventItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
    fontFamily: 'Arial',
  },
  eventMeta: {
    flexDirection: 'column',
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  eventMetaText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 5,
    fontFamily: 'Arial',
  },
  moreButton: {
    padding: 5,
  },
});

export default CalendarScreen;