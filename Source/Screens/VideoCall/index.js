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
  COLOR_PEACH,
} from '../../Styles/ThemeConstants';
import requestCameraAndAudioPermission from '../../Permission/Permission';
// import CustomText from '../../../components/UISingleComp/CustomText';
import {ceil} from 'lodash';
import Draggable from 'react-native-draggable';
import {COLOR_SECONDARY} from '../../Styles/ThemeConstants';
import {token, userData, appId} from '../../../userData';
import CustomText from '../../Components/CustomText';

const channelName = 'AgoraCall';
let _engine = '';

const VideoCall = props => {
  const argument = props.navigation.getParam('argument');
  const name = argument.name;
  // console.log(':argument===> ', argument);
  console.log('userData=====?', userData);

  // const token = token; //
  //>>>>>>>>>>>>>>>>>>>>>>>>>>

  const [audioMutedInfo, setAudioMutedInfo] = useState({});
  const [videoMutedInfo, setVideoMutedInfo] = useState({});

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
    console.log(', channelName,', token, channelName);
    // Join Channel using  token and channel name
    await _engine.joinChannel(token, channelName, null, name);
    // peerId =0 //no one joined u are the first
  };

  const [joinSucceed, setJoinSucceed] = useState(false);

  const [muteVideo, setMuteVideo] = useState(false);
  const [mute, setMute] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [peerIds, setPeerIds] = useState([4, 3]);
  const [initialsDone, setInitialsDone] = useState(false);

  const LocalView = () => {
    // console.log('infor mation===', await _engine.getUserInfoByUid(peerIds[-1]));
    return joinSucceed ? (
      <View style={[styles.localView, {justifyContent: 'center'}]}>
        {muteVideo === true ? (
          <CustomText
            label={'Your video is mute'}
            textStyle={{
              alignSelf: 'center',
              fontStyle: 'italic',
              justifyContent: 'center',
            }}
          />
        ) : (
          <RtcLocalView.SurfaceView
            zOrderOnTop={true}
            style={{flex: 1}}
            channelId={channelName}
            // renderMode={VideoRenderMode.Hidden}
          />
        )}
      </View>
    ) : null;
  };

  useEffect(() => {
    console.log(
      'video info==>',
      videoMutedInfo,
      'audioMutedInfo==>',
      audioMutedInfo,
    );
  }, [videoMutedInfo, audioMutedInfo]);

  useEffect(() => {
    let set = [...new Set(peerIds)];
    if (set.length < peerIds.length) {
      console.log('its not  same');
      setPeerIds(set);
    }

    console.log('Peer ids ===>', peerIds);
  });

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  const Camera = async () => {
    await _engine.switchCamera();
  };

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

  const onChangeVideo = async muteVideo => {
    console.log('Muted video', muteVideo);
    await _engine.muteLocalVideoStream(muteVideo);
  };

  const onChangeSpeaker = async speaker => {
    await _engine.setEnableSpeakerphone(speaker);
  };

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^6^^

  const RemoteVideos = () => {
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
              {videoMutedInfo[item] === true ? ( //videoMutedInfo[item]
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
              ) : (
                <RtcRemoteView.SurfaceView
                  style={{
                    flex: 1,
                  }}
                  uid={item}
                  channelId={channelName}
                  zOrderOnTop={false}
                  renderMode={VideoRenderMode.Hidden}

                  // zOrderMediaOverlay={true}
                />
              )}

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
                  <View>
                    {/* audioMutedInfo[item]  */}
                    {audioMutedInfo[item] === true ? (
                      <Icon
                        type={'Ionicons'}
                        name={'mic-off-circle'}
                        style={{color: COLOR_PRIMARY}}
                      />
                    ) : null}
                  </View>
                  <View>
                    {videoMutedInfo[item] === true ? (
                      <Icon
                        type={'MaterialIcons'}
                        name={'videocam-off'}
                        style={{fontSize: width(6), color: COLOR_PRIMARY}}
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
            setMuteVideo(!muteVideo);
            onChangeVideo(!muteVideo);
          }}
          style={[styles.BottomButtonStyle, {backgroundColor: COLOR_WHITE}]}>
          <Icon
            type={'MaterialIcons'}
            name={muteVideo ? 'videocam-off' : 'videocam'}
            style={{fontSize: width(10), color: COLOR_PRIMARY}}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={Camera}
          style={[styles.BottomButtonStyle, {backgroundColor: COLOR_WHITE}]}>
          <Icon
            type={'Ionicons'}
            name={'camera-reverse-outline'}
            style={{fontSize: width(10), color: COLOR_PRIMARY}}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={endCall}
          style={[styles.BottomButtonStyle, {height: 60, width: 60}]}>
          <Icon
            type={'Entypo'}
            name={'phone'}
            style={{fontSize: width(10), color: COLOR_WHITE}}
          />
        </TouchableOpacity>
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
          onPress={() => {
            setSpeaker(!speaker);
            onChangeSpeaker(!speaker);
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
    <View style={{flex: 1, backgroundColor: COLOR_SECONDARY}}>
      {/* local video */}

      <RemoteVideos />

      <BottomButtons />
      <Draggable
        x={width(1)}
        y={height(5)}
        maxX={width(100)}
        maxY={height(80)}
        minX={width(0)}
        minY={height(0)}
        onDrag={() => {}}>
        <LocalView />
      </Draggable>
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
    borderColor: COLOR_RED,
    zIndex: 100,
    backgroundColor: COLOR_SECONDARY,
  },
});
export default VideoCall;
