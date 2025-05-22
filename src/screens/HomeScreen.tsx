import { View, Text } from 'react-native'
import React, { FC } from 'react'
import { commonStyles } from '../styles/commonStyles'
import HomeHeader from '../components/home/HomeHeader'

const HomeScreen:FC = () => {
  return (
    <View style={commonStyles.baseContainer}>
    <HomeHeader/>
    </View>
  )
}

export default HomeScreen