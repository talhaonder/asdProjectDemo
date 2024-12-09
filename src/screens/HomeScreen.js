import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage'; // Import Firebase Storage
import QRCodeItem from '../components/HomeComponents/QRCodeItem';
import QRCodeModal from '../components/HomeComponents/QRCodeModal';
import {
  colors,
  typography,
  spacing,
  layout,
  buttonSizes,
} from '../components/design';
import {launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Feather';

const HomeScreen = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState(null);
  const [newImageUri, setNewImageUri] = useState(null);
  const [newNote, setNewNote] = useState('');

  const fetchData = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const snapshot = await firestore().collection('qrCodes').get();
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        name: doc.data().name, // Use the 'name' field from Firestore
      }));
      setData(list);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const uploadImageToStorage = async uri => {
    if (!uri) return null;

    const filename = uri.split('/').pop(); // Get the filename from URI
    const reference = storage().ref(filename); // Create reference in Firebase Storage

    try {
      await reference.putFile(uri); // Upload the image file
      const url = await reference.getDownloadURL(); // Get the image URL
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRowPress = item => {
    setSelectedQRCode(item);
    setNewImageUri(item.imageUri); // Set image URL from Firestore
    setNewNote(item.note);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (selectedQRCode) {
      try {
        let imageUrl = newImageUri;
        if (newImageUri && newImageUri.startsWith('file://')) {
          // If the URI is a local file, upload it to Firebase Storage
          imageUrl = await uploadImageToStorage(newImageUri);
        }

        // Update Firestore document with the new image URL and note
        await firestore().collection('qrCodes').doc(selectedQRCode.id).update({
          imageUri: imageUrl, // Save image URL from Firebase Storage
          note: newNote,
        });

        fetchData(); // Update data
        setModalVisible(false);
      } catch (error) {
        console.error('Error updating QR code:', error);
      }
    }
  };

  const handleDeleteQRCode = async () => {
    if (!selectedQRCode) return;
    try {
      await firestore().collection('qrCodes').doc(selectedQRCode.id).delete();
      setData(prevData =>
        prevData.filter(item => item.id !== selectedQRCode.id),
      );
      setModalVisible(false);
    } catch (error) {
      console.error('Error deleting QR code:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.designedContainer}>
        <Text style={styles.title}>QR Kodları Tablosu</Text>
        <View style={styles.textContainer}>
          <Icon name="image" color={colors.white} size={buttonSizes.iconSize} />
          <Icon name="code" color={colors.white} size={buttonSizes.iconSize} />
          <Icon name="user" color={colors.white} size={buttonSizes.iconSize} />
          <Icon
            name="calendar"
            color={colors.white}
            size={buttonSizes.iconSize}
          />
        </View>

        <FlatList
          data={data}
          renderItem={({item}) => (
            <QRCodeItem item={item} onPress={handleRowPress} name={item.name} />
          )}
          keyExtractor={item => item.id}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListFooterComponent={loading ? <Text>Loading...</Text> : null}
        />
      </View>
      {selectedQRCode && (
        <QRCodeModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          imageUri={newImageUri}
          note={newNote}
          name={selectedQRCode?.name} // Pass the 'name' from selectedQRCode
          onImageChange={setNewImageUri}
          onNoteChange={setNewNote}
          onSave={handleSave}
          onDelete={handleDeleteQRCode}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.medium,
    backgroundColor: colors.white,
  },
  designedContainer: {
    padding: spacing.large,
    backgroundColor: colors.darkGray,
    borderBottomRightRadius: layout.borderRadius.large,
    borderBottomLeftRadius: layout.borderRadius.large,
  },
  title: {
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.bold,
    paddingBottom: spacing.large,
    color: colors.white,
  },
  textContainer: {
    flexDirection: 'row',
    gap: 60,
    padding: spacing.medium,
    borderBottomWidth: spacing.one,
    borderBottomColor: colors.darkWhite,
  },
});

export default HomeScreen;
