import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {colors, layout, size, spacing} from '../design';
import * as ImagePicker from 'react-native-image-picker'; // Import ImagePicker
import {RFPercentage} from 'react-native-responsive-fontsize';
import {SafeAreaView} from 'react-native-safe-area-context';

const AddNewQRCode = ({
  imageUri,
  note,
  setNote,
  name,
  setName,
  handleImagePicker,
  handleCameraPress,
  handleSavePress,
  resetScanner,
  isSaving,
}) => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled" // To avoid closing keyboard on tap
      >
        <View style={styles.formWrapper}>
          <Text style={styles.infoText}>
            No matching QR code found. Please add a new QR code below.
          </Text>
          <View style={styles.inputView}>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor={colors.white} // Placeholder renk
              value={name}
              onChangeText={setName}
            />
          </View>
          {imageUri ? (
            <Image source={{uri: imageUri}} style={styles.imagePreview} />
          ) : null}
          <View style={styles.inputView}>
            <TextInput
              style={styles.input}
              placeholder="Enter a note for the QR code"
              placeholderTextColor={colors.white} // Placeholder renk
              value={note}
              onChangeText={setNote}
            />
          </View>
          <View style={styles.imagePickerWrapper}>
            <TouchableOpacity
              onPress={handleImagePicker}
              style={[styles.imagePickerButton, styles.pickImageButton]}>
              <Text style={styles.imagePickerText}>Pick from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCameraPress}
              style={[styles.imagePickerButton, styles.cameraButton]}>
              <Text style={styles.imagePickerText}>Take a Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.imagePickerWrapper}>
            <TouchableOpacity
              style={[styles.imagePickerButton, styles.savingButton]}
              onPress={handleSavePress}>
              <Text style={styles.buttonText}>Save New QR Code</Text>
            </TouchableOpacity>

            {isSaving && <Text style={styles.savingText}>Saving...</Text>}
            <TouchableOpacity
              onPress={resetScanner}
              style={[styles.imagePickerButton, styles.rescanButton]}>
              <Text style={styles.buttonText}>Rescan QR Code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.hundred,
  },
  formWrapper: {
    alignItems: 'center',
    padding: spacing.medium,
    backgroundColor: colors.darkGray,
    borderBottomLeftRadius: layout.borderRadius.xLarge,
    borderBottomRightRadius: layout.borderRadius.xLarge,
    width: '100%',
  },
  infoText: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.xLarge,
    color: colors.white,
    marginBottom: spacing.small,
    borderRadius: layout.borderRadius.large,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imagePickerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.small,
  },
  imagePickerButton: {
    backgroundColor: colors.success,
    padding: spacing.small,
    borderRadius: layout.borderRadius.xLarge,
    flex: 1,
    alignItems: 'center',
    marginRight: spacing.small,
    color: colors.white,
    borderColor: colors.gray,
    borderWidth: layout.borderWidth.thin,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  savingButton: {
    backgroundColor: colors.success,
  },
  pickImageButton: {
    backgroundColor: '#b15efb',
  },
  cameraButton: {
    backgroundColor: colors.secondary,
  },
  rescanButton: {
    backgroundColor: colors.red,
  },
  imagePickerText: {
    color: colors.white,
  },
  imagePreview: {
    width: '80%',
    height: 200, // Fixed height
    resizeMode: 'contain', // Fit the image inside
    marginVertical: spacing.small,
  },
  input: {
    flex: 1,
    fontSize: RFPercentage(2.1),
    marginLeft: spacing.medium,
    color: colors.white, // Text color
  },
  inputView: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: layout.borderRadius.xLarge,
    paddingVertical: spacing.thin,
    paddingHorizontal: spacing.thin,
    marginTop: spacing.large,
    marginBottom: spacing.large,
    borderColor: colors.pink,
    borderWidth: layout.borderWidth.thick,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  buttonText: {
    color: colors.white,
  },
  savingText: {
    color: colors.info,
    marginTop: spacing.small,
  },
});

export default AddNewQRCode;
