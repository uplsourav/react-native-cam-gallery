import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
const Header = props => {
  return (
    <View
      style={{
        width: '100%',
        backgroundColor: 'white',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        height: 70,
        borderBottomColor: '#f1f1f1',
        borderBottomWidth: 2,
      }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          onPress={props.onPressBack}
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 10,
          }}>
          <Image
            source={require('../../assets/images/back_icon.png')}
            style={{ height: 25, width: 25 }}
          />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: 'bold', paddingHorizontal: 10, color: '#000000' }}>{props.headerText}</Text>
      </View>
      <TouchableOpacity
        onPress={props.onPressDoneTxt}
        style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000000' }}>{props.doneTxt}</Text>
      </TouchableOpacity>
    </View>
  );
};
export default Header;
