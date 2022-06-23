import React from 'react';
import {View} from 'react-native';
import {UplCamera} from 'uplcamera';
import { LogBox } from 'react-native'


const App = () => {

LogBox.ignoreLogs([
    'ViewPropTypes will be removed from React Native. Migrate to ViewPropTypes exported from \'deprecated-react-native-prop-types\'.',
    'NativeBase: The contrast ratio of',
    "[react-native-gesture-handler] Seems like you\'re using an old API with gesture components, check out new Gestures system!",
])
  return (
    <View style={{flex: 1}}>
      <UplCamera onSubmit={(data) => {console.log(data)}} />
    </View>
  );
};

export default App;
