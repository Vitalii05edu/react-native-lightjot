import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../constants/theme';
import { loadNotes, saveNotes } from '../services/storage';

export default function Editor() {
  const router = useRouter();
  const { id, text } = useLocalSearchParams<{ id?: string; text?: string }>();
  
  const [noteText, setNoteText] = useState<string>(text || '');

  const handleSave = async (): Promise<void> => {
    if (noteText.trim() === '') {
      router.back();
      return;
    }

    const savedNotes = await loadNotes();

    if (id) {
      const updatedNotes = savedNotes.map((item: any) => 
        item.id === id ? { ...item, text: noteText } : item
      );
      await saveNotes(updatedNotes);
    } else {
      const newNote = {
        id: Date.now().toString(),
        text: noteText,
        pinned: false,
      };
      await saveNotes([...savedNotes, newNote]);
    }
    
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.editorHeader}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.headerButton}
        >
          <Text style={styles.dangerText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleSave} 
          style={styles.headerButton}
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
      
      <TextInput
        style={styles.fullScreenInput}
        placeholder="Start typing..."
        value={noteText}
        onChangeText={setNoteText}
        multiline={true}
        autoFocus={true}
        textAlignVertical="top"
      />
    </SafeAreaView>
  );
}