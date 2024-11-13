import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Button,
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import firestore from '@react-native-firebase/firestore';
import * as ImagePicker from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

const QRCodeScannerScreen = () => {
  const [data, setData] = useState('Scan something');
  const [qrCodes, setQrCodes] = useState([]);
  const [isScanning, setIsScanning] = useState(true);
  const [note, setNote] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [existingQRCode, setExistingQRCode] = useState(null);
  const [isQRCodeVisible, setQRCodeVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    try {
      const qrDocSnapshot = await firestore()
        .collection('qrCodes')
        .where('code', '==', qrCode)
        .get();

      if (!qrDocSnapshot.empty) {
        const qrData = qrDocSnapshot.docs[0].data();
        setExistingQRCode({...qrData, id: qrDocSnapshot.docs[0].id});
        setQRCodeVisible(true);
      } else {
        setExistingQRCode(null);
        setQRCodeVisible(false);
      }
    } catch (error) {
      console.error('Error fetching QR code from Firestore:', error);
    }
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
      saveQRCodeToFirestore(data, imageUri, note, existingQRCode.id);
    } else {
      // If the QR code doesn't exist, create a new one
      saveQRCodeToFirestore(data, imageUri, note);
    }
  };

  const saveQRCodeToFirestore = async (qrData, imageUri, note, docId) => {
    try {
      if (!qrData || !imageUri || !note) {
        console.error('QR kodu, resim veya not eksik!');
        return;
      }

      // Upload image to Firebase Storage
      const imageUrl = await uploadImageToStorage(imageUri);
      if (!imageUrl) {
        console.error('Resim yüklenemedi!');
        return;
      }

      // Check if we are updating or creating a new QR code
      if (docId) {
        // Update existing QR code
        await firestore().collection('qrCodes').doc(docId).update({
          code: qrData,
          imageUri: imageUrl,
          note: note,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });
        console.log('QR kodu başarıyla güncellendi!');
      } else {
        // Create new QR code
        await firestore().collection('qrCodes').add({
          code: qrData,
          imageUri: imageUrl,
          note: note,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });
        console.log("QR kodu başarıyla Firestore'a kaydedildi!");
      }

      // Refresh the QR code list
      fetchRecentQRCodes();

      // Clear the fields after saving
      setNote('');
      setImageUri('');
      setIsScanning(true); // Start scanning again if desired
    } catch (error) {
      console.error('QR kodu kaydedilirken hata oluştu:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const uploadImageToStorage = async uri => {
    if (!uri) {
      console.error('Resim URI geçerli değil!');
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
      console.error('Resim yüklenirken hata oluştu:', error);
      return null;
    }
  };

  const handleImagePicker = () => {
    ImagePicker.launchImageLibrary(
      {mediaType: 'photo', quality: 1},
      response => {
        if (response.assets) {
          setImageUri(response.assets[0].uri);
        }
      },
    );
  };

  // Delete QR code from Firestore
  const deleteQRCodeFromFirestore = async code => {
    try {
      const snapshot = await firestore()
        .collection('qrCodes')
        .where('code', '==', code)
        .get();

      snapshot.forEach(doc => {
        doc.ref.delete(); // Delete the document
      });

      console.log('QR kodu başarıyla silindi!');
      fetchRecentQRCodes(); // Refresh QR codes list
      setExistingQRCode(null); // Reset QR code details
      setQRCodeVisible(false); // Hide the QR code section
    } catch (error) {
      console.error('QR kodu silinirken hata oluştu:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {isScanning ? (
          <QRCodeScanner
            onRead={onSuccess} // Call onSuccess when a QR code is scanned
            flashMode={RNCamera.Constants.FlashMode.auto}
          />
        ) : (
          <View style={styles.formContainer}>
            {/* Display scanned QR details or show form to add new QR */}
            {existingQRCode ? (
              <View style={styles.qrCodeDetails}>
                <Image
                  source={{uri: existingQRCode.imageUri}}
                  style={styles.imagePreview}
                />
                <Text style={styles.cell}>Code: {existingQRCode.code}</Text>
                <Text style={styles.cell}>Note: {existingQRCode.note}</Text>

                {/* Show Scan Again button */}
                <TouchableOpacity style={styles.button} onPress={resetScanner}>
                  <Text style={styles.buttonText}>Scan Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formWrapper}>
                <Text style={styles.infoText}>
                  No matching QR code found. Please add a new QR code below.
                </Text>

                {/* Image picker */}
                <TouchableOpacity
                  onPress={handleImagePicker}
                  style={styles.imagePickerButton}>
                  <Text style={styles.imagePickerText}>Pick an Image</Text>
                </TouchableOpacity>

                {imageUri ? (
                  <Image source={{uri: imageUri}} style={styles.imagePreview} />
                ) : null}

                {/* Note input */}
                <TextInput
                  style={styles.input}
                  placeholder="Enter a note for the QR code"
                  value={note}
                  onChangeText={setNote}
                />

                {/* Save Button */}
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSavePress}>
                  <Text style={styles.buttonText}>Save New QR Code</Text>
                </TouchableOpacity>

                {isSaving && <Text style={styles.savingText}>Saving...</Text>}

                {/* Rescan or Go Back Button */}
                <View style={styles.buttonContainer}>
                  {/* Button to rescan */}
                  <TouchableOpacity
                    onPress={resetScanner} // Assuming resetScanner resets the scanning state
                    style={styles.rescanButton}>
                    <Text style={styles.buttonText}>Rescan QR Code</Text>
                  </TouchableOpacity>

                  {/* Button to go back */}
                  <TouchableOpacity
                    onPress={() => navigation.goBack()} // Go back to the previous screen
                    style={styles.goBackButton}>
                    <Text style={styles.buttonText}>Go Back</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
  },
  rescanButton: {
    backgroundColor: '#FF9800', // Rescan button style (orange)
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  goBackButton: {
    backgroundColor: '#9E9E9E', // Go back button style (gray)
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    padding: 15,
  },
  container: {
    width: '100%',
    alignItems: 'center',
  },
  centerText: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formWrapper: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  infoText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '90%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
  },
  imagePickerButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  imagePickerText: {
    fontSize: 16,
    color: '#007BFF',
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  savingText: {
    fontSize: 18,
    color: '#333',
    marginTop: 20,
    fontWeight: 'bold',
  },
  qrCodeDetails: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  cell: {
    fontSize: 16,
    marginBottom: 12,
    color: '#333',
  },
});

export default QRCodeScannerScreen;
