import {Icon} from 'native-base';

import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  BackHandler,
} from 'react-native';
import {height, width} from 'react-native-dimension';
import {
  Bubble,
  Composer,
  GiftedChat,
  InputToolbar,
  Send,
  Time,
} from 'react-native-gifted-chat';
import Modal from 'react-native-modal';

import RtmEngine from 'agora-react-native-rtm';
import isEqual from 'lodash.isequal';
import {
  COLOR_BLACK,
  COLOR_DARK_GREY,
  COLOR_DARK_PINK,
  COLOR_LIGHT_GREY,
  COLOR_PRIMARY,
  COLOR_RED,
  COLOR_RIGHT_BOX,
  COLOR_WHITE,
} from '../../Styles/ThemeConstants';
import {appId, chatToken} from '../../../userData';

let _engine = '';

let previousMessage = {};

var moment = require('moment');

const ChatModal = props => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [channelJoin, setChannelJoin] = useState(false);
  const [loginDone, setLoginDone] = useState(false);
  const [currentMessage, setCurrentMessage] = useState({});

  let userDataObject = props.userDataObject;

  //Token
  useEffect(async () => {
    if (props.refresh === true) {
      console.log('useeffect in chat');
      setLoading(true);
      setMessages([]);
      _engine = null;
      await initializeRTM();
      setLoading(false);
    }
  }, [props.refresh]);

  const initializeRTM = async () => {
    _engine = await new RtmEngine(); //initialize
    await _engine.createClient(appId); //app
    await _engine
      .login({
        //login
        uid: String(props.id),
        token: chatToken,
      })
      .then(() => {
        console.log('LoginSuccessful');
        setLoginDone(true);
      })
      .catch(err => {
        console.log('error in Login', err);
      });
  };

  const joinChannel = async () => {
    await _engine
      .joinChannel(props.channelName)
      .then(() => {
        console.log('Join channel Succesful');
        setChannelJoin(true);
      })
      .catch(err => {
        console.log('erro in join channel ', err);
      });
  };

  //login

  //joinchannel
  useEffect(async () => {
    if (loginDone === true && _engine !== '') {
      //now join channel
      await joinChannel();
    }
  }, [loginDone, _engine]);

  useEffect(() => {
    console.log('_engine in chat ===>', _engine);
  }, [_engine]);

  useEffect(async () => {
    console.log('Messages updtae ===0-0--', messages);
  }, [messages]);

  useEffect(() => {
    // console.log('Messages', messages);
    // var message = {};
    try {
      _engine.on('channelMessageReceived', received => {
        console.log('Messgae recieved from ', received);

        if (
          !isEqual(received, previousMessage) &&
          received.channelId === props.channelName
        ) {
          console.log('compare', isEqual(received, previousMessage));

          previousMessage = received;

          try {
            console.log('Time  ', moment(parseInt(received.ts)).format());
          } catch (err) {
            console.log(err);
          }

          // here append
          try {
            let message = {
              text: received.text,
              createdAt: moment(parseInt(received.ts)).format(),

              user: {
                _id: received.uid,
                avatar:
                  userDataObject[received.uid].image !== undefined
                    ? userDataObject[received.uid].image
                    : null,
              },
              _id: received.ts,
            };

            console.log('userDataObject  ', userDataObject);
            console.log('message received', message);

            // setMessages(prevState => [...prevState, message]);

            setMessages(prevMessages =>
              GiftedChat.append(prevMessages, message),
            );
          } catch (err) {
            console.log('Error in message', err);
          }
        }
      });
    } catch (err) {
      console.log(err);
    }
  });

  useEffect(() => {
    if (props.destroy === true) {
      try {
        _engine.leaveChannel();
        _engine.destroyClient();
      } catch (error) {
        console.log('error in chat destroy', error);
      }

      console.log('Chat destrpyed');

      setLoginDone(false);
    }
  }, [props.destroy]);

  const CustomInputToolBar = props => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          // height: height(10),
          paddingVertical: 3,
          paddingRight: width(1),
          alignItems: 'center',

          // backgroundColor: COLOR_DARK_PINK,
        }}
        renderComposer={props => (
          <Composer
            {...props}
            // composerHeight={height(8)}

            placeholderTextColor={COLOR_PRIMARY}
            textInputStyle={{
              borderColor: COLOR_PRIMARY,
              color: COLOR_BLACK,
              left: 0,
              borderWidth: 2,
              borderRadius: width(10),
              alignSelf: 'center',
              paddingRight: width(5),
              marginRight: width(3),
              paddingHorizontal: width(5),
            }}
          />
        )}
        renderSend={() => (
          <Send
            {...props}
            containerStyle={{
              height: 44,
              width: 44,
              borderRadius: 22,
              backgroundColor: COLOR_PRIMARY,

              justifyContent: 'center',
              alignItems: 'center',

              // borderRadius: width(10),
            }}>
            <View style={{}}>
              {/* style={styles.btnSend} */}
              <Icon
                type={'MaterialCommunityIcons'}
                name={'send-outline'}
                style={{
                  fontSize: width(8),
                  color: COLOR_WHITE,
                  // marginRight: 3,
                }}
              />
            </View>
          </Send>
        )}
      />
    );
  };

  const onSend = (newMessages = []) => {
    console.log('message', newMessages);
    _engine
      .sendMessageByChannelId(props.channelName, newMessages[0].text)
      .then(variable => console.log('Message Sent', variable));

    setMessages(prevMessages => GiftedChat.append(prevMessages, newMessages));

    // here u add message to the agora chat
  };

  return (
    <Modal
      onBackButtonPress={() => {
        props.closeModal();
      }}
      isVisible={props.isVisible}
      style={{margin: 0}} //props.closeModal()
    >
      <View style={{flex: 1, backgroundColor: COLOR_WHITE}}>
        {/* Back icon */}

        <GiftedChat
          placeholder={'Type here'}
          // optionTintColor={COLOR_WHITE}
          timeTextStyle={{
            right: {color: COLOR_WHITE},
            left: {color: COLOR_DARK_PINK},
          }}
          // disableComposer={true}
          alwaysShowSend={true}
          messagesContainerStyle={{backgroundColor: COLOR_WHITE}}
          messages={messages}
          onSend={messages => onSend(messages)}
          ////////////////////////////////////////
          renderInputToolbar={props => {
            return CustomInputToolBar(props);
          }}
          renderTime={props => {
            return <Time {...props} />;
          }}
          renderFooter={() => {
            return <View style={{marginBottom: height(2)}} />;
          }}
          renderBubble={props => {
            return (
              <Bubble
                {...props}
                tickStyle={{color: COLOR_WHITE}}
                textStyle={{
                  right: {
                    color: COLOR_BLACK,
                    // fontFamily: 'CerebriSans-Book',
                  },
                  left: {
                    color: COLOR_BLACK,
                    // fontFamily: 'CerebriSans-Book',
                  },
                }}
                wrapperStyle={{
                  left: {
                    backgroundColor: COLOR_LIGHT_GREY,
                  },
                  right: {
                    backgroundColor: COLOR_RIGHT_BOX,
                  },
                }}
              />
            );
          }}
          user={{
            _id: props.id,

            name: props.username,
          }}
        />
      </View>
    </Modal>
  );
};

export default ChatModal;
