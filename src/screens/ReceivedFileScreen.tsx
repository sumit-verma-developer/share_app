import {
  View,
  Text,
  Platform,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import RNFS from 'react-native-fs';
import Icon from '../components/global/Icon';
import LinearGradient from 'react-native-linear-gradient';
import {sendStyles} from '../styles/sendStyles';
import CustomText from '../components/global/CustomText';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {connectionStyles} from '../styles/connectionStyles';
import {formatFileSize} from '../utils/libraryHelpers';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {goBack} from '../utils/NavigationUtil';

const ReceivedFileScreen = () => {
  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getFilesFromDirectory = async () => {
    setIsLoading(true);
    const platformPath =
      Platform.OS === 'android'
        ? `${RNFS.DownloadDirectoryPath}/`
        : `${RNFS.DocumentDirectoryPath}/`;

    const exists = await RNFS.exists(platformPath);
    if (!exists) {
      setReceivedFiles([]);
      setIsLoading(false);
      return;
    }

    const files = await RNFS.readDir(platformPath);
    const formattedFiles = files.map(file => ({
      id: file.name,
      name: file.name,
      size: file.size,
      uri: file.path,
      mimeType: file.name.split('.').pop() || 'unknown',
    }));
    setReceivedFiles(formattedFiles);
    try {
    } catch (error) {
      console.error('Error fetching files: ', error);
      setReceivedFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getFilesFromDirectory();
  }, []);

  const renderThumbnail = (mimeType: string) => {
    switch (mimeType) {
      case 'mp3':
        return (
          <Icon
            name="musical-notes"
            size={16}
            color="blue"
            IconFamily="Ionicons"
          />
        );
      case 'mp4':
        return (
          <Icon
            name="video"
            size={16}
            color="green"
            IconFamily="MaterialCommunityIcons"
          />
        );
      case 'jpg':
        return (
          <Icon
            name="image"
            size={16}
            color="orange"
            IconFamily="MaterialCommunityIcons"
          />
        );
      case 'pdf':
        return (
          <Icon
            name="document"
            size={16}
            color="red"
            IconFamily="MaterialCommunityIcons"
          />
        );
      default:
        return (
          <Icon
            name="folder"
            size={16}
            color="gray"
            IconFamily="MaterialCommunityIcons"
          />
        );
    }
  };

  const renderItem = ({item}: {item: any}) => {
    return (
      <View style={connectionStyles.fileItem}>
        <View style={connectionStyles.fileInfoContainer}>
          {renderThumbnail(item?.mimeType)}
          <View style={connectionStyles.fileDetails}>
            <CustomText numberOfLines={1} fontFamily="Okra-Bold" fontSize={10}>
              {item.name}
            </CustomText>
            <CustomText numberOfLines={1} fontFamily="Okra-Medium" fontSize={8}>
              {item.mimeType}.{formatFileSize(item.size)}
            </CustomText>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            const normalizedPath =
              Platform.OS === 'ios' ? `file://${item?.uri}` : item?.uri;

              console.log("normalizedPath",normalizedPath);
              
            if (Platform.OS === 'ios') {
              ReactNativeBlobUtil.ios
                .openDocument(normalizedPath)
                .then(() => console.log('File open successfully'))
                .catch(error => console.log('Error open file', error));
            } else {
              ReactNativeBlobUtil.android
                .actionViewIntent(normalizedPath, '*/*')
                .then(() => console.log('File open successfully'))
                .catch(error => console.log('Error open file', error));
            }
          }}
          style={connectionStyles.openButton}>
          <CustomText numberOfLines={1} fontFamily="Okra-Medium" fontSize={9}>
            open
          </CustomText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#ffffff', '#CDDAEE', '#8DBAFF']}
      style={sendStyles.container}
      start={{x: 0, y: 1}}
      end={{x: 0, y: 0}}>
      <SafeAreaView />

      <View style={sendStyles.mainContainer}>
        <CustomText
          fontFamily="Okra-Bold"
          fontSize={15}
          color="#fff"
          style={{textAlign: 'center', margin: 10}}>
          All Received Files
        </CustomText>
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : receivedFiles.length > 0 ? (
          <View style={{flex: 1}}>
            <FlatList
              data={receivedFiles}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              contentContainerStyle={connectionStyles.fileList}
            />
          </View>
        ) : (
          <View style={connectionStyles.noDataContainer}>
            <CustomText
              fontFamily="Okra-Bold"
              fontSize={15}
              color="#fff"
              style={{textAlign: 'center', margin: 10}}>
              No Files Received yet.
            </CustomText>
          </View>
        )}

        <TouchableOpacity onPress={goBack} style={sendStyles.backButton}>
          <Icon
            name="arrow-left"
            IconFamily="MaterialCommunityIcons"
            size={16}
            color="#000"
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default ReceivedFileScreen;
