import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import firestore from '@react-native-firebase/firestore';
import * as ImagePicker from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import {colors, layout, size, spacing, typography} from '../components/design'; // Import your design system
import QRCodeDetails from '../components/ScannerComponents/QRCodeDetails';
import AddNewQRCode from '../components/ScannerComponents/AddNewQRCode';

const QRCodeScannerScreen = () => {
  const [data, setData] = useState('Scan something');
  const [qrCodes, setQrCodes] = useState([]);
  const [isScanning, setIsScanning] = useState(true);
  const [note, setNote] = useState('');
  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [existingQRCode, setExistingQRCode] = useState(null);
  const [isQRCodeVisible, setQRCodeVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  useEffect(() => {
    fetchRecentQRCodes();
  }, []);

  const fetchRecentQRCodes = async () => {
    try {
      const qrCodesSnapshot = await firestore()
        .collection('qrCodes')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();

      const qrCodesData = qrCodesSnapshot.docs.map(doc => doc.data());
      setQrCodes(qrCodesData);
    } catch (error) {
      console.error('Error fetching QR codes:', error);
    }
  };

  const fetchQRCodeData = async qrCode => {
    setIsLoading(true); // Show loading indicator
    setQRCodeVisible(false); // Reset visibility of QR details

    // Simulate fetching from Firestore (replace this with your actual Firestore logic)
    const qrData = await firestore()
      .collection('qrCodes')
      .where('code', '==', qrCode)
      .get();

    setTimeout(() => {
      if (!qrData.empty) {
        const qrCodeData = qrData.docs[0].data();
        setExistingQRCode({...qrCodeData, id: qrData.docs[0].id});
        setQRCodeVisible(true); // Show QR code details
      } else {
        setExistingQRCode(null); // No data found
        setQRCodeVisible(false); // Show form to add new QR code
      }
      setIsLoading(false); // Hide loading indicator after delay
    }, 2000); // Delay for 2 seconds
  };

  const onSuccess = async e => {
    setData(e.data);
    setIsScanning(false);
    await fetchQRCodeData(e.data);
  };

  // Function to reset the scanner
  const resetScanner = () => {
    setIsScanning(true);
    setExistingQRCode(null); // Reset the existing QR code state
  };

  const handleSavePress = () => {
    setIsSaving(true);

    if (existingQRCode) {
      // If the QR code exists, update it
      saveQRCodeToFirestore(data, imageUri, note, name, existingQRCode.id); // Add name here
    } else {
      // If the QR code doesn't exist, create a new one
      saveQRCodeToFirestore(data, imageUri, note, name); // Add name here
    }
  };

  const saveQRCodeToFirestore = async (qrData, imageUri, note, name, docId) => {
    try {
      if (!qrData || !imageUri || !note || !name) {
        console.error('QR code, image, note, or name is missing!');
        return;
      }

      // Upload image to Firebase Storage
      const imageUrl = await uploadImageToStorage(imageUri);
      if (!imageUrl) {
        console.error('Image upload failed!');
        return;
      }

      // Check if we are updating or creating a new QR code
      if (docId) {
        // Update existing QR code
        await firestore().collection('qrCodes').doc(docId).update({
          code: qrData,
          imageUri: imageUrl,
          note: note,
          name: name, // Save name as well
          timestamp: firestore.FieldValue.serverTimestamp(),
        });
        console.log('QR code successfully updated!');
      } else {
        // Create new QR code
        await firestore().collection('qrCodes').add({
          code: qrData,
          imageUri: imageUrl,
          note: note,
          name: name, // Save name as well
          timestamp: firestore.FieldValue.serverTimestamp(),
        });
        console.log('QR code successfully added to Firestore!');
      }

      // Refresh the QR code list
      fetchRecentQRCodes();

      // Clear the fields after saving
      setNote('');
      setImageUri('');
      setIsScanning(true); // Start scanning again if desired
    } catch (error) {
      console.error('Error saving QR code:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const uploadImageToStorage = async uri => {
    if (!uri) {
      console.error('Invalid image URI!');
      return null;
    }

    const fileName = uri.split('/').pop();
    const reference = storage().ref(fileName);

    try {
      console.log('Uploading file:', uri);
      await reference.putFile(uri);
      const url = await reference.getDownloadURL();
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleImagePicker = () => {
    ImagePicker.launchImageLibrary(
      {mediaType: 'photo', quality: 1},
      response => {
        if (response.assets && response.assets.length > 0) {
          setImageUri(response.assets[0].uri);
        }
      },
    );
  };

  const handleCameraPress = () => {
    ImagePicker.launchCamera({mediaType: 'photo', quality: 1}, response => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
      }
    });
  };
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {isScanning ? (
          <View style={styles.container}>
            <View style={styles.cameraContainer}>
              <QRCodeScanner
                onRead={onSuccess}
                flashMode={RNCamera.Constants.FlashMode.auto}
                topContent={
                  <Text style={styles.centerText}>
                    Please align the QR code within the scanner.
                  </Text>
                }
                bottomContent={
                  <Text style={styles.centerText}>
                    Scan the QR code to view details.
                  </Text>
                }
                showMarker={true}
                cameraStyle={styles.camera} // Kameranın boyutunu belirler
              />
            </View>
          </View>
        ) : (
          <View style={styles.container}>
            {isLoading ? (
              // Show loading indicator while fetching QR data
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <View style={styles.formContainer}>
                {/* Display scanned QR details or show form to add new QR */}
                {existingQRCode && isQRCodeVisible ? (
                  <QRCodeDetails
                    existingQRCode={existingQRCode}
                    resetScanner={resetScanner}
                  />
                ) : (
                  <AddNewQRCode
                    imageUri={imageUri}
                    note={note}
                    setNote={setNote}
                    name={name}
                    setName={setName}
                    handleImagePicker={handleImagePicker}
                    handleCameraPress={handleCameraPress}
                    handleSavePress={handleSavePress}
                    resetScanner={resetScanner}
                    isSaving={isSaving}
                  />
                )}
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkWhite,
    justifyContent: 'center',
  },
  cameraContainer: {
    flex: 1, // Ekranın tamamını kaplasın
    alignItems: 'center', // Yatay olarak ortalar
    justifyContent: 'center',
  },
  camera: {
    height: 250, // Kameranın yüksekliği
    width: 250, // Kameranın genişliği
    borderRadius: 10, // Kameranın kenarlarını yuvarla
    overflow: 'hidden', // Kenar taşmalarını engelle
    alignSelf: 'center',
    justifyContent: 'center', // Dikey olarak ortalar
  },
  centerText: {
    textAlign: 'center',
    color: colors.text,
    fontSize: typography.fontSize.medium,
    marginVertical: spacing.small,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: spacing.medium,
  },
  loadingIndicator: {
    position: 'relative',
    top: '50%',
    left: '50%',
    transform: [{translateX: -30}, {translateY: -30}],
  },
});

export default QRCodeScannerScreen;
