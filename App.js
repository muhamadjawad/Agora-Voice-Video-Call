import React, {Component} from 'react';
import {View} from 'react-native';
import {COLOR_RED} from './Source/Styles/ThemeConstants';

import AppMain from './Source/app';

const App = () => {
  return (
    <View style={{flex: 1, backgroundColor: COLOR_RED}}>
      <AppMain />
    </View>
  );
};

export default App;
