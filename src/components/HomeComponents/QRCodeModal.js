import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {
  colors,
  layout,
  spacing,
  typography,
  size,
  buttonSizes,
} from '../design';
import Icon from 'react-native-vector-icons/Feather';
import {RFPercentage} from 'react-native-responsive-fontsize';

const QRCodeModal = ({
  visible,
  onClose,
  imageUri,
  note,
  name, // Receive 'name' instead of 'savedBy'
  onImageChange,
  onNoteChange,
  onSave,
  onDelete,
}) => {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await onSave();
    setLoading(false);
    onClose();
  };

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, response => {
      if (response.assets) {
        onImageChange(response.assets[0].uri);
      }
    });
  };

  const handleCamera = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchCamera(options, response => {
      if (response.assets) {
        onImageChange(response.assets[0].uri);
      }
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false} // Yatay kaydırma çubuğunu gizle
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>QR Code Details</Text>
            <Text style={styles.modalText}>Saved By: {name}</Text>

            {imageUri ? (
              <Image source={{uri: imageUri}} style={styles.modalImage} />
            ) : (
              <Text>No image selected</Text>
            )}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={handleImagePicker}
                style={styles.button}>
                <Icon
                  name="image"
                  size={buttonSizes.iconSize}
                  color={colors.darkGray}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCamera} style={styles.button}>
                <Icon
                  name="camera"
                  size={buttonSizes.iconSize}
                  color={colors.darkGray}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
              <TextInput
                style={styles.input}
                placeholder="Enter a note for the QR code"
                placeholderTextColor={colors.white} // Placeholder rengini ayarlayın
                value={note}
                onChangeText={onNoteChange}
              />
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Updating...</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}>
                  <Text style={styles.buttonText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={onDelete}>
                  <Text style={styles.buttonText}>Delete QR Code</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.hundred,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.transparentw,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.medium,
  },
  modalContainer: {
    backgroundColor: colors.darkGray,
    padding: spacing.xLarge,
    width: '100%',
    borderBottomLeftRadius: layout.borderRadius.xLarge,
    borderBottomRightRadius: layout.borderRadius.xLarge,
    alignItems: 'center',
    marginBottom: spacing.hundred,
  },
  modalTitle: {
    fontSize: typography.fontSize.large,
    fontWeight: 'bold',
    marginBottom: spacing.large,
    color: colors.white,
  },
  modalText: {
    fontSize: typography.fontSize.medium,
    marginBottom: spacing.large,
    color: colors.white,
  },
  modalImage: {
    width: size.hundred * 2,
    height: size.hundred * 2,
    borderRadius: layout.borderRadius.medium,
    marginBottom: spacing.large,
  },
  button: {
    backgroundColor: colors.darkWhite,
    marginBottom: spacing.medium,
    borderRadius: spacing.hundred,
    alignItems: 'center',
    width: '35%',
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.regular,
  },
  saveButton: {
    backgroundColor: colors.success,
    padding: spacing.ten,
    marginBottom: spacing.medium,
    borderRadius: layout.borderRadius.small,
    width: '70%',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: spacing.ten,
    marginBottom: spacing.medium,
    borderRadius: layout.borderRadius.small,
    width: '70%',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: colors.black,
    padding: spacing.ten,
    marginBottom: spacing.medium,
    borderRadius: layout.borderRadius.small,
    width: '70%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.white,
  },
  input: {
    flex: 1,
    fontSize: RFPercentage(2.1),
    marginLeft: spacing.medium,
    color: colors.white,
  },
  inputView: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: layout.borderRadius.xLarge,
    marginTop: spacing.large,
    marginBottom: spacing.large,
    borderColor: colors.pink,
    borderWidth: layout.borderWidth.thin,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  savedByLabel: {
    fontSize: typography.fontSize.medium,
    color: colors.text,
    marginBottom: spacing.small,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  loadingText: {
    marginLeft: spacing.ten,
    color: colors.primary,
  },
});

export default QRCodeModal;
