import React, { useEffect, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Link } from "expo-router";

import { loadNotes, saveNotes } from '../services/storage';

interface Note {
  id: string;
  text: string;
  pinned: boolean;
}

export default function Notepad() {
  const [notesList, setNotesList] = useState<Note[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      const savedNotes = await loadNotes();
      setNotesList(savedNotes);
    };
    fetchNotes();
  }, []);

  useEffect(() => {
    saveNotes(notesList);
  }, [notesList]);

  const openEditor = (note?: Note): void => {
    if (note) {
      setEditingId(note.id);
      setNoteText(note.text);
    } else {
      setEditingId(null);
      setNoteText('');
    }
    setIsEditorOpen(true);
  };

  const closeEditor = (): void => {
    setIsEditorOpen(false);
    setEditingId(null);
    setNoteText('');
  };

  const handleSave = (): void => {
    if (noteText.trim() === '') {
      closeEditor();
      return;
    }

    if (editingId) {
      setNotesList(notesList.map(item => 
        item.id === editingId ? { ...item, text: noteText } : item
      ));
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        text: noteText,
        pinned: false,
      };
      setNotesList([...notesList, newNote]);
    }
    closeEditor();
  };

  const deleteNote = (id: string): void => {
    setNotesList(notesList.filter(item => item.id !== id));
    closeMenu();
  };

  const togglePinNote = (id: string): void => {
    setNotesList(notesList.map(item => 
      item.id === id ? { ...item, pinned: !item.pinned } : item
    ));
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

  if (isEditorOpen) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.editorHeader}>
          <TouchableOpacity onPress={closeEditor} style={styles.headerButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={{ width: 34 }} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
  },
  clearSearchButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearSearchText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  noteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  pinnedNoteItem: {
    backgroundColor: '#fff9e6',
    borderColor: '#ffe0b2',
  },
  noteTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  noteText: {
    fontSize: 16,
    color: '#333',
  },
  menuButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  menuButtonText: {
    fontSize: 22,
    color: '#666',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    backgroundColor: '#007BFF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabText: {
    color: '#fff',
    fontSize: 30,
    lineHeight: 34,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  headerButton: {
    padding: 10,
  },
  saveText: {
    color: '#007BFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  fullScreenInput: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    fontSize: 18,
    lineHeight: 26,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 12,
    padding: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  deleteMenuItem: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  deleteMenuText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  cancelMenuText: {
    fontSize: 16,
    color: '#666',
  },
  settingsButton: {
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 24,
    lineHeight: 28,
  },
  aiButton: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiIcon: {
    fontSize: 56
  }
});