// screens/InventoryScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
  SafeAreaView,
  Alert,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Dữ liệu mẫu - trong ứng dụng thực tế, dữ liệu này sẽ được lấy từ API
const mockInventoryItems = [
  { id: '1', name: 'Phân bón (NPK)', category: 'Vật tư', quantity: 25, unit: 'bao', lastUpdated: '05/04/2025', threshold: 10, image:{ uri: 'https://via.placeholder.com/150' } },
  { id: '2', name: 'Thuốc trừ sâu', category: 'Vật tư', quantity: 10, unit: 'gallon', lastUpdated: '03/04/2025', threshold: 5, image:{ uri: 'https://via.placeholder.com/150' } },
  { id: '3', name: 'Máy kéo', category: 'Thiết bị', quantity: 2, unit: 'chiếc', lastUpdated: '01/04/2025', threshold: 1, image: { uri: 'https://via.placeholder.com/150' } },
  { id: '4', name: 'Hạt giống Ngô', category: 'Hạt giống', quantity: 50, unit: 'kg', lastUpdated: '07/04/2025', threshold: 20, image: { uri: 'https://via.placeholder.com/150' } },
  { id: '5', name: 'Hạt giống Lúa mì', category: 'Hạt giống', quantity: 30, unit: 'kg', lastUpdated: '07/04/2025', threshold: 15, image: { uri: 'https://via.placeholder.com/150' } },
  { id: '6', name: 'Ống tưới', category: 'Thiết bị', quantity: 100, unit: 'mét', lastUpdated: '02/04/2025', threshold: 30, image: { uri: 'https://via.placeholder.com/150' } },
  { id: '7', name: 'Nhiên liệu Diesel', category: 'Vật tư', quantity: 200, unit: 'lít', lastUpdated: '08/04/2025', threshold: 50, image: { uri: 'https://via.placeholder.com/150' } },
];

const InventoryScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [inventory, setInventory] = useState(mockInventoryItems);
  const [filteredInventory, setFilteredInventory] = useState(mockInventoryItems);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Giá trị mặc định cho mặt hàng kho mới
  const defaultNewItem = {
    name: '',
    category: 'Vật tư',
    quantity: '',
    unit: '',
    threshold: '',
    notes: '',
    image: require('../assets/crop-placeholder.png')
  };

  // State cho mặt hàng kho mới
  const [newItem, setNewItem] = useState(defaultNewItem);

  // Mô phỏng làm mới
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Trong ứng dụng thực tế, bạn sẽ lấy dữ liệu mới ở đây
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Lọc kho dựa trên văn bản tìm kiếm và danh mục
  const filterInventory = () => {
    let result = inventory;

    // Lọc theo văn bản tìm kiếm
    if (searchText) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.category.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Lọc theo danh mục
    if (selectedCategory !== 'Tất cả') {
      result = result.filter(item => item.category === selectedCategory);
    }

    setFilteredInventory(result);
  };

  // Áp dụng bộ lọc khi văn bản tìm kiếm hoặc danh mục thay đổi
  useEffect(() => {
    filterInventory();
  }, [searchText, selectedCategory, inventory]);

  // Lấy danh mục duy nhất
  const categories = ['Tất cả', ...new Set(inventory.map(item => item.category))];

  // Mở modal thêm mặt hàng mới
  const openAddModal = () => {
    setEditingItem(null);
    setNewItem(defaultNewItem);
    setModalVisible(true);
  };

  // Mở modal chỉnh sửa mặt hàng
  const openEditModal = (item) => {
    setEditingItem(item);
    setNewItem(item);
    setModalVisible(true);
  };

  // Mở modal chi tiết mặt hàng
  const openDetailModal = (item) => {
    setSelectedItem(item);
    setDetailModalVisible(true);
  };

  // Thêm mặt hàng kho mới
  const addInventoryItem = () => {
    if (!newItem.name || !newItem.quantity || !newItem.unit) {
      Alert.alert('Lỗi', 'Tên, số lượng và đơn vị là bắt buộc');
      return;
    }

    const itemToAdd = {
      id: String(Date.now()),
      ...newItem,
      lastUpdated: new Date().toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    };

    setInventory([itemToAdd, ...inventory]);
    setModalVisible(false);
    setNewItem(defaultNewItem);
  };

  // Cập nhật mặt hàng kho
  const updateInventoryItem = () => {
    if (!editingItem) return;

    if (!newItem.name || !newItem.quantity || !newItem.unit) {
      Alert.alert('Lỗi', 'Tên, số lượng và đơn vị là bắt buộc');
      return;
    }

    const updatedItem = {
      ...newItem,
      lastUpdated: new Date().toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    };

    const updatedInventory = inventory.map(item =>
      item.id === editingItem.id ? updatedItem : item
    );

    setInventory(updatedInventory);
    setModalVisible(false);
    setEditingItem(null);
    setNewItem(defaultNewItem);
  };

  // Xóa mặt hàng kho
  const deleteInventoryItem = (itemId) => {
    Alert.alert(
      'Xóa Mặt hàng',
      'Bạn có chắc chắn muốn xóa mặt hàng này?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Xóa',
          onPress: () => {
            const updatedInventory = inventory.filter(item => item.id !== itemId);
            setInventory(updatedInventory);
            setDetailModalVisible(false);
          },
          style: 'destructive'
        }
      ]
    );
  };

  // Lấy màu trạng thái tồn kho
  const getStockStatusColor = (item) => {
    if (item.quantity <= item.threshold * 0.5) {
      return '#e74c3c'; // Đỏ - Nguy cấp
    } else if (item.quantity <= item.threshold) {
      return '#f39c12'; // Cam - Thấp
    } else {
      return '#2c6e49'; // Xanh lá - Tốt
    }
  };

  // Lấy văn bản trạng thái tồn kho
  const getStockStatusText = (item) => {
    if (item.quantity <= item.threshold * 0.5) {
      return 'Nguy cấp';
    } else if (item.quantity <= item.threshold) {
      return 'Thấp';
    } else {
      return 'Tốt';
    }
  };

  // Lấy biểu tượng danh mục
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Vật tư':
        return 'leaf-outline';
      case 'Thiết bị':
        return 'construct-outline';
      case 'Hạt giống':
        return 'nutrition-outline';
      case 'Thu hoạch':
        return 'basket-outline';
      default:
        return 'cube-outline';
    }
  };

  // Hiển thị mặt hàng kho
  const renderInventoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.inventoryItem}
      onPress={() => openDetailModal(item)}
    >
      <View style={styles.inventoryItemLeft}>
        <View
          style={[
            styles.categoryIcon,
            {
              backgroundColor:
                item.category === 'Vật tư'
                  ? '#e8f5e9'
                  : item.category === 'Thiết bị'
                  ? '#e3f2fd'
                  : item.category === 'Hạt giống'
                  ? '#fff8e1'
                  : '#f3e5f5',
            },
          ]}
        >
          <Ionicons
            name={getCategoryIcon(item.category)}
            size={20}
            color={
              item.category === 'Vật tư'
                ? '#2c6e49'
                : item.category === 'Thiết bị'
                ? '#1976d2'
                : item.category === 'Hạt giống'
                ? '#f57c00'
                : '#9c27b0'
            }
          />
        </View>
      </View>

      <View style={styles.inventoryItemCenter}>
        <Text style={styles.inventoryItemName}>{item.name}</Text>
        <Text style={styles.inventoryItemCategory}>{item.category}</Text>
        <Text style={styles.inventoryItemUpdated}>
          Cập nhật: {item.lastUpdated}
        </Text>
      </View>

      <View style={styles.inventoryItemRight}>
        <Text style={styles.inventoryItemQuantity}>{item.quantity}</Text>
        <Text style={styles.inventoryItemUnit}>{item.unit}</Text>
        <View
          style={[
            styles.stockStatusBadge,
            { backgroundColor: getStockStatusColor(item) + '20' },
          ]}
        >
          <Text
            style={[
              styles.stockStatusText,
              { color: getStockStatusColor(item) },
            ]}
          >
            {getStockStatusText(item)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Tiêu đề */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Kho hàng</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Thanh tìm kiếm */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm kho hàng..."
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Bộ lọc Danh mục */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilterContainer}
        contentContainerStyle={styles.categoryFilterContent}
      >
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.categoryFilterItem,
              selectedCategory === category && styles.selectedCategoryFilterItem,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryFilterText,
                selectedCategory === category && styles.selectedCategoryFilterText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Danh sách Kho hàng */}
      {filteredInventory.length > 0 ? (
        <FlatList
          data={filteredInventory}
          renderItem={renderInventoryItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.emptyStateContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Ionicons name="cube-outline" size={60} color="#d0d0d0" />
          <Text style={styles.emptyStateText}>Không tìm thấy mặt hàng</Text>
          <Text style={styles.emptyStateSubtext}>
            {searchText
              ? 'Thử từ khóa tìm kiếm khác'
              : selectedCategory !== 'Tất cả'
              ? `Không tìm thấy mặt hàng nào thuộc danh mục ${selectedCategory.toLowerCase()}`
              : 'Thêm mặt hàng kho đầu tiên của bạn bằng nút +'}
          </Text>
        </ScrollView>
      )}

      {/* Tổng kết */}
      <View style={styles.summaryFooter}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Tổng Mặt hàng</Text>
          <Text style={styles.summaryValue}>{filteredInventory.length}</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Danh mục</Text>
          <Text style={styles.summaryValue}>{categories.length - 1}</Text>
        </View>

        <TouchableOpacity style={styles.reportsButton}>
          <Text style={styles.reportsButtonText}>Tạo Báo cáo</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Thêm/Sửa Mặt hàng */}
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
                {editingItem ? 'Sửa Mặt hàng' : 'Thêm Mặt hàng Kho'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.inputLabel}>Tên Mặt hàng*</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tên mặt hàng"
                value={newItem.name}
                onChangeText={(text) => setNewItem({ ...newItem, name: text })}
              />

              <Text style={styles.inputLabel}>Danh mục</Text>
              <View style={styles.categorySelector}>
                {['Vật tư', 'Thiết bị', 'Hạt giống', 'Thu hoạch'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      newItem.category === category && styles.activeCategoryOption,
                    ]}
                    onPress={() => setNewItem({ ...newItem, category })}
                  >
                    <Ionicons
                      name={getCategoryIcon(category)}
                      size={18}
                      color={newItem.category === category ? 'white' : '#666'}
                    />
                    <Text
                      style={[
                        styles.categoryOptionText,
                        newItem.category === category && styles.activeCategoryOptionText,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.quantityContainer}>
                <View style={styles.quantityField}>
                  <Text style={styles.inputLabel}>Số lượng*</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập số lượng"
                    value={String(newItem.quantity)}
                    onChangeText={(text) => setNewItem({ ...newItem, quantity: text.replace(/[^0-9]/g, '') })}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.quantityField}>
                  <Text style={styles.inputLabel}>Đơn vị*</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="vd: kg, lít"
                    value={newItem.unit}
                    onChangeText={(text) => setNewItem({ ...newItem, unit: text })}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Ngưỡng (Cảnh báo Tồn kho Thấp)</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập số lượng ngưỡng"
                value={String(newItem.threshold || '')}
                onChangeText={(text) => setNewItem({ ...newItem, threshold: text.replace(/[^0-9]/g, '') })}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Ghi chú</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Nhập ghi chú về mặt hàng này"
                value={newItem.notes || ''}
                onChangeText={(text) => setNewItem({ ...newItem, notes: text })}
                multiline
                numberOfLines={4}
              />
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
                onPress={editingItem ? updateInventoryItem : addInventoryItem}
              >
                <Text style={styles.saveButtonText}>
                  {editingItem ? 'Cập nhật' : 'Thêm Mặt hàng'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Chi tiết Mặt hàng */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        {selectedItem && (
          <View style={styles.modalOverlay}>
            <View style={styles.detailModalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chi tiết Mặt hàng</Text>
                <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <View style={styles.itemImageContainer}>
                  <Image source={selectedItem.image} style={styles.itemImage} />
                  <View
                    style={[
                      styles.detailCategoryBadge,
                      {
                        backgroundColor:
                          selectedItem.category === 'Vật tư'
                            ? '#e8f5e9'
                            : selectedItem.category === 'Thiết bị'
                            ? '#e3f2fd'
                            : selectedItem.category === 'Hạt giống'
                            ? '#fff8e1'
                            : '#f3e5f5',
                      },
                    ]}
                  >
                    <Ionicons
                      name={getCategoryIcon(selectedItem.category)}
                      size={18}
                      color={
                        selectedItem.category === 'Vật tư'
                          ? '#2c6e49'
                          : selectedItem.category === 'Thiết bị'
                          ? '#1976d2'
                          : selectedItem.category === 'Hạt giống'
                          ? '#f57c00'
                          : '#9c27b0'
                      }
                    />
                    <Text
                      style={[
                        styles.detailCategoryText,
                        {
                          color:
                            selectedItem.category === 'Vật tư'
                              ? '#2c6e49'
                              : selectedItem.category === 'Thiết bị'
                              ? '#1976d2'
                              : selectedItem.category === 'Hạt giống'
                              ? '#f57c00'
                              : '#9c27b0',
                        },
                      ]}
                    >
                      {selectedItem.category}
                    </Text>
                  </View>
                </View>

                <Text style={styles.detailItemName}>{selectedItem.name}</Text>

                <View style={styles.detailStockInfo}>
                  <View style={styles.detailStockQuantity}>
                    <Text style={styles.detailQuantityValue}>
                      {selectedItem.quantity}
                    </Text>
                    <Text style={styles.detailQuantityUnit}>
                      {selectedItem.unit}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.detailStockStatus,
                      {
                        backgroundColor: getStockStatusColor(selectedItem) + '20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.detailStockStatusText,
                        { color: getStockStatusColor(selectedItem) },
                      ]}
                    >
                      Tồn kho {getStockStatusText(selectedItem)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Chi tiết Tồn kho</Text>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>Ngưỡng:</Text>
                    <Text style={styles.detailItemValue}>
                      {selectedItem.threshold} {selectedItem.unit}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>Cập nhật lần cuối:</Text>
                    <Text style={styles.detailItemValue}>
                      {selectedItem.lastUpdated}
                    </Text>
                  </View>
                </View>

                {selectedItem.notes && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Ghi chú</Text>
                    <Text style={styles.detailNotes}>{selectedItem.notes}</Text>
                  </View>
                )}

                <View style={styles.detailActions}>
                  <TouchableOpacity
                    style={styles.detailActionButton}
                    onPress={() => {
                      setDetailModalVisible(false);
                      openEditModal(selectedItem);
                    }}
                  >
                    <Ionicons name="create-outline" size={20} color="#2c6e49" />
                    <Text style={styles.detailActionButtonText}>Sửa</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.detailActionButton, styles.deleteActionButton]}
                    onPress={() => deleteInventoryItem(selectedItem.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                    <Text style={[styles.detailActionButtonText, styles.deleteActionText]}>
                      Xóa
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>
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
    fontFamily: 'Arial',
  },
  categoryFilterContainer: {
    marginBottom: 15,
  },
  categoryFilterContent: {
    paddingHorizontal: 15,
  },
  categoryFilterItem: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedCategoryFilterItem: {
    backgroundColor: '#2c6e49',
    borderColor: '#2c6e49',
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Arial',
  },
  selectedCategoryFilterText: {
    color: 'white',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  inventoryItem: {
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
  inventoryItemLeft: {
    justifyContent: 'center',
    marginRight: 15,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inventoryItemCenter: {
    flex: 1,
    justifyContent: 'center',
  },
  inventoryItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
    fontFamily: 'Arial',
  },
  inventoryItemCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'Arial',
  },
  inventoryItemUpdated: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Arial',
  },
  inventoryItemRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  inventoryItemQuantity: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c6e49',
    fontFamily: 'Arial',
  },
  inventoryItemUnit: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    fontFamily: 'Arial',
  },
  stockStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  stockStatusText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Arial',
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    fontFamily: 'Arial',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    marginHorizontal: 30,
    fontFamily: 'Arial',
  },
  summaryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Arial',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Arial',
  },
  reportsButton: {
    backgroundColor: '#2c6e49',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  reportsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Arial',
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
  detailModalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
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
    fontFamily: 'Arial',
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
    fontFamily: 'Arial',
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
    fontFamily: 'Arial',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quantityField: {
    width: '48%',
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
    fontFamily: 'Arial',
  },
  activeCategoryOptionText: {
    color: 'white',
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
    fontFamily: 'Arial',
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
    fontFamily: 'Arial',
  },
  itemImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  itemImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  detailCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  detailCategoryText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 5,
    fontFamily: 'Arial',
  },
  detailItemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Arial',
  },
  detailStockInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailStockQuantity: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 15,
  },
  detailQuantityValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c6e49',
    fontFamily: 'Arial',
  },
  detailQuantityUnit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
    fontFamily: 'Arial',
  },
  detailStockStatus: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  detailStockStatusText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Arial',
  },
  detailSection: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    fontFamily: 'Arial',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  detailItemLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Arial',
  },
  detailItemValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    fontFamily: 'Arial',
  },
  detailNotes: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontFamily: 'Arial',
  },
  detailActions: {
    marginTop: 10,
  },
  detailActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 10,
  },
  detailActionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c6e49',
    marginLeft: 8,
    fontFamily: 'Arial',
  },
  deleteActionButton: {
    backgroundColor: '#ffebee',
  },
  deleteActionText: {
    color: '#e74c3c',
  }
});

export default InventoryScreen;