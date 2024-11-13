import {View, Text} from 'react-native';
import React, {useEffect} from 'react';
import analytics from '@react-native-firebase/analytics'; // Firebase Analytics modülü

const Firebase = () => {
  useEffect(() => {
    // Firebase Analytics ile etkinlik kaydetme
    analytics().logEvent('app_opened');
  }, []);

  return (
    <View>
      <Text>Firebase Entegrasyonu Başarıyla Yapıldı!</Text>
    </View>
  );
};

export default Firebase;
