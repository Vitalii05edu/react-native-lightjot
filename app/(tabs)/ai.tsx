import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../constants/theme';
import { askGemini } from '../services/gemini';

export default function Artificial() {
  const [inputQuery, setInputQuery] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSend = async () => {
    if (inputQuery.trim() === '' || isLoading) return;

    setIsLoading(true);
    setAiResponse('');
    
    try {
      const response = await askGemini(inputQuery);
      setAiResponse(response);
    } catch (error) {
      setAiResponse('Server connection error!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.header}>Gemini AI ✨</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Type your prompt here..."
          value={inputQuery}
          onChangeText={setInputQuery}
        />
        {inputQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearSearchButton} 
            onPress={() => setInputQuery('')}
          >
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.uploadAiButton}
          onPress={handleSend}
          disabled={isLoading || inputQuery.trim() === ''}
        >
          <Text style={styles.uploadAiText}>⬆</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.responseScrollContainer, styles.mainContent]}>
        {isLoading ? (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Generating response...</Text>
          </View>
        ) : aiResponse ? (
          <View style={styles.aiResponseCard}>
            <Text selectable={true} style={styles.baseText}>{aiResponse}</Text>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Feel free to ask anything...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Powered by Gemini 3.1 Flash-Lite</Text>
      </View>
      
    </SafeAreaView>
  );
}
