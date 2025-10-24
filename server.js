const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Language codes mapping
const languageCodes = {
  'English': 'en',
  'Spanish': 'es',
  'French': 'fr',
  'German': 'de',
  'Italian': 'it',
  'Portuguese': 'pt',
  'Russian': 'ru',
  'Chinese': 'zh',
  'Japanese': 'ja',
  'Korean': 'ko',
  'Arabic': 'ar',
  'Hindi': 'hi',
  'Dutch': 'nl',
  'Polish': 'pl',
  'Turkish': 'tr',
  'Swedish': 'sv',
  'Norwegian': 'no',
  'Danish': 'da',
  'Finnish': 'fi',
  'Greek': 'el'
};

// Translation endpoint using MyMemory API (free translation service)
app.post('/api/translate', async (req, res) => {
  try {
    const { text, fromLang, toLang } = req.body;

    if (!text || !fromLang || !toLang) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const fromCode = languageCodes[fromLang] || fromLang;
    const toCode = languageCodes[toLang] || toLang;

    // Using MyMemory API (free, no API key required)
    const response = await axios.get('https://api.mymemory.translated.net/get', {
      params: {
        q: text,
        langpair: `${fromCode}|${toCode}`
      }
    });

    if (response.data && response.data.responseData) {
      res.json({
        translatedText: response.data.responseData.translatedText,
        fromLang: fromLang,
        toLang: toLang
      });
    } else {
      res.status(500).json({ error: 'Translation failed' });
    }
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation service unavailable' });
  }
});

// Get available languages
app.get('/api/languages', (req, res) => {
  res.json(Object.keys(languageCodes));
});

// Language detection endpoint (simple heuristic-based)
app.post('/api/detect', (req, res) => {
  const { text } = req.body;
  
  // Simple language detection based on character patterns
  const detectedLang = detectLanguage(text);
  res.json({ detectedLanguage: detectedLang });
});

function detectLanguage(text) {
  // Basic language detection heuristics
  const cleanText = text.toLowerCase().trim();
  
  // Check for common patterns
  if (/[а-яё]/.test(cleanText)) return 'Russian';
  if (/[α-ωάέήίόύώ]/.test(cleanText)) return 'Greek';
  if (/[أ-ي]/.test(cleanText)) return 'Arabic';
  if (/[一-龯]/.test(cleanText)) return 'Chinese';
  if (/[ひらがなカタカナ]/.test(cleanText)) return 'Japanese';
  if (/[한글]/.test(cleanText)) return 'Korean';
  if (/[देवनागरी]/.test(cleanText)) return 'Hindi';
  
  // Common word patterns
  if (/\b(the|and|is|in|to|of|a|that|it|with|for|as|was|on|are|you)\b/.test(cleanText)) return 'English';
  if (/\b(el|la|en|de|que|y|un|es|se|no|te|lo|le|da|su|por|son|con|para|una)\b/.test(cleanText)) return 'Spanish';
  if (/\b(le|de|et|à|un|il|être|et|en|avoir|que|pour|dans|ce|son|une|sur|avec|ne|se)\b/.test(cleanText)) return 'French';
  if (/\b(der|die|und|in|den|von|zu|das|mit|sich|des|auf|für|ist|im|dem|nicht|ein|eine)\b/.test(cleanText)) return 'German';
  
  return 'English'; // Default fallback
}

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Translation server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to use the translator`);
});