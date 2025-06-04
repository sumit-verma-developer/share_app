import {
  View,
  Text,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, {FC, useEffect, useState} from 'react';
import {modalStyles} from '../../styles/modalStyles';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import {multiColor} from '../../utils/Constants';
import CustomText from '../global/CustomText';
import Icon from '../global/Icon';
import {useTCP} from '../../service/TCPProvider';
import DeviceInfo from 'react-native-device-info';
import {getLocalIPAddress} from '../../utils/networkUtils';
import {navigate} from '../../utils/NavigationUtil';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
}

const QRGeneratorModal: FC<ModalProps> = ({visible, onClose}) => {
  const {isConnected, startServer, server} = useTCP();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [qrValue, setQRValue] = useState<string>('');
  const shimmerTranslateX = useSharedValue(-300);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{translateX: shimmerTranslateX.value}],
  }));

  const setupServer = async () => {
    const deviceName = await DeviceInfo.getDeviceName();
    const ip = await getLocalIPAddress();
    const port = 4000;
    if (server) {
      setQRValue(`tcp: //${ip} : ${port} | ${deviceName}`);
      setIsLoading(false);
      return;
    }
    startServer(port);
    setQRValue(`tcp://${ip}:${port}| ${deviceName}`);
    console.log(`Server Info: ${ip} : ${port}`);
    setIsLoading(false);
  };

  useEffect(() => {
    shimmerTranslateX.value = withRepeat(
      withTiming(300, {duration: 1500, easing: Easing.linear}),
      -1,
      false,
    );

    if (visible) {
      setIsLoading(true);
      setupServer();
    }
  }, [visible]);

  useEffect(() => {
    console.log('TCPProvider: isConnected updated to', isConnected);
    if (isConnected) {
      onClose();
      navigate('ConnectionScreen');
    }
  }, [isConnected]);

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      //   transparent={true}
      //   presentationStyle='pageSheet'
      onDismiss={onClose}
      animationType="slide">
      <View style={modalStyles.modalContainer}>
        <View style={modalStyles.qrContainer}>
          {isLoading || qrValue === '' || qrValue === null ? (
            <View style={modalStyles.skeleton}>
              <Animated.View style={[modalStyles.shimmerOverlay, shimmerStyle]}>
                <LinearGradient
                  colors={['#f3f3f3', '#fff', '#f3f3f3']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={modalStyles.shimmerGradient}
                />
              </Animated.View>
            </View>
          ) : (
            <QRCode
              value={qrValue}
              size={250}
              logoSize={60}
              logo={require('../../assets/images/profile2.jpg')}
              logoBackgroundColor="#fff"
              logoMargin={2}
              logoBorderRadius={10}
              linearGradient={multiColor}
              enableLinearGradient
            />
          )}
        </View>

        <View style={modalStyles.info}>
          <CustomText style={modalStyles.infoText1}>
            Ensure you're on the same Wi-Fi network.
          </CustomText>
          <CustomText style={modalStyles.infoText2}>
            Ask the sender to scan this QR code to connect and transfer files
          </CustomText>
        </View>

        <ActivityIndicator
          size="small"
          color="#000"
          style={{alignSelf: 'center'}}
        />

        <TouchableOpacity
          onPress={() => onClose()}
          style={modalStyles.closeButton}>
          <Icon
            name="close"
            IconFamily="MaterialIcons"
            size={24}
            color="#000"
          />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default QRGeneratorModal;
