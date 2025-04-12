// screens/InvestorDashboardScreen.js
import React, { useState, useContext } from 'react';
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
import { AuthContext } from '../context/AuthContext';

// Mock data - in a real app, this would come from an API
const mockFinancialData = {
  totalInvestment: 250000,
  currentValue: 287500,
  roi: 15,
  monthlyGrowth: 2.3,
  farms: [
    { id: '1', name: 'Green Valley Farm', investment: 150000, roi: 18, status: 'Active' },
    { id: '2', name: 'Sunrise Acres', investment: 100000, roi: 10, status: 'Active' },
  ],
  recentTransactions: [
    { id: '1', type: 'Income', amount: 4500, date: '01/04/2025', description: 'Quarterly Dividend' },
    { id: '2', type: 'Expense', amount: 1200, date: '27/03/2025', description: 'Equipment Purchase' },
    { id: '3', type: 'Income', amount: 2800, date: '15/03/2025', description: 'Crop Sale' },
  ],
};

const mockActivities = [
  { id: '1', farm: 'Green Valley Farm', activity: 'Irrigation System Upgrade', date: '05/04/2025', status: 'In Progress' },
  { id: '2', farm: 'Sunrise Acres', activity: 'Planted New Crop (Wheat)', date: '02/04/2025', status: 'Completed' },
  { id: '3', farm: 'Green Valley Farm', activity: 'Fertilizer Application', date: '31/03/2025', status: 'Completed' },
  { id: '4', farm: 'Sunrise Acres', activity: 'Harvesting (Corn)', date: '20/03/2025', status: 'Completed' },
];

const InvestorDashboardScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [financialData, setFinancialData] = useState(mockFinancialData);
  const [activities, setActivities] = useState(mockActivities);

  // Simulate a refresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // In a real app, you would fetch new data here
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return '$' + amount.toLocaleString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Investor Dashboard</Text>
          <Text style={styles.nameText}>{user?.name || 'Investor'}</Text>
        </View>

        {/* Financial Overview */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Financial Overview</Text>

          <View style={styles.financialSummary}>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Total Investment</Text>
              <Text style={styles.financialValue}>
                {formatCurrency(financialData.totalInvestment)}
              </Text>
            </View>

            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Current Value</Text>
              <Text style={styles.financialValue}>
                {formatCurrency(financialData.currentValue)}
              </Text>
            </View>

            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>ROI</Text>
              <Text style={[styles.financialValue, styles.roiValue]}>
                {financialData.roi}%
              </Text>
            </View>

            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Monthly Growth</Text>
              <View style={styles.growthContainer}>
                <Ionicons
                  name={
                    financialData.monthlyGrowth >= 0
                      ? 'trending-up-outline'
                      : 'trending-down-outline'
                  }
                  size={18}
                  color={financialData.monthlyGrowth >= 0 ? '#2c6e49' : '#e74c3c'}
                />
                <Text
                  style={[
                    styles.growthValue,
                    {
                      color:
                        financialData.monthlyGrowth >= 0 ? '#2c6e49' : '#e74c3c',
                    },
                  ]}
                >
                  {financialData.monthlyGrowth}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Farm Investments */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Farm Investments</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {financialData.farms.map((farm) => (
            <TouchableOpacity key={farm.id} style={styles.farmItem}>
              <View style={styles.farmInfo}>
                <Text style={styles.farmName}>{farm.name}</Text>
                <Text style={styles.farmInvestment}>
                  Investment: {formatCurrency(farm.investment)}
                </Text>
              </View>
              <View style={styles.farmRoi}>
                <Text style={styles.farmRoiLabel}>ROI</Text>
                <Text style={styles.farmRoiValue}>{farm.roi}%</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{farm.status}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.newInvestmentButton}>
            <Ionicons name="add-circle-outline" size={20} color="white" />
            <Text style={styles.newInvestmentText}>New Investment</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activities */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recent Farm Activities</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {activities.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityInfo}>
                <Text style={styles.activityName}>{activity.activity}</Text>
                <Text style={styles.activityFarm}>{activity.farm}</Text>
                <Text style={styles.activityDate}>{activity.date}</Text>
              </View>
              <View
                style={[
                  styles.activityStatus,
                  {
                    backgroundColor:
                      activity.status === 'Completed'
                        ? '#e8f5e9'
                        : activity.status === 'In Progress'
                        ? '#fff8e1'
                        : '#ffebee',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.activityStatusText,
                    {
                      color:
                        activity.status === 'Completed'
                          ? '#2c6e49'
                          : activity.status === 'In Progress'
                          ? '#ff9800'
                          : '#f44336',
                    },
                  ]}
                >
                  {activity.status}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Transactions */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {financialData.recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionIcon}>
                <Ionicons
                  name={
                    transaction.type === 'Income'
                      ? 'arrow-down-outline'
                      : 'arrow-up-outline'
                  }
                  size={20}
                  color={
                    transaction.type === 'Income' ? '#2c6e49' : '#e74c3c'
                  }
                  style={styles.icon}
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>
                  {transaction.description}
                </Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  {
                    color:
                      transaction.type === 'Income' ? '#2c6e49' : '#e74c3c',
                  },
                ]}
              >
                {transaction.type === 'Income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </Text>
            </View>
          ))}
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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c6e49',
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
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  viewAll: {
    fontSize: 14,
    color: '#2c6e49',
    fontWeight: '500',
  },
  financialSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  financialItem: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  financialLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  financialValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  roiValue: {
    color: '#2c6e49',
  },
  growthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  growthValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  farmItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  farmInfo: {
    flex: 1,
  },
  farmName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  farmInvestment: {
    fontSize: 14,
    color: '#666',
  },
  farmRoi: {
    alignItems: 'flex-end',
  },
  farmRoiLabel: {
    fontSize: 12,
    color: '#666',
  },
  farmRoiValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c6e49',
    marginBottom: 5,
  },
  statusBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#2c6e49',
    fontWeight: '500',
  },
  newInvestmentButton: {
    backgroundColor: '#2c6e49',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 15,
  },
  newInvestmentText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
    marginLeft: 5,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  activityFarm: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: '#999',
  },
  activityStatus: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginLeft: 10,
  },
  activityStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    color: '#333',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InvestorDashboardScreen;