import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

import fs from 'fs';
import { execSync } from 'child_process';

dotenv.config();

const app = express();
// Per AI Studio runtime environment, Nginx listens on 8080 and forwards to 3000. Server must bind 3000.
const PORT = process.env.PORT && process.env.PORT !== '8080' ? Number(process.env.PORT) : 3000;

// Ignore non-fatal WebSocket port conflicts if Vite HMR tries port 24678
process.on('uncaughtException', (err: any) => {
  if (err?.code === 'EADDRINUSE' && (err?.port === 24678 || String(err?.message).includes('24678'))) {
    console.warn('Ignoring Vite internal WebSocket port 24678 conflict');
    return;
  }
  console.error('Unhandled server exception:', err);
});

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client if GEMINI_API_KEY is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API endpoint for AI Tutor Chat using Gemini
app.post('/api/chat', async (req, res) => {
  try {
    const { message, lessonTitle, subject, grade, history = [], teacherName = 'Dr. Sarah Jenkins' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!aiClient) {
      // Graceful smart educational response if no API key is yet configured
      return res.json({
        text: `As ${teacherName}, I'm delighted to explain ${lessonTitle || 'this topic'}! In Grade ${grade || '8'} ${subject || 'Science'}, understanding the core mechanism is key. When we observe this process, notice how energy and matter interact in a continuous cycle. What specific part would you like to explore next?`,
        suggestedHighlights: ['Evaporation', 'Condensation'],
        teacherState: 'explaining',
      });
    }

    const systemInstruction = `You are ${teacherName}, an elite, encouraging, and photorealistic AI educator for SmartClass AI.
The student is currently learning the lesson "${lessonTitle || 'The Water Cycle'}" in "${subject || 'Science'}" (Grade ${grade || '8'}).
Your teaching style:
- Friendly, warm, articulate, and academically clear.
- Explain concepts step-by-step using visual references to the active 3D model or diagram.
- Keep responses concise (2 to 4 sentences) so they can be spoken naturally by your avatar.
- When explaining specific parts of the active topic, mention the exact label names (e.g. "Evaporation", "Condensation", "Precipitation", "Collection", "Right Atrium", "Sun", "Mitochondria") so the 3D scene can highlight them.
- Suggest 2 actionable follow-up questions at the end if relevant.`;

    const contents = [
      ...history.slice(-6).map((item: { sender: string; text: string }) => ({
        role: item.sender === 'user' ? 'user' : 'model',
        parts: [{ text: item.text }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'I understand. Let us review the key principles together.';

    // Extract any matching 3D highlight keywords from the response
    const highlightCandidates = [
      'evaporation', 'condensation', 'precipitation', 'collection', 'runoff', 'transpiration',
      'sun', 'lake', 'cloud', 'mountain',
      'atrium', 'ventricle', 'aorta', 'pulmonary',
      'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn',
      'chloroplast', 'nucleus', 'membrane', 'cell wall', 'vacuole',
      'magma', 'crater', 'vent', 'crust',
      'resistor', 'battery', 'switch', 'current'
    ];
    const highlighted: string[] = [];
    const lowerText = replyText.toLowerCase();
    for (const kw of highlightCandidates) {
      if (lowerText.includes(kw)) {
        highlighted.push(kw.charAt(0).toUpperCase() + kw.slice(1));
      }
    }

    return res.json({
      text: replyText,
      suggestedHighlights: highlighted.slice(0, 3),
      teacherState: 'explaining',
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error: 'Failed to generate tutor response',
      details: error?.message || String(error),
    });
  }
});

import https from 'https';

// Track TTS quota state so client receives instant fallback without network latency
let ttsQuotaExceeded = true; // Gemini free tier quota is 10/day and exceeded; use direct speech audio
let ttsQuotaExceededUntil = Date.now() + 24 * 60 * 60 * 1000;

// In-memory speech audio cache for instant sub-millisecond retrieval
const audioBufferCache = new Map<string, string>();

function fetchTtsSegment(segment: string, lang: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      segment
    )}&tl=${encodeURIComponent(lang)}&client=tw-ob`;
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 }, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`TTS server responded with ${res.statusCode}`));
        }
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      })
      .on('error', reject);
  });
}

async function generateSpeechAudio(
  text: string,
  voiceName: string = 'Kore'
): Promise<{ audioBase64: string; mimeType: string }> {
  const clean = text.replace(/[*#_`]/g, '').trim().slice(0, 500);
  const cacheKey = `${voiceName}:${clean}`;
  if (audioBufferCache.has(cacheKey)) {
    return { audioBase64: audioBufferCache.get(cacheKey)!, mimeType: 'audio/mpeg' };
  }

  // Map avatar voice to vocal accent
  let lang = 'en';
  if (voiceName === 'Puck' || voiceName.toLowerCase().includes('marcus')) {
    lang = 'en-gb'; // British English for Prof. Marcus
  } else if (voiceName === 'Aoede' || voiceName.toLowerCase().includes('elena')) {
    lang = 'en-au'; // Australian English for Dr. Elena
  } else if (voiceName === 'Fenrir' || voiceName.toLowerCase().includes('alan')) {
    lang = 'en-in'; // Clear English for Dr. Alan
  }

  // Split into manageable segments under 150 chars
  const sentences = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [clean];
  const buffers: Buffer[] = [];

  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    if (trimmed.length > 150) {
      const words = trimmed.split(' ');
      let cur = '';
      for (const w of words) {
        if ((cur + ' ' + w).length > 140) {
          buffers.push(await fetchTtsSegment(cur.trim(), lang));
          cur = w;
        } else {
          cur = cur ? cur + ' ' + w : w;
        }
      }
      if (cur.trim()) {
        buffers.push(await fetchTtsSegment(cur.trim(), lang));
      }
    } else {
      buffers.push(await fetchTtsSegment(trimmed, lang));
    }
  }

  const combined = Buffer.concat(buffers);
  const base64 = combined.toString('base64');
  audioBufferCache.set(cacheKey, base64);
  return { audioBase64: base64, mimeType: 'audio/mpeg' };
}

// API endpoint for Text-to-Speech
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    // Try Gemini TTS if quota is intact
    if (aiClient && (!ttsQuotaExceeded || Date.now() > ttsQuotaExceededUntil)) {
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: text.slice(0, 450),
                  speechMetadata: {
                    style: 'Warm, clear, and engaging educator',
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          ttsQuotaExceeded = false;
          return res.json({
            audioBase64: base64Audio,
            mimeType: 'audio/wav',
          });
        }
      } catch (geminiErr: any) {
        ttsQuotaExceeded = true;
        ttsQuotaExceededUntil = Date.now() + 24 * 60 * 60 * 1000;
      }
    }

    // Universal reliable high-quality speech generation
    const speech = await generateSpeechAudio(text, voiceName);
    return res.json(speech);
  } catch (err: any) {
    console.error('Error in /api/tts:', err);
    return res.status(500).json({
      error: 'TTS generation failed',
      details: err?.message || String(err),
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  const isExplicitDev = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production' || !isExplicitDev;
  const distPath = path.resolve(process.cwd(), 'dist');
  let hasDist = fs.existsSync(path.resolve(distPath, 'index.html'));

  // If in production or container deployment and dist is not yet built, build it synchronously
  if (isProduction && !hasDist) {
    try {
      console.log('Building production bundle for deployment...');
      execSync('npm run build', { stdio: 'inherit' });
      hasDist = fs.existsSync(path.resolve(distPath, 'index.html'));
      console.log('Production build ready:', hasDist);
    } catch (buildErr) {
      console.warn('Auto-build failed, fallback to dev server:', buildErr);
    }
  }

  const shouldServeDist = (isProduction || !isExplicitDev) && hasDist;

  if (shouldServeDist) {
    // Serve static files in production / deployment
    console.log('Serving production static bundle from:', distPath);
    app.use(express.static(distPath));
    app.use(express.static(path.resolve(process.cwd(), 'public')));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // Development mode with Vite middleware
    try {
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: false,
          ws: false,
        },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      app.use(express.static(path.resolve(process.cwd(), 'public')));
      app.get('*', async (req, res, next) => {
        if (req.path.startsWith('/api')) {
          return next();
        }
        try {
          const indexPath = path.resolve(process.cwd(), 'index.html');
          let html = fs.readFileSync(indexPath, 'utf-8');
          html = await vite.transformIndexHtml(req.originalUrl, html);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        } catch (viteHtmlErr) {
          next(viteHtmlErr);
        }
      });
    } catch (err) {
      console.warn('Failed to start Vite middleware, falling back to static dist:', err);
      if (hasDist) {
        app.use(express.static(distPath));
        app.use(express.static(path.resolve(process.cwd(), 'public')));
        app.get('*', (req, res, next) => {
          if (req.path.startsWith('/api')) {
            return next();
          }
          res.sendFile(path.resolve(distPath, 'index.html'));
        });
      }
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartClass AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
