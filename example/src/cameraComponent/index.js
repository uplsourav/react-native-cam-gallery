import React from 'react';
import {View} from 'react-native';
import {RNCamGallery} from 'react-native-cam-gallery';


const CameraComponent = () => {
  return (
    <View style={{flex: 1}}>
      <RNCamGallery onSubmit={(data) => {console.log(data)}} />
    </View>
  );
};

export default CameraComponent;
