// screens/TasksScreen.js
// screens/TasksScreen.js
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Dữ liệu mẫu - trong ứng dụng thật, sẽ lấy từ API
const mockTasks = [
  {
    id: '1',
    title: 'Kiểm tra Hệ thống Tưới',
    description: 'Kiểm tra hệ thống tưới ở ruộng ngô',
    dueDate: '11/04/2025',
    priority: 'Cao',
    assignedTo: 'Nguyễn Văn A',
    category: 'Bảo trì',
    completed: false
  },
  {
    id: '2',
    title: 'Bón Phân',
    description: 'Bón phân nitơ cho ruộng lúa mì',
    dueDate: '12/04/2025',
    priority: 'Trung bình',
    assignedTo: 'Trần Thị B',
    category: 'Chăm sóc Cây trồng',
    completed: false
  },
  {
    id: '3',
    title: 'Lập kế hoạch Thu hoạch',
    description: 'Tạo kế hoạch cho vụ thu hoạch ngô sắp tới',
    dueDate: '15/04/2025',
    priority: 'Thấp',
    assignedTo: 'Nguyễn Văn A',
    category: 'Lập kế hoạch',
    completed: true
  },
  {
    id: '4',
    title: 'Bảo dưỡng Thiết bị',
    description: 'Lên lịch bảo dưỡng máy kéo',
    dueDate: '18/04/2025',
    priority: 'Trung bình',
    assignedTo: 'Nguyễn Văn A',
    category: 'Bảo trì',
    completed: false
  },
  {
    id: '5',
    title: 'Theo dõi Sâu bệnh',
    description: 'Kiểm tra ruộng đậu nành về hoạt động của sâu bệnh',
    dueDate: '13/04/2025',
    priority: 'Cao',
    assignedTo: 'Trần Thị B',
    category: 'Chăm sóc Cây trồng',
    completed: false
  },
];

const TasksScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState(mockTasks);
  const [filteredTasks, setFilteredTasks] = useState(mockTasks);
  const [modalVisible, setModalVisible] = useState(false);
  const [taskFilter, setTaskFilter] = useState('Tất cả');
  const [searchText, setSearchText] = useState('');
  const [editingTask, setEditingTask] = useState(null);

  // State công việc mới
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Trung bình',
    assignedTo: 'Nguyễn Văn A',
    category: 'Chăm sóc Cây trồng',
    completed: false
  });

  // Mô phỏng làm mới
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Trong ứng dụng thật, bạn sẽ lấy dữ liệu mới ở đây
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Lọc công việc dựa trên văn bản tìm kiếm và loại bộ lọc
  const filterTasks = () => {
    let result = tasks;

    // Lọc theo văn bản tìm kiếm
    if (searchText) {
      result = result.filter(task =>
        task.title.toLowerCase().includes(searchText.toLowerCase()) ||
        task.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Lọc theo trạng thái hoàn thành
    if (taskFilter === 'Đang mở') {
      result = result.filter(task => !task.completed);
    } else if (taskFilter === 'Hoàn Thành') {
      result = result.filter(task => task.completed);
    }

    setFilteredTasks(result);
  };

  // Áp dụng bộ lọc khi văn bản tìm kiếm hoặc loại bộ lọc thay đổi
  React.useEffect(() => {
    filterTasks();
  }, [searchText, taskFilter, tasks]);

  // Chuyển đổi hoàn thành công việc
  const toggleTaskCompletion = (taskId) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  };

  // Thêm công việc mới
  const addNewTask = () => {
    if (!newTask.title || !newTask.dueDate) {
      Alert.alert('Lỗi', 'Tiêu đề và ngày hạn là bắt buộc');
      return;
    }

    const taskToAdd = {
      id: String(Date.now()),
      ...newTask
    };

    setTasks([taskToAdd, ...tasks]);
    setModalVisible(false);

    // Đặt lại biểu mẫu
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      priority: 'Trung bình',
      assignedTo: 'Nguyễn Văn A',
      category: 'Chăm sóc Cây trồng',
      completed: false
    });
  };

  // Chỉnh sửa công việc hiện có
  const editTask = () => {
    if (!editingTask || !editingTask.title || !editingTask.dueDate) {
      Alert.alert('Lỗi', 'Tiêu đề và ngày hạn là bắt buộc');
      return;
    }

    const updatedTasks = tasks.map(task =>
      task.id === editingTask.id ? editingTask : task
    );

    setTasks(updatedTasks);
    setModalVisible(false);
    setEditingTask(null);
  };

  // Xử lý nhấn nút chỉnh sửa
  const handleEdit = (task) => {
    setEditingTask(task);
    setModalVisible(true);
  };

  // Mở modal cho công việc mới
  const openNewTaskModal = () => {
    setEditingTask(null);
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      priority: 'Trung bình',
      assignedTo: 'Nguyễn Văn A',
      category: 'Chăm sóc Cây trồng',
      completed: false
    });
    setModalVisible(true);
  };

  // Xóa công việc
  const deleteTask = (taskId) => {
    Alert.alert(
      'Xóa Công việc',
      'Bạn có chắc chắn muốn xóa công việc này?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Xóa',
          onPress: () => {
            const updatedTasks = tasks.filter(task => task.id !== taskId);
            setTasks(updatedTasks);
          },
          style: 'destructive'
        }
      ]
    );
  };

  // Lấy màu ưu tiên
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Cao':
        return '#e74c3c';
      case 'Trung bình':
        return '#f39c12';
      case 'Thấp':
        return '#3498db';
      default:
        return '#3498db';
    }
  };

  // Lấy biểu tượng danh mục
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Bảo trì':
        return 'construct-outline';
      case 'Chăm sóc Cây trồng':
        return 'leaf-outline';
      case 'Lập kế hoạch':
        return 'calendar-outline';
      case 'Thu hoạch':
        return 'basket-outline';
      default:
        return 'list-outline';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tiêu đề */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Công việc & Nhắc nhở</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={openNewTaskModal}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Thanh tìm kiếm */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm công việc..."
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Thẻ Bộ lọc */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, taskFilter === 'Tất cả' && styles.activeFilterTab]}
          onPress={() => setTaskFilter('Tất cả')}
        >
          <Text
            style={[
              styles.filterTabText,
              taskFilter === 'Tất cả' && styles.activeFilterTabText,
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, taskFilter === 'Đang mở' && styles.activeFilterTab]}
          onPress={() => setTaskFilter('Đang mở')}
        >
          <Text
            style={[
              styles.filterTabText,
              taskFilter === 'Đang mở' && styles.activeFilterTabText,
            ]}
          >
            Đang mở
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            taskFilter === 'Hoàn Thành' && styles.activeFilterTab,
          ]}
          onPress={() => setTaskFilter('Hoàn Thành')}
        >
          <Text
            style={[
              styles.filterTabText,
              taskFilter === 'Hoàn Thành' && styles.activeFilterTabText,
            ]}
          >
            Hoàn thành
          </Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách Công việc */}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.taskList}
      >
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <View key={task.id} style={styles.taskItem}>
              <TouchableOpacity
                style={styles.taskCheckbox}
                onPress={() => toggleTaskCompletion(task.id)}
              >
                <Ionicons
                  name={
                    task.completed
                      ? 'checkmark-circle'
                      : 'checkmark-circle-outline'
                  }
                  size={24}
                  color={task.completed ? '#2c6e49' : '#d0d0d0'}
                />
              </TouchableOpacity>

              <View style={styles.taskContent}>
                <View style={styles.taskHeader}>
                  <Text
                    style={[
                      styles.taskTitle,
                      task.completed && styles.completedTaskTitle,
                    ]}
                  >
                    {task.title}
                  </Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(task.priority) },
                    ]}
                  >
                    <Text style={styles.priorityText}>{task.priority}</Text>
                  </View>
                </View>

                <Text style={styles.taskDescription}>{task.description}</Text>

                <View style={styles.taskMeta}>
                  <View style={styles.taskMetaItem}>
                    <Ionicons name="calendar-outline" size={14} color="#666" />
                    <Text style={styles.taskMetaText}>{task.dueDate}</Text>
                  </View>

                  <View style={styles.taskMetaItem}>
                    <Ionicons name="person-outline" size={14} color="#666" />
                    <Text style={styles.taskMetaText}>{task.assignedTo}</Text>
                  </View>

                  <View style={styles.taskMetaItem}>
                    <Ionicons
                      name={getCategoryIcon(task.category)}
                      size={14}
                      color="#666"
                    />
                    <Text style={styles.taskMetaText}>{task.category}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.taskActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(task)}
                >
                  <Ionicons name="create-outline" size={20} color="#2c6e49" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteTask(task.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="list-outline" size={60} color="#d0d0d0" />
            <Text style={styles.emptyStateText}>Không tìm thấy công việc</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchText
                ? 'Thử từ khóa tìm kiếm khác'
                : taskFilter === 'Hoàn Thành'
                ? 'Hãy hoàn thành một số công việc để xem chúng ở đây'
                : taskFilter === 'Đang mở'
                ? 'Tất cả công việc đã hoàn thành!'
                : 'Thêm công việc đầu tiên của bạn bằng nút +'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Footer Tóm tắt Công việc */}
      <View style={styles.summaryFooter}>
        <View>
          <Text style={styles.summaryText}>
            {tasks.filter(task => !task.completed).length} công việc đang mở
          </Text>
        </View>
        <TouchableOpacity style={styles.summaryButton}>
          <Text style={styles.summaryButtonText}>Tạo Báo cáo</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Thêm/Sửa Công việc */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingTask ? 'Sửa Công việc' : 'Thêm Công việc Mới'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.inputLabel}>Tiêu đề Công việc*</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tiêu đề công việc"
                value={editingTask ? editingTask.title : newTask.title}
                onChangeText={(text) => editingTask
                  ? setEditingTask({...editingTask, title: text})
                  : setNewTask({ ...newTask, title: text })
                }
              />

              <Text style={styles.inputLabel}>Mô tả</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Nhập mô tả công việc"
                value={editingTask ? editingTask.description : newTask.description}
                onChangeText={(text) => editingTask
                  ? setEditingTask({...editingTask, description: text})
                  : setNewTask({ ...newTask, description: text })
                }
                multiline
                numberOfLines={4}
              />

              <Text style={styles.inputLabel}>Ngày hạn*</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY"
                value={editingTask ? editingTask.dueDate : newTask.dueDate}
                onChangeText={(text) => editingTask
                  ? setEditingTask({...editingTask, dueDate: text})
                  : setNewTask({ ...newTask, dueDate: text })
                }
              />

              <Text style={styles.inputLabel}>Ưu tiên</Text>
              <View style={styles.prioritySelector}>
                {['Thấp', 'Trung bình', 'Cao'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      (editingTask ? editingTask.priority : newTask.priority) === priority && {
                        backgroundColor: getPriorityColor(priority) + '30',
                        borderColor: getPriorityColor(priority),
                      },
                    ]}
                    onPress={() => editingTask
                      ? setEditingTask({...editingTask, priority})
                      : setNewTask({ ...newTask, priority })
                    }
                  >
                    <Text
                      style={[
                        styles.priorityOptionText,
                        (editingTask ? editingTask.priority : newTask.priority) === priority && {
                          color: getPriorityColor(priority),
                        },
                      ]}
                    >
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Giao cho</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tên"
                value={editingTask ? editingTask.assignedTo : newTask.assignedTo}
                onChangeText={(text) => editingTask
                  ? setEditingTask({...editingTask, assignedTo: text})
                  : setNewTask({ ...newTask, assignedTo: text })
                }
              />

              <Text style={styles.inputLabel}>Danh mục</Text>
              <View style={styles.categorySelector}>
                {[
                  { name: 'Chăm sóc Cây trồng', icon: 'leaf-outline' },
                  { name: 'Bảo trì', icon: 'construct-outline' },
                  { name: 'Lập kế hoạch', icon: 'calendar-outline' },
                  { name: 'Thu hoạch', icon: 'basket-outline' },
                ].map((category) => (
                  <TouchableOpacity
                    key={category.name}
                    style={[
                      styles.categoryOption,
                      (editingTask ? editingTask.category : newTask.category) === category.name && styles.activeCategoryOption,
                    ]}
                    onPress={() => editingTask
                      ? setEditingTask({...editingTask, category: category.name})
                      : setNewTask({ ...newTask, category: category.name })
                    }
                  >
                    <Ionicons
                      name={category.icon}
                      size={18}
                      color={(editingTask ? editingTask.category : newTask.category) === category.name ? 'white' : '#666'}
                    />
                    <Text
                      style={[
                        styles.categoryOptionText,
                        (editingTask ? editingTask.category : newTask.category) === category.name && styles.activeCategoryOptionText,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {editingTask && (
                <View style={styles.completionToggle}>
                  <Text style={styles.inputLabel}>Đánh dấu là Hoàn thành</Text>
                  <Switch
                    value={editingTask.completed}
                    onValueChange={(value) =>
                      setEditingTask({...editingTask, completed: value})
                    }
                    trackColor={{ false: '#d0d0d0', true: '#a8e6b8' }}
                    thumbColor={editingTask.completed ? '#2c6e49' : '#f4f3f4'}
                  />
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={editingTask ? editTask : addNewTask}
              >
                <Text style={styles.saveButtonText}>
                  {editingTask ? 'Cập nhật' : 'Thêm Công việc'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  },
  addButton: {
    backgroundColor: '#2c6e49',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  filterTabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 5,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeFilterTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterTabText: {
    color: '#2c6e49',
    fontWeight: 'bold',
  },
  taskList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  taskItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskCheckbox: {
    paddingRight: 10,
    paddingTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 5,
  },
  taskMetaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  taskActions: {
    justifyContent: 'center',
  },
  editButton: {
    padding: 5,
    marginBottom: 5,
  },
  deleteButton: {
    padding: 5,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    marginHorizontal: 30,
  },
  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  summaryButton: {
    backgroundColor: '#2c6e49',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  summaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  prioritySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  priorityOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  priorityOptionText: {
    fontWeight: '500',
    color: '#666',
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    marginBottom: 10,
  },
  activeCategoryOption: {
    backgroundColor: '#2c6e49',
    borderColor: '#2c6e49',
  },
  categoryOptionText: {
    marginLeft: 5,
    color: '#666',
  },
  activeCategoryOptionText: {
    color: 'white',
  },
  completionToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2c6e49',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
});

export default TasksScreen;