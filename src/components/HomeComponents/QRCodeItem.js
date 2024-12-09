// QRCodeItem.js
import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, typography, spacing} from '../design';
import {buttonSizes, layout} from '../design';

const QRCodeItem = ({item, onPress, name}) => (
  <TouchableOpacity onPress={() => onPress(item)}>
    <View style={styles.row}>
      <Image source={{uri: item.imageUri}} style={styles.image} />
      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.cell}>
        {item.code}
      </Text>
      <Text style={styles.cell}>{name}</Text>
      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.cell}>
        {item.timestamp?.toDate().toLocaleString()}
      </Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.ten,
    borderBottomWidth: spacing.one,
    borderBottomColor: colors.darkWhite,
    alignItems: 'center',
    paddingBottom: spacing.medium,
  },
  image: {
    width: buttonSizes.defaultHeight,
    height: buttonSizes.defaultHeight,
    borderRadius: layout.borderRadius.small,
    marginRight: spacing.ten,
  },
  cell: {
    fontSize: typography.fontSize.medium,
    width: '20%',
    color: colors.white,
    textAlign: 'center',
  },
});

export default QRCodeItem;
