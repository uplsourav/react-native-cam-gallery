import React, {useState} from 'react';
import CameraRoll from '@react-native-community/cameraroll';
const Modules = () => {
    // const [photosPageInfo, setPhotosPageInfo] = useState({});
    // const [videosPageInfo, setVideosPageInfo] = useState({});
    // const [mediasPageInfo, setMediasPageInfo] = useState({});
    var photosPageInfo, videosPageInfo, mediasPageInfo;

    // cosnt [medias]
  const getDevicePhotos = async (itemsPerPage) => {
      try{
        const photos = await CameraRoll.getPhotos({first: itemsPerPage ? itemsPerPage : 50, assetType: 'Photos'});
        // setPhotosPageInfo(photos.page_info);
        console.log("photos",photos)
        photosPageInfo = photos.page_info;
        return photos.edges;
      }catch(error){
        console.log("error", error)
      }
    
  };
  const getDeviceVideos = async (itemsPerPage) => {

    const videos = await CameraRoll.getPhotos({first: itemsPerPage ? itemsPerPage : 50, assetType: 'Videos'});
    // setVideosPageInfo(videos.page_info);
    videosPageInfo = videos.page_info;
    return videos.edges;
  };
  const getDeviceMedias = async (itemsPerPage) => {
    const medias = await CameraRoll.getPhotos({first: itemsPerPage ? itemsPerPage : 50, assetType: 'All'});
    // setMediasPageInfo(medias.page_info);
    mediasPageInfo = medias.page_info;
    return medias.edges;
  };
  const getMorePhotos = async (itemsPerPage) => {
    const morePhotos = await CameraRoll.getPhotos({first: itemsPerPage, after: photosPageInfo.end_cursor, assetType:'Photos'});
    photosPageInfo = morePhotos.page_info;
    return morePhotos.edges;
  }
  const getMoreVideos = async (itemsPerPage) => {
    const morePhotos = await CameraRoll.getPhotos({first: itemsPerPage, after: videosPageInfo.end_cursor, assetType:'Photos'});
    videosPageInfo = morePhotos.page_info;
    return morePhotos.edges;
  }
  const getMoreMedias = async (itemsPerPage) => {
    const morePhotos = await CameraRoll.getPhotos({first: itemsPerPage, after: mediasPageInfo.end_cursor, assetType:'Photos'});
    mediasPageInfo = morePhotos.page_info;
    return morePhotos.edges;
  }
  return {
    getDeviceMedias,
    getDevicePhotos,
    getDeviceVideos,
    getMorePhotos,
    getMoreVideos,
    getMoreMedias
  };
};
export default Modules;
