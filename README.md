
# react-native-cam-gallery

A React-native Whatsapp camera and Gallery library which can be used in your project.

<p  align="center">

<kbd>

<img  src="https://github.com/novamaster-git/openSourceResources/blob/main/RNcamGalleryPreview.gif?raw=true" title="Preview Demo"/>

</kbd>

</p>



****`Please install this libraries`****

Use this custom React-Native-Camera module. we upgraded it due to some permission issues

```bash
yarn add uplsoumen/react-native-camera-modified#master

```

  [react-native-permissions](https://www.npmjs.com/package/react-native-permissions "react-native-permissions") is added to access camera and storage permission in Android & IOS

```bash
yarn add react-native-permissions

```

  

[@react-native-community/cameraroll](https://www.npmjs.com/package/@react-native-community/cameraroll "@react-native-community/cameraroll") is used to access media files from device
```bash
yarn add @react-native-community/cameraroll

```




Need to add this permissions in **`AndroidManifest.xml`**

  

Android:

  

```arduino

<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>

<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>

<uses-permission android:name="android.permission.CAMERA" />

<uses-permission android:name="android.permission.RECORD_AUDIO"/>

```

  

for IOS:

  

Add permissions with usage descriptions to your app `Info.plist:`

  

```xml

<key>NSCameraUsageDescription</key>

<string>Allow access to capture photo</string>

<key>NSMicrophoneUsageDescription</key>

<string>Allow access to capture video</string>

<key>NSPhotoLibraryUsageDescription</key>

<string>Allow access to select photo</string>

```

  

### **Modify build.gradle**

  

Modify the following lines in `android/app/build.gradle`:

  

```

android {

  defaultConfig {
   ...
      missingDimensionStrategy 'react-native-camera', 'general'
  	}
   }

```

  

## Add these to PodFile

  

```swift

pod 'Permission-Camera', :path =>  "../node_modules/react-native-permissions/ios/Camera"

pod 'Permission-PhotoLibrary', :path =>  "../node_modules/react-native-permissions/ios/PhotoLibrary"

```

  
  

****`Component Usage`****

  

```css

<RNCamGallery

onSubmit={(data) => {}}

onPermissionRejection={() => {}}

onPermissionBlocked={() => {}}

/>

```

# Props


| props | type |  returns |
|--|--|--|
| onSubmit | handler function callback | returns selected and captured images list |
| onPermissionRejection | handler function callback | return nothing but called when user rejects camera and storage permission |
| onPermissionBlocked | handler function callback | return nothing but called when camera and storage permission is blocked by Android/IOS |


# Repository 
Checkout your GitHub repository and contribute
[React-native-cam-gallery](https://github.com/uplsourav/react-native-cam-gallery "React-native-cam-gallery") <br/>

# Contributors 
[Sourav Das](https://github.com/uplsourav "UplSourav") <br/>
[Amartya Chakraborty](https://github.com/amartyach98 "Amartya Chakraborty") <br/>
[Suman Kamilya](https://github.com/sumankamilya "Suman Kamilya") <br/>
[Soumen Samanta](https://github.com/novamaster-git "Soumen Samanta") <br/>


