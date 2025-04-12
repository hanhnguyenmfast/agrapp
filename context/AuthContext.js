// context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkUserLoggedIn = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        const userTypeData = await AsyncStorage.getItem('userType');

        if (userData) {
          setUser(JSON.parse(userData));
          setUserType(userTypeData);
        }

        setLoading(false);
      } catch (error) {
        console.log('Error checking user login:', error);
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Login function
  const login = async (email, password, type) => {
    try {
      // In a real app, you would make an API call here
      // For this example, we'll simulate a successful login
      const userData = { id: '1', name: 'John Doe', email };

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('userType', type);

      setUser(userData);
      setUserType(type);

      return { success: true };
    } catch (error) {
      console.log('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  // Register function
  const register = async (name, email, password, type) => {
    try {
      // In a real app, you would make an API call here
      // For this example, we'll simulate a successful registration
      const userData = { id: '1', name, email };

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('userType', type);

      setUser(userData);
      setUserType(type);

      return { success: true };
    } catch (error) {
      console.log('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userType');
      setUser(null);
      setUserType(null);

      return { success: true };
    } catch (error) {
      console.log('Logout error:', error);
      return { success: false, error: 'Logout failed. Please try again.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};