import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {launchImageLibrary} from 'react-native-image-picker'; // For image picker

const HomeScreen = () => {
  const [data, setData] = useState([]); // State to hold the Firestore data
  const [loading, setLoading] = useState(false); // Loading state to prevent multiple requests at once
  const [refreshing, setRefreshing] = useState(false); // State to track pull-to-refresh
  const [modalVisible, setModalVisible] = useState(false); // State to manage modal visibility
  const [selectedQRCode, setSelectedQRCode] = useState(null); // State to hold the selected QR code details
  const [newImageUri, setNewImageUri] = useState(null); // State to store new image URI for editing
  const [newNote, setNewNote] = useState(''); // State to store updated note

  // Fetch data from Firestore
  const fetchData = async () => {
    if (loading) return; // Prevent multiple fetch requests
    setLoading(true);
    try {
      const snapshot = await firestore().collection('qrCodes').get(); // Get all documents from qrCodes collection
      const list = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})); // Include doc.id for easy referencing
      setData(list); // Update state with the data
    } catch (error) {
      console.error('Error fetching data from Firestore:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true); // Set refreshing to true when the refresh starts
    await fetchData(); // Fetch new data
    setRefreshing(false); // Set refreshing to false once the data is loaded
  };

  useEffect(() => {
    fetchData(); // Call fetchData when the component mounts
  }, []);

  // Handle row press (open modal)
  const handleRowPress = item => {
    setSelectedQRCode(item); // Set selected QR code data
    setNewImageUri(item.imageUri); // Set current image URI in state
    setNewNote(item.note); // Set current note in state
    setModalVisible(true); // Show modal
  };

  // Handle image selection from gallery
  const handleImagePicker = () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (response.assets && response.assets.length > 0) {
        setNewImageUri(response.assets[0].uri); // Set new image URI
      }
    });
  };

  // Handle saving changes to Firestore
  const handleSaveChanges = async () => {
    if (!selectedQRCode) return; // Ensure a QR code is selected

    try {
      await firestore().collection('qrCodes').doc(selectedQRCode.id).update({
        note: newNote, // Update the note
        imageUri: newImageUri, // Update image URI
      });

      // Update local state with new data
      setData(prevData =>
        prevData.map(item =>
          item.id === selectedQRCode.id
            ? {...item, note: newNote, imageUri: newImageUri}
            : item,
        ),
      );

      setModalVisible(false); // Close modal after saving
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  // Handle deleting QR code from Firestore
  const handleDeleteQRCode = async () => {
    if (!selectedQRCode) return; // Ensure a QR code is selected

    try {
      await firestore().collection('qrCodes').doc(selectedQRCode.id).delete();

      // Remove deleted QR code from local state
      setData(prevData =>
        prevData.filter(item => item.id !== selectedQRCode.id),
      );

      setModalVisible(false); // Close modal after deleting
    } catch (error) {
      console.error('Error deleting QR code:', error);
    }
  };

  // Render each row in the table
  const renderItem = ({item}) => (
    <TouchableOpacity onPress={() => handleRowPress(item)}>
      <View style={styles.row}>
        <Image source={{uri: item.imageUri}} style={styles.image} />
        {/* Render the image */}
        <Text style={styles.cell}>{item.code}</Text>
        <Text style={styles.cell}>{item.note}</Text>
        <Text style={styles.cell}>
          {item.timestamp?.toDate().toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QR Kodları Tablosu</Text>
      <FlatList
        data={data} // Data to display
        renderItem={renderItem} // Render function for each row
        keyExtractor={item => item.id} // Use id as the key for unique keys
        onRefresh={handleRefresh} // Trigger refresh when user pulls down
        refreshing={refreshing} // Show loading spinner when refreshing
        ListFooterComponent={loading ? <Text>Loading...</Text> : null} // Show loading indicator at the bottom
      />

      {/* Modal for QR Code details */}
      {selectedQRCode && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>QR Code Details</Text>
              <Image source={{uri: newImageUri}} style={styles.modalImage} />
              {/* Image Picker Button */}
              <TouchableOpacity
                onPress={handleImagePicker}
                style={styles.button}>
                <Text style={styles.buttonText}>Change Image</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Edit note"
                value={newNote}
                onChangeText={setNewNote}
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveChanges}>
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteQRCode}>
                <Text style={styles.buttonText}>Delete QR Code</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 5, // Adjust this for rounded corners if needed
    marginRight: 10, // Space between image and text
  },
  cell: {
    fontSize: 16,
    width: '20%', // Adjust the width of the cells
  },

  // Modal Styles
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    width: '80%',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    width: '70%',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    width: '70%',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#9E9E9E',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    width: '70%',
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    width: '70%',
    paddingHorizontal: 10,
  },
});

export default HomeScreen;
