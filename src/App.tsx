import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Homescreen from './screens/Homescreen';

const App: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
    <GestureHandlerRootView>
    <Homescreen />
  </GestureHandlerRootView>
  </SafeAreaView>
  );
};

export default App;
