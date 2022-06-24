# react-native-cam-gallery


<p align="center">
  <kbd>
  <img src="https://github.com/uplamartya/uplCamera/blob/master/src/assets/images/preview.gif?raw=true"
       title="Preview Demo"/>
  </kbd>
</p>

****`Please install this libraries`**** 

```bash
yarn add uplsoumen/react-native-camera-modified#master
```

```bash
yarn add react-native-permissions
```

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

Add permissions with usage descriptions to your app `Info.plist:`

```xml
<key>NSCameraUsageDescription</key>
<string>Allow access to capture photo</string>
<key>NSMicrophoneUsageDescription</key>
<string>Allow access to capture video</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Allow access to select photo</string>
```

### **Modify build.gradle**

Modify the following lines in `android/app/build.gradle`:

```
android {
  ...
  defaultConfig {
    ...
    missingDimensionStrategy 'react-native-camera', 'general'
  }
}
```

## Add these to PodFile

```swift
pod 'Permission-Camera', :path => "../node_modules/react-native-permissions/ios/Camera"
pod 'Permission-PhotoLibrary', :path => "../node_modules/react-native-permissions/ios/PhotoLibrary"
```


****`Component Usage`**** 

```css
<UplCamera 
      onSubmit={(data) => {}}
      onPermissionRejection={(data) => {}}
      onPermissionBlocked={(data) => {}}
/>
```
