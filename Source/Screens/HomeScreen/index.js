import {Icon} from 'native-base';
import React, {Component, useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {height, width} from 'react-native-dimension';
import {
  COLOR_BLACK,
  COLOR_DARK_GRAY,
  COLOR_DARK_PINK,
  COLOR_GREEN,
  COLOR_LIGHT_GREY,
  COLOR_PEACH,
  COLOR_PRIMARY,
  COLOR_SECONDARY,
  COLOR_WHITE,
  COLOR_YELLOW_DARK,
} from '../../Styles/ThemeConstants';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from 'react-native-simple-radio-button';
import RadioButtonRN from 'radio-buttons-react-native';

import RadioGroup from 'react-native-radio-buttons-group';

const HomeScreen = props => {
  const [name, setName] = useState('');

  var radio_props = [
    {id: 1, label: 'jawad', value: 'jawad'},
    {id: 2, label: 'osama', value: 'osama'},
    {id: 3, label: 'taha', value: 'taha'},
    {id: 4, label: 'mustafa', value: 'mustufa'},
  ];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLOR_DARK_GRAY, //COLOR_LIGHT_GREY,
        justifyContent: 'flex-start',
      }}>
      <View
        style={{
          marginHorizontal: width(5),

          marginBottom: height(20),
        }}>
        <Text
          style={{
            alignSelf: 'center',
            color: COLOR_WHITE,
            fontSize: width(7),
            fontWeight: 'bold',
            borderBottomWidth: 2,
          }}>
          Select Your Name
        </Text>
        <RadioButtonRN
          data={radio_props}
          selectedBtn={e => {
            console.log(e.value);
            setName(e.value);
          }}
          circleSize={width(5)}
          activeColor={COLOR_PRIMARY}
          box={false}
          textStyle={{
            // fontWeight: 'bold',
            color: COLOR_BLACK,
            fontStyle: 'italic',
          }}
        />
      </View>

      {/* <View style={{marginHorizontal: width(5), marginBottom: height(15)}}>
        <TextInput
          placeholder={'Your Name'}
          //   placeholderTextColor={}
          value={name}
          style={{
            color: COLOR_DARK_PINK,
            backgroundColor: COLOR_WHITE,
            borderRadius: width(2),
            borderColor: COLOR_PEACH,
            borderWidth: 2,
            paddingHorizontal: 10,
          }}
          onChangeText={value => {
            setName(value);
          }}
        />
      </View> */}

      {name !== '' ? (
        <View
          style={{
            // flex: 0.3,
            flexDirection: 'row',
            justifyContent: 'space-evenly',
          }}>
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate('VideoCall', {argument: {name: name}});
            }}
            style={styles.button_view_style}>
            <Icon
              type={'Ionicons'}
              name={'ios-videocam'}
              style={{color: COLOR_PEACH, fontSize: width(12)}}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate('VoiceCall', {argument: {name: name}});
            }}
            style={[styles.button_view_style]}>
            <Icon
              type={'Ionicons'}
              name={'call-sharp'}
              style={{color: COLOR_PEACH, fontSize: width(12)}}
            />
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  button_view_style: {
    backgroundColor: COLOR_BLACK,
    padding: 15,
    borderRadius: width(30),
    borderColor: COLOR_PEACH,
    borderWidth: 3,
  },

  button_text_style: {color: COLOR_PEACH, fontSize: 20},
});
export default HomeScreen;
