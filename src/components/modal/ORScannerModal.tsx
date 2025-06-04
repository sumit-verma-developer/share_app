import {
  View,
  Text,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import React, {FC, useEffect, useMemo, useState} from 'react';
import {modalStyles} from '../../styles/modalStyles';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from '../global/CustomText';
import Icon from '../global/Icon';
import {Camera, CodeScanner, useCameraDevice} from 'react-native-vision-camera';
import {checkFilePermissions} from '../../utils/libraryHelpers';
import {useTCP} from '../../service/TCPProvider';
import {navigate} from '../../utils/NavigationUtil';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
}

const ORScannerModal: FC<ModalProps> = ({visible, onClose}) => {
  const {isConnected, startServer, connectToServer} = useTCP();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [codeFound, setCodeFound] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState(false);
  const device = useCameraDevice('back') as any;
  const shimmerTranslateX = useSharedValue(-300);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{translateX: shimmerTranslateX.value}],
  }));

  useEffect(() => {
    const checkPermission = async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      setHasPermission(cameraPermission === 'granted');
    };
    checkPermission();
    checkFilePermissions(Platform.OS);
    if (visible) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 400);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleScan = (data: string) => {
    if (!data) return;
    const [connectionData, deviceName] = data.replace('tcp://', '').split('|');
    if (!connectionData) return;
    const [host, port] = connectionData.split(':');
    // connectToServer
    connectToServer(host.trim(), parseInt(port.trim(), 10), deviceName.trim());
  };

  const codeScanner = useMemo<CodeScanner>(
    () => ({
      codeTypes: ['qr', 'codabar'],
      onCodeScanned: codes => {
        if (codeFound) {
          return;
        }
        console.log(`Scanned ${codes?.length} codes!`);
        if (codes?.length > 0 && codes[0].value) {
          const scannedData = codes[0].value;
          console.log(scannedData);
          setCodeFound(true);
          handleScan(scannedData);
        }
      },
    }),
    [codeFound],
  );

  useEffect(() => {
    if (isConnected) {
      onClose();
      navigate('ConnectionScreen ');
    }
  }, [isConnected]);

  useEffect(() => {
    shimmerTranslateX.value = withRepeat(
      withTiming(300, {duration: 1500, easing: Easing.linear}),
      -1,
      false,
    );
  }, [shimmerTranslateX]);

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      onDismiss={onClose}
      animationType="slide">
      <View style={modalStyles.modalContainer}>
        <View style={modalStyles.qrContainer}>
          {isLoading ? (
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
            <>
              {!device || !hasPermission ? (
                <View style={modalStyles.skeleton}>
                  <Image
                    source={require('../../assets/images/no_camera.png')}
                    style={modalStyles.noCameraImage}
                  />
                </View>
              ) : (
                <View style={modalStyles.skeleton}>
                  <Camera
                    style={modalStyles.camera}
                    isActive={visible}
                    device={device}
                    codeScanner={codeScanner}
                  />
                </View>
              )}
            </>
          )}
        </View>

        <View style={modalStyles.info}>
          <CustomText style={modalStyles.infoText1}>
            Ensure you're on the same Wi-Fi network.
          </CustomText>
          <CustomText style={modalStyles.infoText2}>
            Ask the receiver to show a QR code to connect and transfer files.
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

export default ORScannerModal;
