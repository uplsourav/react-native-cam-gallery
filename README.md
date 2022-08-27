# react-native-cam-gallery

React Native Cam Gallery. A React Native module that allows you to select photos & videos from the device library & camera.

<p  align="center">

<kbd>

<img  src="https://github.com/novamaster-git/openSourceResources/blob/main/RNcamGalleryPreview.gif?raw=true" title="Preview Demo"/>

</kbd>

</p>

## Installation

```bash
yarn add react-native-cam-gallery
```

```bash
cd ios && pod install && cd ..
```

\***\*`Please install this libraries`\*\***

[react-native-permissions](https://www.npmjs.com/package/react-native-permissions "react-native-permissions") is added to access camera and storage permission in Android & IOS devices

```bash
yarn add react-native-permissions

```

[react-native-camera-kit](https://www.npmjs.com/package/react-native-camera-kit "react-native-camera-kit") is a camera library for React Native apps. 

```bash
yarn add react-native-camera-kit

```

[@react-native-community/cameraroll](https://www.npmjs.com/package/@react-native-community/cameraroll "@react-native-community/cameraroll") is used to access media files from device library

```bash
yarn add @react-native-community/cameraroll

```

[fbjs](https://www.npmjs.com/package/fbjs "fbjs") is used to access few Facebook's APIs

```bash
yarn add fbjs

```
## Permissions

### Android:

Need to add this permissions in **`AndroidManifest.xml`**

```arduino

<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>

<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>

<uses-permission android:name="android.permission.CAMERA" />

<uses-permission android:name="android.permission.RECORD_AUDIO"/>

```

### IOS:

Add permissions with usage descriptions to your app `Info.plist:`

```xml

<key>NSCameraUsageDescription</key>

<string>Allow access to capture photo</string>

<key>NSMicrophoneUsageDescription</key>

<string>Allow access to capture video</string>

<key>NSPhotoLibraryUsageDescription</key>

<string>Allow access to select photo</string>

```

Android:
[Add Kotlin to your project](./docs/kotlin.md)

### **Modify settings.gradle**

Add the following lines in `android/app/build.gradle`:

```

include ':@react-native-community_cameraroll'
project(':@react-native-community_cameraroll').projectDir = new File(rootProject.projectDir, '../node_modules/@react-native-community/cameraroll/android')
include ':react-native-permissions'
project(':react-native-permissions').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-permissions/android')

```


### Add these to PodFile

```swift

pod 'Permission-Camera', :path =>  "../node_modules/react-native-permissions/ios/Camera"

pod 'Permission-PhotoLibrary', :path =>  "../node_modules/react-native-permissions/ios/PhotoLibrary"

```

## Components

\***\*`Component Usage`\*\***

```ts
import { RNCamGallery } from 'react-native-cam-gallery';
```

```jsx
<RNCamGallery

  onSubmit={(data) => {}}

  onPermissionRejection={() => {}}

  onPermissionBlocked={() => {}}

/>

```

## Props

| props                 | type                      | returns                                                                                |
| --------------------- | ------------------------- | -------------------------------------------------------------------------------------- |
| onSubmit              | handler function callback | returns selected and captured images list                                              |
| onPermissionRejection | handler function callback | called when user rejects camera and storage permission                                 |
| onPermissionBlocked   | handler function callback | called when camera and storage permission is blocked                                   |

## Repository

Checkout our GitHub repository and contribute
[React-native-cam-gallery](https://github.com/uplsourav/react-native-cam-gallery "React-native-cam-gallery") <br/>

## Contributing

- Pull Requests are welcome, if you open a pull request we will do our best to get to it in a timely manner
- Pull Request Reviews are even more welcome! we need help testing, reviewing, and updating open PRs
- If you are interested in contributing more actively, please contact us.

## Contributors

[Sourav Das](https://github.com/uplsourav "UplSourav") <br/>
[Amartya Chakraborty](https://github.com/amartyach98 "Amartya Chakraborty") <br/>
[Suman Kamilya](https://github.com/sumankamilya "Suman Kamilya") <br/>
[Soumen Samanta](https://github.com/novamaster-git "Soumen Samanta") <br/>
