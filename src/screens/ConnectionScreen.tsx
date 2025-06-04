import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import React, {FC, useEffect, useState} from 'react';
import {useTCP} from '../service/TCPProvider';
import Icon from '../components/global/Icon';
import {resetAndNavigate} from '../utils/NavigationUtil';
import LinearGradient from 'react-native-linear-gradient';
import {sendStyles} from '../styles/sendStyles';
import {connectionStyles} from '../styles/connectionStyles';
import CustomText from '../components/global/CustomText';
import Options from '../components/home/Options';
import {formatFileSize} from '../utils/libraryHelpers';
import {Colors} from '../utils/Constants';
import ReactNativeBlobUtil from 'react-native-blob-util';

const ConnectionScreen: FC = () => {
  const {
    connectedDevice,
    disconnect,
    sendFileAck,
    sentFiles,
    receivedFiles,
    totalReceivedBytes,
    totalSentBytes,
    isConnected,
  } = useTCP();
  const [activeTab, setActiveTab] = useState<'SENT' | 'RECEIVED'>('SENT');

  const handleTabChange = (tab: 'SENT' | 'RECEIVED') => {
    setActiveTab(tab);
  };

  const onMediaPickedUp = (image: any) => {
    console.log('Picked image: ', image);
    sendFileAck(image, 'image');
  };

  const onFilePickedUp = (file: any) => {
    console.log('Picked file: ', file);
    sendFileAck(file, 'file');
  };

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

  const renderItem = ({item}: any) => (
    <View style={connectionStyles.fileItem}>
      {renderThumbnail(item.type)}
      <View style={connectionStyles.fileDetails}>
        <CustomText numberOfLines={1} fontFamily="Okra-Bold" fontSize={12}>
          {item?.name}
        </CustomText>
        <CustomText numberOfLines={1} fontFamily="Okra-Regular" fontSize={10}>
          {item?.mimeType}.{formatFileSize(item.size)}
        </CustomText>

        {item?.available ? (
          <TouchableOpacity
            style={connectionStyles.openButton}
            onPress={() => {
              const normalizedPath =
                Platform.OS === 'ios' ? `file://${item?.uri}` : item?.uri;

              if (Platform.OS === 'ios') {
                ReactNativeBlobUtil.ios
                  .openDocument(normalizedPath)
                  .then(() => console.log('File opened successfully'))
                  .catch(err => console.error('Error opening file: ', err));
              } else {
                ReactNativeBlobUtil.android
                  .actionViewIntent(normalizedPath, '*/*')
                  .then(() => console.log('File opened successfully'))
                  .catch(err => console.error('Error opening file: ', err));
              }
            }}>
            {/* <Icon
              name="open-in-new"
              size={16}
              color={Colors.primary}
              IconFamily="MaterialIcons"
            /> */}
            <CustomText
              numberOfLines={1}
              color="#fff"
              fontFamily="Okra-Bold"
              fontSize={9}>
              open
            </CustomText>
          </TouchableOpacity>
        ) : (
          <ActivityIndicator color={Colors.primary} size="small" />
        )}
      </View>
    </View>
  );

  useEffect(() => {
    if (!isConnected) {
      resetAndNavigate('HomeScreen');
    }
  }, [isConnected]);

  return (
    <LinearGradient
      colors={['#FFFFFF', '#CDDAEE', '#8DBAFF']}
      style={sendStyles.container}
      start={{x: 0, y: 1}}
      end={{x: 0, y: 0}}>
      <SafeAreaView />
      <View style={sendStyles.mainContainer}>
        <View style={connectionStyles.container}>
          <View style={connectionStyles.connectionContainer}>
            <View style={{width: '55%'}}>
              <CustomText numberOfLines={1} fontFamily="Okra-Medium">
                Connected with
              </CustomText>
              <TouchableOpacity
                onPress={() => disconnect()}
                style={connectionStyles.disconnectButton}>
                <Icon
                  name="remove-circle"
                  size={12}
                  color="red"
                  IconFamily="Ionicons"
                />
                <CustomText
                  numberOfLines={1}
                  fontFamily="Okra-Bold"
                  fontSize={10}>
                  Disconnect
                </CustomText>
              </TouchableOpacity>
            </View>

            <Options
              onMediaPickedUp={onMediaPickedUp}
              onFilePickedUp={onFilePickedUp}
            />

            <View style={connectionStyles.fileContainer}>
              <View style={connectionStyles.sendReceiveContainer}>
                <View style={connectionStyles.sendReceiveButtonContainer}>
                  <TouchableOpacity
                    onPress={() => handleTabChange('SENT')}
                    style={[
                      connectionStyles.sendReceiveButton,
                      activeTab === 'SENT'
                        ? connectionStyles.activeButton
                        : connectionStyles.inactiveButton,
                    ]}>
                    <Icon
                      name="cloud-upload"
                      size={12}
                      color={activeTab === 'SENT' ? '#fff' : 'blue'}
                      IconFamily="MaterialIcons"
                    />
                    <CustomText
                      numberOfLines={1}
                      fontFamily="Okra-Bold"
                      fontSize={9}
                      color={activeTab === 'SENT' ? '#fff' : '#000'}>
                      SENT
                    </CustomText>
                  </TouchableOpacity>
                </View>

                <View style={connectionStyles.sendReceiveDataContainer}>
                  <CustomText fontFamily="Okra-Bold" fontSize={9}>
                    {formatFileSize(
                      (activeTab === 'SENT'
                        ? totalSentBytes
                        : totalReceivedBytes) || 0,
                    )}
                  </CustomText>
                  <CustomText fontFamily="Okra-Bold" fontSize={12}>
                    /
                  </CustomText>

                  <CustomText fontFamily="Okra-Bold" fontSize={10}>
                    {activeTab === 'SENT'
                      ? formatFileSize(
                          sentFiles?.reduce(
                            (total: number, file: any) => total + file.size,
                            0,
                          ),
                        )
                      : formatFileSize(
                          receivedFiles?.reduce(
                            (total: number, file: any) => total + file.size,
                            0,
                          ),
                        )}
                  </CustomText>
                </View>

                <TouchableOpacity
                  onPress={() => handleTabChange('RECEIVED')}
                  style={[
                    connectionStyles.sendReceiveButton,
                    activeTab === 'RECEIVED'
                      ? connectionStyles.activeButton
                      : connectionStyles.inactiveButton,
                  ]}>
                  <Icon
                    name="cloud-upload"
                    size={12}
                    color={activeTab === 'RECEIVED' ? '#fff' : 'blue'}
                    IconFamily="Ionicons"
                  />
                  <CustomText
                    numberOfLines={1}
                    fontFamily="Okra-Bold"
                    fontSize={9}
                    color={activeTab === 'RECEIVED' ? '#fff' : '#000'}>
                    RECEIVED
                  </CustomText>
                </TouchableOpacity>
              </View>

              {(activeTab === 'SENT'
                ? sentFiles?.length
                : receivedFiles?.length) > 0 ? (
                <FlatList
                  data={activeTab === 'SENT' ? sentFiles : receivedFiles}
                  keyExtractor={item => item.id.toString()}
                  renderItem={renderItem}
                  contentContainerStyle={connectionStyles.fileList}
                />
              ) : (
                <View style={connectionStyles.noDataContainer}>
                  <CustomText
                    numberOfLines={1}
                    fontFamily="Okra-Medium"
                    fontSize={11}>
                    {activeTab === 'SENT'
                      ? 'No files sent yet.'
                      : 'No files received yet.'}
                  </CustomText>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={() => resetAndNavigate('HomeScreen')}
            style={sendStyles.backButton}>
            <Icon
              name="arrow-back"
              IconFamily="MaterialIcons"
              size={16}
              color="#000"
            />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

export default ConnectionScreen;
