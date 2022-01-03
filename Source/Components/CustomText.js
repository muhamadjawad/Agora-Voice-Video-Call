import React from 'react';
import {StyleSheet, Text} from 'react-native';
import {width} from 'react-native-dimension';

const CustomText = props => {
  return (
    
    <Text  numberOfLines={props.numberOfLines}  style={[stylesCustom.textStyle, props.textStyle]} >
      {props.label}
    </Text>
  );
};

export default CustomText;

const stylesCustom = StyleSheet.create({
  textStyle: {
    // color: COLOR_BLACK,
    fontSize: width(3),
    fontWeight: 'normal',
    textAlign: 'left',
    fontFamily: 'Roboto',
  },
});
