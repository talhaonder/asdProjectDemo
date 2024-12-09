import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {KeyboardAvoidingView, Platform, View, Text} from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import QRCodeScannerScreen from '../screens/QRCodeScannerScreen';
import {buttonSizes, colors, layout, spacing} from '../components/design';
import Icon from 'react-native-vector-icons/Ionicons'; // Correct import
import {Dimensions, SafeAreaView} from 'react-native';

const Tab = createBottomTabNavigator();
const screenWidth = Dimensions.get('window').width;

function App() {
  return (
    <NavigationContainer>
      {/* Wrap the content with KeyboardAvoidingView */}
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Tab.Navigator
          screenOptions={({route}) => ({
            tabBarIcon: ({color}) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = 'home-outline';
              } else if (route.name === 'Scan') {
                iconName = 'scan-outline';
              }

              return (
                <Icon
                  name={iconName}
                  size={buttonSizes.iconSize}
                  color={color}
                />
              );
            },

            tabBarStyle: {
              position: 'absolute',
              bottom: 10,
              alignItems: 'center',
              marginLeft: spacing.ten,
              marginRight: spacing.ten,
              borderRadius: layout.borderRadius.xLarge,
              backgroundColor: colors.footer,
              shadowColor: colors.black,
              shadowOffset: {width: 0, height: 1},
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 1,
              paddingTop: spacing.thin,
            },
            tabBarActiveTintColor: '#000',
            tabBarInactiveTintColor: 'gray',
            tabBarShowLabel: false,
            headerShown: false,
          })}>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Scan" component={QRCodeScannerScreen} />
        </Tab.Navigator>
      </KeyboardAvoidingView>
    </NavigationContainer>
  );
}

export default App;
