import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../constants/theme';
import { saveNotes } from '../services/storage';

export default function Settings() {
  const handleDeleteAll = () => {
    Alert.alert(
      "Deletion",
      "Are you sure you want to delete all your notes?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            await saveNotes([]);
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.header}>Settings</Text>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.settingRow}>
          <Text style={styles.settingDescription}>Delete all notes</Text>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDeleteAll}
            >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingDescription}>Contact me: </Text>
          <Text selectable={true} style={styles.emailText}>zhabkovitalii2005edu@gmail.com</Text>
        </View>
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>LightJot v1.0</Text>
      </View>
    </SafeAreaView>
  );
}
