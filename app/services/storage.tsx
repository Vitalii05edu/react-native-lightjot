import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveNotes = async (notes: any) => {
  try {
    await AsyncStorage.setItem('notes', JSON.stringify(notes));
  } catch (e) {
    // error
  }
};

export const loadNotes = async () => {
  try {
    const value = await AsyncStorage.getItem('notes');

    if (value !== null) {
      return JSON.parse(value);
    }
    return [];
  } catch (e) {
    // error
    return [];
  }
};