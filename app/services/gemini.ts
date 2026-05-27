const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export const askGemini = async (prompt: string): Promise<string> => {
  try {
    if (!apiKey) {
      throw new Error("API key is missing or undefined.");
    }
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    return aiText || 'Blank answer.';
  } catch (error) {
    console.error("Gemini REST API Error:", error);
    throw error;
  }
};