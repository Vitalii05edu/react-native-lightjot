import { Link, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from 'react';
import { FlatList, Modal, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '../constants/theme';
import { loadNotes, saveNotes } from '../services/storage';

interface Note {
  id: string;
  text: string;
  pinned: boolean;
}

export default function Notepad() {
  const router = useRouter();

  const [notesList, setNotesList] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchNotes = async () => {
        const savedNotes = await loadNotes();
        setNotesList(savedNotes || []);
      };
      fetchNotes();
    }, [])
  );

  const openEditor = (note?: Note): void => {
    if (note) {
      router.push({ pathname: '/editor', params: { id: note.id, text: note.text } });
    } else {
      router.push('/editor');
    }
  };

  const deleteNote = async (id: string): Promise<void> => {
    const updatedNotes = notesList.filter(item => item.id !== id);
    setNotesList(updatedNotes);
    await saveNotes(updatedNotes);
    closeMenu();
  };

  const togglePinNote = async (id: string): Promise<void> => {
    const updatedNotes = notesList.map(item => 
      item.id === id ? { ...item, pinned: !item.pinned } : item
    );
    setNotesList(updatedNotes);
    await saveNotes(updatedNotes);
    closeMenu();
  };

  const openMenu = (note: Note): void => {
    setActiveNote(note);
    setIsMenuOpen(true);
  };

  const closeMenu = (): void => {
    setIsMenuOpen(false);
    setActiveNote(null);
  };

  const displayedNotes = notesList
    .filter(note => note.text.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.header}>LightJot</Text>
        <Link href="/(tabs)/settings" asChild>
          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </Link>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearSearchButton} 
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={displayedNotes}
        keyExtractor={(item: Note) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }: { item: Note }) => (
          <View style={[styles.noteItem, item.pinned && styles.pinnedNoteItem]}>
            <TouchableOpacity 
              style={styles.noteTextContainer} 
              onPress={() => openEditor(item)}
            >
              <Text style={styles.noteText} numberOfLines={2}>
                {item.pinned ? '📌 ' : ''}{item.text}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openMenu(item)} style={styles.menuButton}>
              <Text style={styles.menuButtonText}>⋮</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal
        transparent={true}
        visible={isMenuOpen}
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.modalOverlay}>
            <View style={styles.menuContainer}>
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => activeNote && togglePinNote(activeNote.id)}
              >
                <Text style={styles.menuItemText}>
                  {activeNote?.pinned ? 'Unpin shortcut' : 'Pin shortcut'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.menuItem, styles.deleteMenuItem]} 
                onPress={() => activeNote && deleteNote(activeNote.id)}
              >
                <Text style={styles.deleteMenuText}>Delete</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem} onPress={closeMenu}>
                <Text style={styles.cancelMenuText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Link href="/(tabs)/ai" asChild>
        <TouchableOpacity style={styles.aiButton}>
          <Text style={styles.aiIcon}>✨</Text>
        </TouchableOpacity>
      </Link>

      <TouchableOpacity style={styles.fab} onPress={() => openEditor()}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
