import {View, Text, SafeAreaView, TouchableOpacity, Image} from 'react-native';
import React, {useState} from 'react';
import {homeHeaderStyles} from '../../styles/homeHeaderStyles';
import {commonStyles} from '../../styles/commonStyles';
import Icon from '../global/Icon';

const HomeHeader = () => {
  const [isVisible, setVisible] = useState(false);

  return (
    <View style={homeHeaderStyles.mainContainer}>
      <SafeAreaView />
      <View style={[commonStyles.flexRowBetween, homeHeaderStyles.container]}>
        <TouchableOpacity>
            <Icon  name='menu' IconFamily='Ionicons' size={22} color='#fff'/>
        </TouchableOpacity>

        <Image
        style={homeHeaderStyles.logo}
        source={require('../../assets/images/logo_t.png')}
      />

        <TouchableOpacity>

        <Image
          style={homeHeaderStyles.profile}
          source={require('../../assets/images/profile.jpg')}
        />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeHeader;
