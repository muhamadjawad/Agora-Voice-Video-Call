import {createStackNavigator} from 'react-navigation-stack';
import {createAppContainer} from 'react-navigation';
import HomeScreen from '../Screens/HomeScreen';
import Splash from '../Screens/Splash';
import VoiceCall from '../Screens/VoiceCall';
import VideoCall from '../Screens/VideoCall';

const stackScreens = {
  Splash: Splash,

  HomeScreen: HomeScreen,
  VideoCall: VideoCall,
  VoiceCall: VoiceCall,
};

const stackConfig = {
  headerMode: 'none',
  initialRouteName: 'Splash',
};

const MainNavigator = createStackNavigator(stackScreens, stackConfig);
export default createAppContainer(MainNavigator);
