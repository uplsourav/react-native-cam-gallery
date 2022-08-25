import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  FlatList,
  Image,
  PanResponder,
  ActivityIndicator,
  BackHandler,
  LogBox,
} from 'react-native';
import {
  PERMISSIONS,
  checkMultiple,
  requestMultiple,
  openSettings,
} from 'react-native-permissions';
import Modules from '../../Modules/index';
import Header from '../Common/Components/Header';
import { Camera } from 'react-native-camera-kit';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const PICKER_HIDE_POSITION =
  Platform.OS === 'android'
    ? Math.round(windowHeight - windowHeight / 4)
    : Math.round(windowHeight - windowHeight / 3.2);

const flashModeOrder = {
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off',
};

const wbOrder = {
  auto: 'sunny',
  sunny: 'cloudy',
  cloudy: 'shadow',
  shadow: 'fluorescent',
  fluorescent: 'incandescent',
  incandescent: 'auto',
};

const landmarkSize = 2;

function calcDistance(x1, y1, x2, y2) {
  let dx = Math.abs(x1 - x2);
  let dy = Math.abs(y1 - y2);
  return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

export default class CameraScreen extends React.Component {
  currentZoomValue = 0;
  imagePickerOpen = false;
  imagesPerPage = 50;
  isZooming = false;
  cameraToggleRef = new Animated.Value(0);
  SelectorAnimatedRef = new Animated.Value(windowHeight);
  methodsMaster = null;

  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  // TO open device settings from custom modal or Parent Component
  handleParentSettingsButton() {
    this.openDeviceSettings();
  }
  // To open device permission settings
  openDeviceSettings() {
    openSettings().catch(() => console.warn('cannot open settings'));
  }

  // To Close permission dialog or modal
  handleParentCloseButton() {
    this.closeSettingsModal();
  }

  // To Close permission dialog or modal
  closeSettingsModal() {
    this.setState({ showModal: false });
  }

  componentDidMount() {
    const { getDevicePhotos, getMorePhotos } = Modules();
    LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
    LogBox.ignoreAllLogs(); //Ignore all log notifications
    this.methodsMaster = getMorePhotos; // Need to be improved
    getDevicePhotos(50)
      .then(res => {
        this.setState({ galleryMedias: res });
      })
      .catch(errror => {
        console.log(errror);
      });

    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );

    if (Platform.OS === 'android') {
      checkMultiple([
        PERMISSIONS.ANDROID.CAMERA,
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      ]).then(statuses => {
        if (
          statuses[PERMISSIONS.ANDROID.CAMERA] === 'denied' ||
          statuses[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] === 'denied'
        ) {
          requestMultiple([
            PERMISSIONS.ANDROID.CAMERA,
            PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
          ]).then(statuses => {
            if (
              statuses[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] ===
              'denied' ||
              statuses[PERMISSIONS.ANDROID.CAMERA] === 'denied'
            ) {
              this.props?.onPermissionRejection();
            } else if (
              statuses[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] ===
              'blocked' ||
              statuses[PERMISSIONS.ANDROID.CAMERA] === 'blocked'
            ) {
              this.props?.onPermissionBlocked();
            } else {
              getDevicePhotos(50)
                .then(res => {
                  this.setState({ galleryMedias: res });
                })
                .catch(errror => {
                  console.log(errror);
                });

              this.camera.refreshAuthorizationStatus();
            }
          });
        } else if (
          statuses[PERMISSIONS.ANDROID.CAMERA] === 'blocked' ||
          statuses[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] === 'blocked'
        ) {
          this.setState({ showModal: true });
        }
      });
    } else if (Platform.OS === 'ios') {
      checkMultiple([
        PERMISSIONS.IOS.CAMERA,
        PERMISSIONS.IOS.PHOTO_LIBRARY,
      ]).then(statuses => {
        if (
          statuses[PERMISSIONS.IOS.CAMERA] === 'denied' ||
          statuses[PERMISSIONS.IOS.PHOTO_LIBRARY] === 'denied'
        ) {
          requestMultiple([
            PERMISSIONS.IOS.CAMERA,
            PERMISSIONS.IOS.PHOTO_LIBRARY,
          ]).then(statuses => {
            if (
              statuses[PERMISSIONS.IOS.PHOTO_LIBRARY] === 'denied' ||
              statuses[PERMISSIONS.IOS.CAMERA] === 'denied'
            ) {
              // this.props.navigation.goBack();
            } else if (
              statuses[PERMISSIONS.IOS.PHOTO_LIBRARY] === 'blocked' ||
              statuses[PERMISSIONS.IOS.CAMERA] === 'blocked'
            ) {
              // this.props.navigation.goBack();
            } else {
              getDevicePhotos(50)
                .then(res => {
                  this.setState({ galleryMedias: res });
                })
                .catch(errror => {
                  console.log(errror);
                });
              this.camera.refreshAuthorizationStatus();
            }
          });
        } else if (
          statuses[PERMISSIONS.IOS.CAMERA] === 'blocked' ||
          statuses[PERMISSIONS.IOS.PHOTO_LIBRARY] === 'blocked'
        ) {
          this.setState({ showModal: true });
        } else if (
          statuses[PERMISSIONS.IOS.PHOTO_LIBRARY] === 'unavailable' ||
          statuses[PERMISSIONS.IOS.CAMERA] === 'unavailable'
        ) {
          this.setState({ showModal: true });
        }
      });
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  handleBackButtonClick() {
    if (this.state.imagesArray.length > 0) {
      this.setState({
        imagesArray: [],
      });
      return true;
    } else if (this.state.isGridOpen) {
      this.hideGallary();
    } else if (this.state.isSelectorOpen) {
      this.closeSelector();
    } else {
      // this.props.navigation.goBack();
    }
    return true;
  }

  state = {
    showModal: false,
    flash: 'off',
    zoom: 0,
    autoFocus: 'on',
    autoFocusPoint: {
      normalized: { x: 0.5, y: 0.5 }, // normalized values required for autoFocusPointOfInterest
      drawRectPosition: {
        x: Dimensions.get('window').width * 0.5 - 32,
        y: Dimensions.get('window').height * 0.5 - 32,
      },
    },
    depth: 0,
    type: 'back',
    whiteBalance: 'auto',
    ratio: '16:9',
    recordOptions: {
      mute: false,
      maxDuration: 5,
      // quality: Camera.Constants.VideoQuality['288p'],
    },
    isRecording: false,
    faces: [],
    textBlocks: [],
    barcodes: [],
    imagesArray: [],
    galleryMedias: [],
    pageInfo: {},
    isGridOpen: false,
    isToggleRotate: false,
    isSelectorOpen: false,
    picketType: 'All',
  };

  openPickerStateChange = () => {
    this.imagePickerOpen = true;
  };

  closePickerStateChange = () => {
    this.imagePickerOpen = false;
  };

  pan = new Animated.ValueXY({ x: 0, y: PICKER_HIDE_POSITION });

  panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (e, { dy }) => {
      return Math.abs(dy) > 20;
    },
    onMoveShouldSetResponder: () => true,
    onStartShouldSetPanResponderCapture: () => false,
    onPanResponderGrant: () => { },
    onPanResponderMove: (event, gestureState) => {
      let touches = event.nativeEvent.touches;
      let ActiveTouch = gestureState.numberActiveTouches;
      if (ActiveTouch == 2) {
        this.isZooming = true;
        let touch1 = touches[0];
        let touch2 = touches[1];
        if (
          calcDistance(touch1.pageX, touch1.pageY, touch2.pageX, touch2.pageY) >
          this.currentZoomValue
        ) {
          this.currentZoomValue = calcDistance(
            touch1.pageX,
            touch1.pageY,
            touch2.pageX,
            touch2.pageY,
          );
          this.zoomIn();
        } else {
          this.currentZoomValue = calcDistance(
            touch1.pageX,
            touch1.pageY,
            touch2.pageX,
            touch2.pageY,
          );
          this.zoomOut();
        }
      } else if (ActiveTouch === 1 && !this.isZooming) {
        if (gestureState.dy < 0 && this.state.isGridOpen === false) {
          return Animated.event([null, { moveY: this.pan.y }], {
            useNativeDriver: false,
          })(event, gestureState);
        }
        if (gestureState.dy > 0 && this.state.isGridOpen === true) {
          return Animated.event([null, { moveY: this.pan.y }], {
            useNativeDriver: false,
          })(event, gestureState);
        }
      }
    },
    onPanResponderRelease: (e, gestureState) => {
      if (this.isZooming === false) {
        if (
          gestureState.moveY <= windowHeight / 2 &&
          this.state.isGridOpen === false
        ) {
          this.showGallary();
        } else if (
          gestureState.moveY <= windowHeight / 4 &&
          this.state.isGridOpen === true
        ) {
          this.showGallary();
        } else {
          this.hideGallary();
        }
      } else {
        this.isZooming = false;
      }

      // }
    },
  });

  rotateCameraToggle() {
    if (this.state.isToggleRotate) {
      Animated.timing(this.cameraToggleRef, {
        toValue: 0,
        useNativeDriver: true,
        duration: 500,
      }).start(() => {
        this.setState({
          isToggleRotate: false,
        });
      });
    } else {
      Animated.timing(this.cameraToggleRef, {
        toValue: 100,
        useNativeDriver: true,
        duration: 500,
      }).start(() => {
        this.setState({
          isToggleRotate: true,
        });
      });
    }
  }

  hideGallary = () => {
    Animated.timing(this.pan, {
      toValue: { x: 0, y: PICKER_HIDE_POSITION },
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      this.setState({ isGridOpen: false });
    });
  };

  showGallary = () => {
    Animated.timing(this.pan, {
      toValue: { x: 0, y: 0 },
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      this.setState({ isGridOpen: true });
    });
  };

  toggleFacing() {
    this.rotateCameraToggle();
    this.setState({
      type: this.state.type === 'back' ? 'front' : 'back',
    });
  }

  toggleFlash() {
    this.setState({
      flash: flashModeOrder[this.state.flash],
    });
  }

  toggleWB() {
    this.setState({
      whiteBalance: wbOrder[this.state.whiteBalance],
    });
  }

  toggleFocus() {
    this.setState({
      autoFocus: this.state.autoFocus === 'on' ? 'off' : 'on',
    });
  }

  touchToFocus(event) {
    const { pageX, pageY } = event.nativeEvent;
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    const isPortrait = screenHeight > screenWidth;

    let x = pageX / screenWidth;
    let y = pageY / screenHeight;
    // Coordinate transform for portrait. See autoFocusPointOfInterest in docs for more info
    if (isPortrait) {
      x = pageY / screenHeight;
      y = -(pageX / screenWidth) + 1;
    }

    this.setState({
      autoFocusPoint: {
        normalized: { x, y },
        drawRectPosition: { x: pageX, y: pageY },
      },
    });
  }

  zoomOut() {
    this.setState({
      zoom: this.state.zoom - 0.05 < 0 ? 0 : this.state.zoom - 0.05,
    });
  }

  zoomIn() {
    this.setState({
      zoom: this.state.zoom + 0.05 > 1 ? 1 : this.state.zoom + 0.05,
    });
  }

  setFocusDepth(depth) {
    this.setState({
      depth,
    });
  }


  takePicture = async function () {
    if (this.camera) {
      const image = await this.camera.capture();
      var objj = {
        node: {
          ...{
            image: image,
          },
          ...{
            type: 'image/',
          },
        },
      };
      this.setState({
        imagesArray: [...this.state.imagesArray, objj],
      });
    }
  };

  takeVideo = async () => {
    const { isRecording } = this.state;
    if (this.camera && !isRecording) {
      try {
        const promise = this.camera.recordAsync(this.state.recordOptions);

        if (promise) {
          this.setState({ isRecording: true });
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  toggle = value => () =>
    this.setState(prevState => ({ [value]: !prevState[value] }));

  renderGridMedia = ({ item }) => {
    return (
      <TouchableOpacity
        onLongPress={() => {
          this.selectItems(item);
        }}
        onPress={() => {
          // shortPress(item);
          this.tabSingleItem(item);
        }}
        style={{
          borderRadius: 5,
          position: 'relative',
          marginTop: 10,
          paddingRight: 5,
        }}>
        <View style={{ position: 'relative', top: 0 }}>
          <View style={{ position: 'relative', borderRadius: 5 }}>
            <Image
              style={{
                width: 67,
                height: 67,
                borderRadius: 5,
              }}
              source={{ uri: item.node.image.uri }}
            />
          </View>
          {this.state.imagesArray.includes(item) ? (
            <Image
              source={require('../assets/images/blue_tick.png')}
              style={{
                width: 21.84,
                height: 21.84,
                position: 'absolute',
                bottom: 5,
                right: 5,
              }}
            />
          ) : null}
          {item.node.type.indexOf('video') >= 0 ? (
            <Image
              source={require('../assets/images/VideoIcon.png')}
              style={{
                width: 21.84,
                height: 21.84,
                position: 'absolute',
                bottom: 5,
                left: 5,
              }}
            />
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  selectItems = item => {
    // setSelectionStarted(true);
    if (this.state.imagesArray.includes(item)) {
      this.setState({
        imagesArray: this.state.imagesArray.filter(data => {
          return data != item;
        }),
      });
    } else {
      this.setState({
        imagesArray: [...this.state.imagesArray, item],
      });
    }
  };

  tabSingleItem = item => {
    if (this.state.imagesArray.length > 0) {
      this.selectItems(item);
    } else {
      this.onHandleSubmit(item);
    }
  };

  renderListMedia = ({ item }) => {
    return (
      <TouchableOpacity
        onLongPress={() => {
          this.selectItems(item);
        }}
        onPress={() => {
          // shortPress(item);
          this.tabSingleItem(item);
        }}
        style={{
          borderRadius: 5,
          position: 'relative',
          marginTop: 10,
          alignItems: 'center',
          justifyContent: 'center',
          // paddingRight: 5,
          flex: 1
        }}>
        <View style={{ position: 'relative', top: 0 }}>
          <View style={{ position: 'relative', borderRadius: 5 }}>
            <Image
              style={{
                width: 110,
                height: 110,
                borderRadius: 5,
              }}
              source={{ uri: item.node.image.uri }}
            />
          </View>
          {this.state.imagesArray.includes(item) ? (
            <Image
              source={require('../assets/images/blue_tick.png')}
              style={{
                width: 21.84,
                height: 21.84,
                position: 'absolute',
                bottom: 5,
                right: 5,
              }}
            />
          ) : null}
          {item.node.type.indexOf('video') >= 0 ? (
            <Image
              source={require('../assets/images/VideoIcon.png')}
              style={{
                width: 21.84,
                height: 21.84,
                position: 'absolute',
                bottom: 5,
                left: 5,
              }}
            />
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  renderFace = ({ bounds, faceID, rollAngle, yawAngle }) => (
    <View
      key={faceID}
      transform={[
        { perspective: 600 },
        { rotateZ: `${rollAngle.toFixed(0)}deg` },
        { rotateY: `${yawAngle.toFixed(0)}deg` },
      ]}
      style={[
        styles.face,
        {
          ...bounds.size,
          left: bounds.origin.x,
          top: bounds.origin.y,
        },
      ]}>
      <Text style={styles.faceText}>ID: {faceID}</Text>
      <Text style={styles.faceText}>rollAngle: {rollAngle.toFixed(0)}</Text>
      <Text style={styles.faceText}>yawAngle: {yawAngle.toFixed(0)}</Text>
    </View>
  );

  closeSelector() {
    Animated.timing(this.SelectorAnimatedRef, {
      toValue: windowHeight,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      this.setState({
        isSelectorOpen: false,
      });
    });
  }

  openSelector() {
    Animated.timing(this.SelectorAnimatedRef, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      this.setState({
        isSelectorOpen: true,
      });
    });
  }

  onHandleSubmit(data) {
    if (this.props.onSubmit) {
      this.props?.onSubmit(data);
    }

    this.setState({ imagesArray: [] });
    this.hideGallary();
    this.setState({ imagesArray: [] });
  }

  renderCamera() {
    if (this.state.galleryMedias.length !== 0) {
      return (
        <View style={{ flex: 1, position: 'relative' }}>
          <View
            style={{ flex: 1, position: 'relative' }}
            {...this.panResponder.panHandlers}>
            <Camera
              ref={(cam) => (this.camera = cam)}
              style={{ flex: 1 }}
              cameraType={this.state.type}
              flashMode={this.state.flash}
              focusMode={this.state.autoFocus}
              zoomMode="on"
              torchMode={this.state.flash == "torch" ? "on" : "off"}
              ratioOverlay="1:1"
              ratioOverlayColor="#00000077"
              resetFocusTimeout={0}
              resetFocusWhenMotionDetected={false}
              saveToCameraRoll={false}
              scanBarcode={false}
            />
            <View
              style={{
                width: '100%',
                height: 50,
                backgroundColor: 'transparent',
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                position: 'relative',
                top: 0,
                right: 0,
                position: 'absolute',
              }}>
              <TouchableOpacity
                onPress={() => {
                  if (this.props.onClose) {
                    this.props.onClose();
                  }
                }}
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 15,
                  width: 40,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={require('../assets/images/whiteCross.png')}
                  style={{ width: 18, height: 18 }}
                />
              </TouchableOpacity>
            </View>

            <View style={{ position: 'absolute', bottom: 220, left: 10 }}>
              {this.state.zoom != 0 ? (
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: 'white',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    {(this.state.zoom * 8).toFixed(1)}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          <Animated.View
            style={{
              backgroundColor: 'transparent',
              position: 'absolute',
              transform: [
                {
                  translateY: Animated.subtract(
                    this.pan.y.interpolate({
                      inputRange: [0, PICKER_HIDE_POSITION],
                      outputRange: [0, PICKER_HIDE_POSITION],
                      extrapolate: 'clamp',
                    }),
                    30,
                  ),
                },
              ],
              opacity: this.pan.y.interpolate({
                inputRange: [0, PICKER_HIDE_POSITION],
                outputRange: [0, 1],
              }),
              zIndex: this.pan.y.interpolate({
                inputRange: [0, PICKER_HIDE_POSITION],
                outputRange: [1, 999],
              }),
            }}
            {...this.panResponder.panHandlers}>
            {this.state.imagesArray.length > 0 ? (
              <TouchableOpacity
                onPress={() => this.onHandleSubmit(this.state.imagesArray)}
                style={{
                  height: 60,
                  width: 60,
                  borderRadius: 30,
                  position: 'absolute',
                  bottom: 50,
                  right: 20,
                  backgroundColor: 'blue',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1200,
                }}>
                <Image
                  source={require('../assets/images/Send.png')}
                  style={{ height: 40, width: 40, tintColor: 'white' }}
                />
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    position: 'absolute',
                    bottom: 5,
                    right: 5,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: '600',
                      textAlign: 'center',
                    }}>
                    {this.state.imagesArray?.length}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null}
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={require('../assets/images/dropup.png')}
                style={{ width: 20, height: 20, tintColor: 'white' }}
              />
            </View>
            <FlatList
              horizontal={true}
              data={this.state.galleryMedias}
              keyExtractor={(x, i) => i.toString()}
              key="{item}"
              renderItem={this.renderGridMedia}
              onEndReached={() => {
                this.methodsMaster(50)
                  .then(res => {
                    this.setState({
                      galleryMedias: [...this.state.galleryMedias, ...res],
                    });
                  })
                  .catch(error => {
                    console.log('Error', error);
                  });
                // this.setState({
                //   galleryMedias: [
                //     ...this.state.galleryMedias,
                //     ...getMorePhotos(),
                //   ],
                // });
              }}
              onEndReachedThreshold={1}
            />
          </Animated.View>
          <Animated.View
            style={{
              height: windowHeight,
              width: '100%',
              position: 'absolute',
              backgroundColor: 'white',
              transform: [
                {
                  translateY: this.pan.y.interpolate({
                    inputRange: [0, PICKER_HIDE_POSITION],
                    outputRange: [0, PICKER_HIDE_POSITION],
                    extrapolate: 'clamp',
                  }),
                },
              ],
              opacity: this.pan.y.interpolate({
                inputRange: [0, PICKER_HIDE_POSITION],
                outputRange: [1, 0],
              }),
              zIndex: this.pan.y.interpolate({
                inputRange: [0, PICKER_HIDE_POSITION],
                outputRange: [999, 1],
              }),
            }}>
            <View {...this.panResponder.panHandlers}>
              <Header
                headerText={
                  this.state.imagesArray.length < 1
                    ? 'Gallery'
                    : this.state.imagesArray.length + ' Selected'
                }
                showBack={true}
                onPressBack={this.hideGallary}
                doneTxt={this.state.imagesArray.length > 0 ? 'Next' : null}
                onPressDoneTxt={() =>
                  this.onHandleSubmit(this.state.imagesArray)
                }
              />
            </View>
            <FlatList
              numColumns={3}
              data={this.state.galleryMedias}
              keyExtractor={(x, i) => i.toString()}
              key="{item}"
              renderItem={this.renderListMedia}
              onEndReached={() => {
                this.methodsMaster(50)
                  .then(res => {
                    this.setState({
                      galleryMedias: [...this.state.galleryMedias, ...res],
                    });
                  })
                  .catch(error => {
                    console.log('Error', error);
                  });
              }}
              onEndReachedThreshold={1}
            />
          </Animated.View>

          <Animated.View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              left: 0,
              width: '100%',

              zIndex: this.pan.y.interpolate({
                inputRange: [0, PICKER_HIDE_POSITION],
                outputRange: [1, 999],
              }),
              opacity: this.pan.y.interpolate({
                inputRange: [0, PICKER_HIDE_POSITION],
                outputRange: [0, 1],
              }),
            }}>
            <View
              style={{
                height: 100,
                backgroundColor: 'transparent',
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={this.toggleFlash.bind(this)}
                style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Image
                  source={
                    this.state.flash === 'off'
                      ? require('../assets/images/Flash_off.png')
                      : this.state.flash === 'on'
                        ? require('../assets/images/Flash_on.png')
                        : this.state.flash === 'auto'
                          ? require('../assets/images/Flash_auto.png')
                          : require('../assets/images/Flash_fill.png')
                  }
                  style={{ width: 35, height: 35 }}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.takePicture()}>
                <Image
                  source={require('../assets/images/camera_capture.png')}
                  style={{ width: 70, height: 70 }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={this.toggleFacing.bind(this)}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 35,
                  width: 35,
                }}>
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: this.cameraToggleRef.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0deg', '180deg'],
                        }),
                      },
                    ],
                  }}>
                  <Image
                    source={require('../assets/images/Camera_toggle.png')}
                    style={{
                      width: 22,
                      height: 30,
                    }}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={'white'} />
        </View>
      );
    }
  }

  render() {
    return (
      <>
        <View style={styles.container}>{this.renderCamera()}</View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  flipButton: {
    flex: 0.3,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 10,
    borderRadius: 8,
    borderColor: 'white',
    borderWidth: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoFocusBox: {
    position: 'absolute',
    height: 64,
    width: 64,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
    opacity: 0.4,
  },
  flipText: {
    color: 'white',
    fontSize: 15,
  },
  zoomText: {
    position: 'absolute',
    bottom: 70,
    zIndex: 2,
    left: 2,
  },
  picButton: {
    backgroundColor: 'darkseagreen',
  },
  facesContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
  },
  face: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: '#FFD700',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  landmark: {
    width: landmarkSize,
    height: landmarkSize,
    position: 'absolute',
    backgroundColor: 'red',
  },
  faceText: {
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    backgroundColor: 'transparent',
  },
  text: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: '#F00',
    justifyContent: 'center',
  },
  textBlock: {
    color: '#F00',
    position: 'absolute',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
});