import {Icon} from 'native-base';
import React, {Componen, useState, useEffect} from 'react';
import {Image, View, TouchableOpacity, StyleSheet} from 'react-native';
import {height, width} from 'react-native-dimension';
import {channelName} from '../../../userData';
import Images from '../../Assets/Images';
import requestCameraAndAudioPermission from '../../Permission/Permission';
import {
  COLOR_BLACK,
  COLOR_MAROON,
  COLOR_PEACH,
  COLOR_PRIMARY,
  COLOR_RED,
  COLOR_SECONDARY,
  COLOR_WHITE,
} from '../../Styles/ThemeConstants';
import {ceil} from 'lodash';

import {token, appId, userData} from '../../../userData';
import CustomText from '../../Components/CustomText';
import RtcEngine from 'react-native-agora';

let _engine = '';

const VoiceCall = props => {
  const argument = props.navigation.getParam('argument');
  const name = argument.name;
  //////
  const [joinSucceed, setJoinSucceed] = useState(false);

  const [peerIds, setPeerIds] = useState([]);
  const [mutedInfo, setMutedInfo] = useState({});
  /////////////////////////////////////
  const [mute, setMute] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  useEffect(() => {
    console.log('Permission');
    // Request required permissions from Android
    requestCameraAndAudioPermission()
      .then(() => {
        console.log('requested!');
      })
      .then(() => {
        init();
      })
      .then(() => {
        setTimeout(() => {
          startCall();
        }, 3000);
      });
  }, []);

  const startCall = async () => {
    console.log(', channelName,', token, channelName);
    // Join Channel using  token and channel name
    await _engine.joinChannel(token, channelName, null, name);
    // peerId =0 //no one joined u are the first
  };

  const init = async () => {
    _engine = await RtcEngine.create(appId);
    await _engine.disableVideo();

    _engine.addListener('Warning', warn => {
      // console.log('Warning', warn);
    });

    _engine.addListener('Error', err => {
      console.log('Error --- ', err);

      if (err === 17) {
        // rejoin
        // setRejoin(true);
      }
    });

    _engine.addListener('UserJoined', (uid, elapsed) => {
      console.log('UserJoined', uid, elapsed);

      // Get current peer IDs

      // If new user
      if (peerIds.indexOf(uid) === -1) {
        setPeerIds(prevState => [...prevState, uid]);
      }

      setSomeUser(true);
    });

    _engine.addListener('UserMuteAudio', (uid, muted) => {
      console.log('Usermute call hua', uid, muted);
      //if muted is true uid  is muted

      setMutedInfo({...mutedInfo, [uid]: muted});
    });

    _engine.addListener('UserOffline', (uid, reason) => {
      console.log('UserOffline listener', uid, reason);

      setPeerIds(prevState => prevState.filter(id => id !== uid)); // Remove peer ID from state array
    });

    // If Local user joins RTC channel
    _engine.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
      console.log('JoinChannelSuccess', channel, uid, elapsed);
      // Set state variable to true
      setJoinSucceed(true);
    });

    _engine.addListener('ConnectionLost', val => {
      console.log('ConnectionLost listener', val);
    });

    _engine.addListener('LeaveChannel', val => {
      console.log('LeaveChannel listener', val);
    });

    _engine.addListener('LeaveChannel', val => {
      console.log('LeaveChannel listener', val);
    });

    _engine.addListener('RejoinChannelSuccess', val => {
      console.log('RejoinChannelSuccess', val);
    });
  };

  useEffect(() => {
    console.log('mutedInfo==>', mutedInfo);
  }, [mutedInfo]);

  useEffect(() => {
    let set = [...new Set(peerIds)];
    if (set.length < peerIds.length) {
      console.log('its not  same');
      setPeerIds(set);
    }

    console.log('Peer ids ===>', peerIds);
  });

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

  const endCall = async () => {
    await _engine.leaveChannel();

    setPeerIds([]);
    setJoinSucceed(false);
    props.navigation.pop();
  };

  const onChangeMic = async mute => {
    console.log('Mute', mute);
    await _engine.muteLocalAudioStream(mute);
  };

  const onChangeSpeaker = async speaker => {
    await _engine.setEnableSpeakerphone(speaker);
  };

  const RemoteAudios = () => {
    return (
      <View
        style={{
          // flex: 0.1,
          flexWrap: peerIds.length === 2 ? 'nowrap' : 'wrap',
          flexDirection: peerIds.length === 2 ? 'column' : 'row',
          backgroundColor: COLOR_SECONDARY,
        }}>
        {peerIds.map((item, index) => {
          return (
            <View
              key={index}
              style={{
                flexBasis:
                  peerIds.length % 2 !== 0
                    ? index !== peerIds.length - 1
                      ? '50%'
                      : '100%'
                    : '50%',
                height: height(100 / ceil(peerIds.length / 2)),
                borderWidth: 1,
                borderColor: COLOR_MAROON,
                justifyContent: 'center',
              }}>
              <Image
                source={userData[item].image}
                style={{
                  resizeMode: 'contain',
                  // flex: 1,
                  // height: width(50),
                  width: '60%',
                  // borderRadius: width(50),
                  alignSelf: 'center',
                  // aspectRatio: 1,
                }}
              />

              <View
                style={{
                  position: 'absolute',
                  width: '98%',
                  // marginHorizontal: width(1),
                  // paddingHorizontal: width(1),
                  top: height(0.3),
                  // left: 0,
                  alignItems: 'center',
                  alignSelf: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <View
                  style={{
                    backgroundColor: COLOR_WHITE,
                    paddingHorizontal: width(1),
                    borderRadius: width(1),
                    maxWidth: width(20),
                  }}>
                  <CustomText
                    numberOfLines={1}
                    label={userData[item].name}
                    textStyle={{color: COLOR_BLACK, fontSize: width(3)}}
                  />
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    // flex: 0.15,
                    // backgroundColor: COLOR_RED,
                    justifyContent: 'space-between',
                  }}>
                  {/* audioMutedInfo[item]  */}
                  {mutedInfo[item] === true ? (
                    <Icon
                      type={'Ionicons'}
                      name={'mic-off-circle'}
                      style={{color: COLOR_PRIMARY}}
                    />
                  ) : null}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };
  const BottomButtons = () => {
    return (
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          flexDirection: 'row',
          marginBottom: height(7),
          alignItems: 'center',
          alignSelf: 'center',
          zIndex: 10,
        }}>
        <TouchableOpacity
          onPress={() => {
            setMute(!mute);
            onChangeMic(!mute);
          }}
          style={[styles.BottomButtonStyle, {backgroundColor: COLOR_WHITE}]}>
          <Icon
            type={'FontAwesome5'}
            name={mute === true ? 'microphone-alt-slash' : 'microphone-alt'}
            style={{fontSize: width(7), color: COLOR_PRIMARY}}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={endCall}
          style={[styles.BottomButtonStyle, {height: 70, width: 70}]}>
          <Icon
            type={'Entypo'}
            name={'phone'}
            style={{fontSize: width(10), color: COLOR_WHITE}}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setSpeaker(!speaker);
            onChangeSpeaker(!speaker);
          }}
          style={[styles.BottomButtonStyle, {backgroundColor: COLOR_WHITE}]}>
          <Icon
            type={'Foundation'}
            name={speaker === true ? 'volume' : 'volume-strike'}
            style={{fontSize: width(7), color: COLOR_PRIMARY}}
          />
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <View style={{flex: 1, backgroundColor: COLOR_SECONDARY}}>
      {/* local video */}

      <RemoteAudios />

      <BottomButtons />
    </View>
  );
};

const styles = StyleSheet.create({
  BottomButtonStyle: {
    height: 60,
    width: 60,
    backgroundColor: COLOR_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    marginHorizontal: 5,
    elevation: 3,
  },

  localView: {
    width: width(35),
    height: height(25),
    borderWidth: width(0.5),

    borderColor: COLOR_PRIMARY,
  },
});
export default VoiceCall;
