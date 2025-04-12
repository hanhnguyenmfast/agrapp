// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation';



export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <AppNavigator />
    </AuthProvider>
  );
}