import React, {Component, useEffect} from 'react';
import {View, Image, Text} from 'react-native';
import {height, width} from 'react-native-dimension';
import Images from '../../Assets/Images';
import {COLOR_PRIMARY, COLOR_WHITE} from '../../Styles/ThemeConstants';

const Splash = props => {
  useEffect(() => {
    setTimeout(() => {
      props.navigation.navigate('HomeScreen');
    }, 2000);
  }, []);

  return (
    <View
      style={{flex: 1, backgroundColor: COLOR_WHITE, justifyContent: 'center'}}>
      <Image
        style={{
          justifyContent: 'center',
          alignSelf: 'center',
          //   top: height(50),
          width: width(35),
          height: width(35),
        }}
        source={Images.Icon}
      />
      <Text
        style={{
          color: COLOR_PRIMARY,
          fontSize: 25,
          alignSelf: 'center',
          fontStyle: 'italic',
        }}>
        Make a Call
      </Text>
    </View>
  );
};

export default Splash;
