// QRCodeDetails.js
import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, spacing, layout, size, typography} from '../design';

const QRCodeDetails = ({existingQRCode, resetScanner, imageUri}) => (
  <View style={styles.qrCodeDetails}>
    <Image
      source={{uri: existingQRCode.imageUri}}
      style={styles.imagePreview}
    />
    <Text style={styles.cell}>Code: {existingQRCode.code}</Text>
    <Text style={styles.cell}>Note: {existingQRCode.note}</Text>

    <TouchableOpacity style={styles.button} onPress={resetScanner}>
      <Text style={styles.buttonText}>Scan Again</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  qrCodeDetails: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: layout.borderRadius.medium,
    padding: spacing.medium,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: spacing.ten,
    elevation: 5,
    marginBottom: spacing.large,
    alignItems: 'center',
  },
  imagePreview: {
    width: size.two,
    height: size.two,
    borderRadius: layout.borderRadius.medium,
    marginBottom: spacing.medium,
  },
  cell: {
    fontSize: typography.fontSize.medium,
    marginBottom: spacing.medium,
    color: colors.gray,
  },
  button: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.ten,
    paddingHorizontal: spacing.large,
    borderRadius: layout.borderRadius.small,
    marginVertical: spacing.ten,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.fontSize.medium,
  },
});

export default QRCodeDetails;
