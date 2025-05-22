import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import React, {FC} from 'react';
import {RFValue} from 'react-native-responsive-fontsize';

interface IconProps {
  color?: string;
  size: number;
  name: string;
  IconFamily: 'Ionicons' | 'MaterialCommunityIcons' | 'MaterialIcons';
}

const Icon: FC<IconProps> = ({color, size, name, IconFamily}) => {
  return (
    <>
      {IconFamily === 'Ionicons' && (
        <Ionicons name={name} color={color} size={RFValue(size)} />
      )}

      {IconFamily === 'MaterialCommunityIcons' && (
        <MaterialCommunityIcons name={name} color={color} size={RFValue(size)} />
      )}
      {IconFamily === 'MaterialIcons' && (
        <MaterialIcons name={name} color={color} size={RFValue(size)} />
      )}
    </>
  );
};

export default Icon;
