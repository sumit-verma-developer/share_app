import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {bottomTabStyles} from '../../styles/bottomTabStyle';
import Icon from '../global/Icon';
import {navigate} from '../../utils/NavigationUtil';
import ORScannerModal from '../modal/ORScannerModal';

const AbsoluteQRBottom = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  return (
    <>
      <View style={bottomTabStyles.container}>
        <TouchableOpacity onPress={() => navigate('ReceivedFileScreen')}>
          <Icon
            name="apps"
            IconFamily="MaterialCommunityIcons"
            color="#333"
            size={24}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsVisible(true)}>
          <Icon
            name="qrcode-scan"
            IconFamily="MaterialCommunityIcons"
            color="#333"
            size={24}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigate('ReceivedFileScreen')}>
          <Icon
            name="beer"
            IconFamily="MaterialCommunityIcons"
            color="#333"
            size={24}
          />
        </TouchableOpacity>
      </View>
      {isVisible && (
        <ORScannerModal
          visible={isVisible}
          onClose={() => setIsVisible(false)}
        />
      )}
    </>
  );
};

export default AbsoluteQRBottom;
