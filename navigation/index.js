// navigation/index.js
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import FarmMonitorScreen from '../screens/FarmMonitorScreen';
import WeatherScreen from '../screens/WeatherScreen';
import TasksScreen from '../screens/TasksScreen';
import InventoryScreen from '../screens/InventoryScreen';
import InvestorDashboardScreen from '../screens/InvestorDashboardScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Import auth context
import { AuthContext } from '../context/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Navigator
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Farmer Tab Navigator
const FarmerTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Dashboard') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Farm') {
          iconName = focused ? 'leaf' : 'leaf-outline';
        } else if (route.name === 'Weather') {
          iconName = focused ? 'cloud' : 'cloud-outline';
        } else if (route.name === 'Tasks') {
          iconName = focused ? 'list' : 'list-outline';
        } else if (route.name === 'Inventory') {
          iconName = focused ? 'cube' : 'cube-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Theo dõi" component={DashboardScreen} />
    <Tab.Screen name="Farm" component={FarmMonitorScreen} />
    <Tab.Screen name="Thời tiết" component={WeatherScreen} />
    <Tab.Screen name="Nhiệm vụ" component={TasksScreen} />
    <Tab.Screen name="Vật tư" component={InventoryScreen} />
    <Tab.Screen name="Cá nhân" component={ProfileScreen} />
  </Tab.Navigator>
);

// Investor Tab Navigator
const InvestorTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Theo dõi') {
          iconName = focused ? 'stats-chart' : 'stats-chart-outline';
        } else if (route.name === 'Calendar') {
          iconName = focused ? 'calendar' : 'calendar-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Theo dõi" component={InvestorDashboardScreen} />
    <Tab.Screen name="Calendar" component={CalendarScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Main Navigator
const AppNavigator = () => {
  const { user, userType } = useContext(AuthContext);

  return (
    <NavigationContainer>
      {!user ? (
        <AuthNavigator />
      ) : userType === 'farmer' ? (
        <FarmerTabNavigator />
      ) : userType === 'investor' ? (
        <InvestorTabNavigator />
      ) : (
        <FarmerTabNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;