import React from 'react';
import {View} from 'react-native';
import {RNCamGallery} from 'react-native-cam-gallery';


const CameraComponent = () => {
  return (
    <View style={{flex: 1}}>
      <RNCamGallery />
    </View>
  );
};

export default CameraComponent;
