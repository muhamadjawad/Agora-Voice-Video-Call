import {Icon} from 'native-base';
import React, {useState, useEffect} from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import RtcEngine, {
  RtcLocalView,
  RtcRemoteView,
  VideoRenderMode,
  b,
} from 'react-native-agora';
import {connect} from 'react-redux';
import {height, width} from 'react-native-dimension';

import {
  COLOR_LIGHT_BLUE,
  COLOR_MAROON,
  COLOR_PRIMARY,
  COLOR_RED,
  COLOR_WHITE,
  COLOR_BLACK,
} from '../../Styles/ThemeConstants';
import requestCameraAndAudioPermission from '../../Permission/Permission';
// import CustomText from '../../../components/UISingleComp/CustomText';
// import {ceil} from 'lodash';
import Draggable from 'react-native-draggable';
import {COLOR_SECONDARY} from '../../Styles/ThemeConstants';
import {userData} from '../../../userData';

const appId = '13658a0a10ff440bb3b6efb0de3e7d5a';
const channelName = 'AgoraCall';

const VideoCall = props => {
  var _engine = '';
  const argument = props.navigation.getParam('argument');
  const name = argument.name;
  console.log(':argument===> ', argument);

  console.log('userData=====?', userData);

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

  useEffect(() => {
    console.log('Engine--- ', _engine);
  }, [_engine]);

  const init = async () => {
    _engine = await RtcEngine.create(appId);
    console.log('Engine--- ', _engine);

    await _engine.enableVideo();

    _engine.addListener('Warning', warn => {
      console.log('Warning', warn);
    });

    _engine.addListener('Error', err => {
      console.log('Error --- ', err);
    });

    _engine.addListener('UserJoined', (uid, elapsed) => {
      console.log('UserJoined', uid, elapsed);

      // Get current peer IDs

      // If new user
      if (peerIds.indexOf(uid) === -1) {
        setPeerIds(prevState => [...prevState, uid]);
      }
    });

    _engine.addListener('UserMuteAudio', (uid, muted) => {
      console.log('Usermute call hua', uid, muted);
      //if muted is true uid  is muted

      setAudioMutedInfo({...audioMutedInfo, [uid]: muted});
    });

    _engine.addListener('UserMuteVideo', (uid, muted) => {
      console.log('Usermute video hua', uid, muted);

      setVideoMutedInfo({...videoMutedInfo, [uid]: muted});
    });

    _engine.addListener('UserInfoUpdated', (uid, name) => {
      console.log('usr info updated', name);
      //if muted is true uid  is muted

      setNameInfo({...nameInfo, name: name['userAccount']});
    });
    _engine.addListener('UserOffline', (uid, reason) => {
      console.log('UserOffline', uid, reason);

      setPeerIds(prevState => prevState.filter(id => id !== uid)); // Remove peer ID from state array
    });

    // If Local user joins RTC channel
    _engine.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
      console.log('JoinChannelSuccess', channel, uid, elapsed);
      // Set state variable to true
      setJoinSucceed(true);
    });
  };

  const startCall = async () => {
    console.log(
      'userData[name].token, channelName,',
      userData[name].token,
      channelName,
    );
    // Join Channel using  token and channel name
    await _engine.joinChannel(userData[name].token, channelName, null, 1);
    // peerId =0 //no one joined u are the first
  };

  const [joinSucceed, setJoinSucceed] = useState(false);

  const [muteVideo, setMuteVideo] = useState(false);
  const [mute, setMute] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [peerIds, setPeerIds] = useState([]);
  const [initialsDone, setInitialsDone] = useState(false);

  const LocalView = () => {
    // console.log('infor mation===', await _engine.getUserInfoByUid(peerIds[-1]));
    return joinSucceed ? (
      <View style={[styles.localView]}>
        <RtcLocalView.SurfaceView
          zOrderOnTop={true}
          style={{flex: 1}}
          channelId={channelName}
          // renderMode={VideoRenderMode.Hidden}
          children={() => {
            return (
              <View
                style={{width: 50, height: 70, backgroundColor: COLOR_PRIMARY}}
              />
            );
          }}
        />
      </View>
    ) : null;
  };

  const RemoteVideos = () => {
    return (
      <View
        style={{
          flex: 1,
          flexWrap: peerIds.length === 2 ? 'nowrap' : 'wrap',
          flexDirection: peerIds.length === 2 ? 'column' : 'row',
          backgroundColor: COLOR_WHITE,
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
              }}>
              {videoMutedInfo[item] === true ? (
                <Image
                  source={{uri: userDataObject[item].image}}
                  style={{
                    flex: 1,
                  }}
                />
              ) : (
                <RtcRemoteView.SurfaceView
                  style={{
                    flex: 1,
                  }}
                  uid={item}
                  channelId={channelName}
                  renderMode={VideoRenderMode.Hidden}

                  // zOrderMediaOverlay={true}
                />
              )}
              <View
                style={{
                  position: 'absolute',
                  width: width(100),
                  // marginHorizontal: width(1),
                  paddingHorizontal: width(2),
                  top: height(1),
                  // right: 0,
                  alignItems: 'center',

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
                    label={userDataObject[item].username}
                    textStyle={{color: COLOR_BLACK, fontSize: width(3)}}
                  />
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 0.15,
                    // backgroundColor: COLOR_RED,
                    justifyContent: 'space-between',
                  }}>
                  <View>
                    {/* audioMutedInfo[item]  */}
                    {audioMutedInfo[item] === true ? (
                      <Icon
                        type={'Ionicons'}
                        name={'mic-off-circle'}
                        style={{color: COLOR_WHITE}}
                      />
                    ) : null}
                  </View>
                  <View>
                    {videoMutedInfo[item] === true ? (
                      <Icon
                        type={'Feather'}
                        name={'video-off'}
                        style={{fontSize: width(6), color: COLOR_WHITE}}
                      />
                    ) : null}
                  </View>
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
            // setMuteVideo(!muteVideo);
            // onChangeVideo(!muteVideo);
          }}
          style={[styles.BottomButtonStyle, {backgroundColor: COLOR_WHITE}]}>
          <Icon
            type={'MaterialIcons'}
            name={muteVideo ? 'videocam-off' : 'videocam'}
            style={{fontSize: width(10), color: COLOR_PRIMARY}}
          />
        </TouchableOpacity>
        <TouchableOpacity
          //   onPress={Camera}
          style={[styles.BottomButtonStyle, {backgroundColor: COLOR_WHITE}]}>
          <Icon
            type={'Ionicons'}
            name={'camera-reverse-outline'}
            style={{fontSize: width(10), color: COLOR_PRIMARY}}
          />
        </TouchableOpacity>
        <TouchableOpacity
          //   onPress={endCall}
          style={[styles.BottomButtonStyle, {height: 60, width: 60}]}>
          <Icon
            type={'Entypo'}
            name={'phone'}
            style={{fontSize: width(10), color: COLOR_WHITE}}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            // setMute(!mute);
            // onChangeMic(!mute);
          }}
          style={[styles.BottomButtonStyle, {backgroundColor: COLOR_WHITE}]}>
          <Icon
            type={'FontAwesome5'}
            name={mute === true ? 'microphone-alt-slash' : 'microphone-alt'}
            style={{fontSize: width(7), color: COLOR_PRIMARY}}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            // setSpeaker(!speaker);
            // onChangeSpeaker(!speaker);
          }}
          style={[styles.BottomButtonStyle, {backgroundColor: COLOR_WHITE}]}>
          <Icon
            type={'FontAwesome5'}
            name={speaker === true ? 'volume-up' : 'volume-mute'}
            style={{fontSize: width(7), color: COLOR_PRIMARY}}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{flex: 1}}>
      {/* local video */}
      <Draggable
        x={width(1)}
        y={height(5)}
        maxX={width(100)}
        maxY={height(80)}
        minX={width(0)}
        minY={height(0)}>
        <LocalView />
      </Draggable>

      {/* <RemoteVideos /> */}
      <BottomButtons />
    </View>
  );
};

const styles = StyleSheet.create({
  BottomButtonStyle: {
    height: 50,
    width: 50,
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
export default VideoCall;
