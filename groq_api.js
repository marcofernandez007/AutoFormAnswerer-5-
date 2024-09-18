const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function getGroqSuggestion(question) {
  console.log('Fetching suggestion from Groq API for question:', question);
  try {
    const response = await fetch(GROQ_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that provides concise suggestions for form questions.' },
          { role: 'user', content: `Suggest a brief answer for the following form question: "${question}"` }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.error('Groq API error:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received suggestion from Groq API');
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error in getGroqSuggestion:', error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Possible CORS issue. Check if the API endpoint is correctly configured and accessible.');
    }
    throw error;
  }
}

// Make the function available globally
window.getGroqSuggestion = getGroqSuggestion;

console.log('Groq API module loaded');
