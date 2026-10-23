import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Body parsers with increased limits for image payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to initialize Gemini SDK safely
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }
  return new GoogleGenAI({ apiKey });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString(),
  });
});

// Animate Image to Video endpoint using Gemini Interactions API (gemini-omni-1.1-flash)
app.post('/api/generate-video', async (req, res) => {
  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      prompt,
      aspectRatio = '16:9',
      duration = '5s',
    } = req.body;

    let rawBase64 = imageBase64;
    let actualMime = mimeType || 'image/jpeg';

    if (!rawBase64 && req.body.imagePath) {
      const cleanPath = req.body.imagePath.replace(/^\//, '');
      const localFilePath = path.join(__dirname, 'public', cleanPath);
      if (fs.existsSync(localFilePath)) {
        rawBase64 = fs.readFileSync(localFilePath).toString('base64');
        actualMime = cleanPath.endsWith('.png') ? 'image/png' : 'image/jpeg';
      }
    }

    if (!rawBase64 || !prompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: imageBase64 (or valid imagePath) and prompt are required.',
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY is not configured in the server environment.',
      });
    }

    // Clean base64 string if data URL prefix was sent
    const cleanBase64 = rawBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    const validAspectRatio = aspectRatio === '9:16' ? '9:16' : '16:9';
    const validDuration = duration === '10s' ? '10s' : '5s';

    const ai = getGeminiClient();

    // Call Gemini Interactions API with gemini-omni-1.1-flash as required
    const interaction = await ai.interactions.create(
      {
        model: 'gemini-omni-1.1-flash',
        input: [
          {
            type: 'image',
            mime_type: mimeType,
            data: cleanBase64,
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
        background: false,
        store: false,
        stream: false,
        response_format: {
          type: 'video',
          aspect_ratio: validAspectRatio,
          duration: validDuration,
        },
      },
      { timeout: 300000 } // 5 minutes timeout for video synthesis
    );

    const videoPart = interaction.output_video;

    if (!videoPart || (!videoPart.data && !videoPart.uri)) {
      // Check if there was text output or failure reason in steps
      let stepMessage = '';
      if (interaction.steps) {
        for (const step of interaction.steps) {
          if (step.type === 'model_output' && (step as any).content) {
            const textContent = (step as any).content.find((c: any) => c.type === 'text');
            if (textContent && typeof (textContent as any).text === 'string') {
              stepMessage += (textContent as any).text + ' ';
            }
          }
        }
      }
      return res.status(502).json({
        success: false,
        error: stepMessage || 'The video model did not return video data. Please try adjusting your prompt.',
      });
    }

    return res.json({
      success: true,
      videoBase64: videoPart.data || null,
      videoUri: videoPart.uri || null,
      mimeType: videoPart.mime_type || 'video/mp4',
      aspectRatio: validAspectRatio,
      duration: validDuration,
    });
  } catch (error: any) {
    console.error('Error generating video with gemini-omni-1.1-flash:', error);
    const isRateLimit = error?.status === 429 || 
      error?.message?.includes('Rate limit exceeded') || 
      error?.message?.includes('Free Tier') ||
      error?.message?.includes('too_many_requests');

    return res.status(isRateLimit ? 429 : 500).json({
      success: false,
      isRateLimit,
      requiresPaidTier: isRateLimit,
      error: isRateLimit 
        ? 'Rate limit exceeded for model gemini-omni-1.1-flash (limit: 0 requests per day on Free Tier). This model requires a Paid Tier API key in Google AI Studio.'
        : (error?.message || 'Failed to generate video with Gemini Omni Flash.'),
      details: error?.status || error?.code,
    });
  }
});

// 4K Photorealistic Iron Warrior Portrait Generation with Imagen
app.post('/api/generate-portrait', async (req, res) => {
  try {
    const { prompt, aspectRatio = '3:4' } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, error: 'GEMINI_API_KEY is not configured.' });
    }

    const ai = getGeminiClient();

    // Map aspect ratio for Imagen (1:1, 3:4, 4:3, 9:16, 16:9)
    const validAspectRatio = ['1:1', '3:4', '4:3', '9:16', '16:9'].includes(aspectRatio)
      ? aspectRatio
      : '3:4';

    // 1. Try Imagen 3 (imagen-3.0-generate-002)
    try {
      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: validAspectRatio as any,
          outputMimeType: 'image/jpeg',
        },
      });

      const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
      if (imageBytes) {
        return res.json({
          success: true,
          imageBase64: imageBytes,
          mimeType: 'image/jpeg',
          modelUsed: 'imagen-3.0-generate-002',
          aspectRatio: validAspectRatio,
        });
      }
    } catch (imagenErr: any) {
      console.warn('Imagen 3 attempt fallback notice:', imagenErr?.message);
    }

    // 2. Fallback to Gemini Image Generation (gemini-3.1-flash-lite-image)
    try {
      const interaction = await ai.interactions.create({
        model: 'gemini-3.1-flash-lite-image',
        input: prompt,
        response_modalities: ['image', 'text'],
        generation_config: {
          image_config: {
            aspect_ratio: validAspectRatio,
          },
        },
      });

      if (interaction.steps) {
        for (const step of interaction.steps) {
          if (step.type === 'model_output' && (step as any).content) {
            const imageContent = (step as any).content.find((c: any) => c.type === 'image');
            if (imageContent && imageContent.data) {
              return res.json({
                success: true,
                imageBase64: imageContent.data,
                mimeType: imageContent.mime_type || 'image/jpeg',
                modelUsed: 'gemini-3.1-flash-lite-image',
                aspectRatio: validAspectRatio,
              });
            }
          }
        }
      }
    } catch (geminiImgErr: any) {
      console.error('Gemini image fallback error:', geminiImgErr);
      throw new Error(geminiImgErr?.message || 'Failed to generate image with Imagen/Gemini.');
    }

    return res.status(502).json({
      success: false,
      error: 'The image generation model did not return image data.',
    });
  } catch (error: any) {
    console.error('Error generating 4K portrait:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate 4K photorealistic portrait with Imagen.',
    });
  }
});

// Cinematic Text-To-Speech endpoint using Gemini TTS
app.post('/api/generate-speech', async (req, res) => {
  try {
    const { text, voice = 'Fenrir', style = 'Deep cinematic movie trailer voice' } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, error: 'GEMINI_API_KEY is not configured.' });
    }

    const ai = getGeminiClient();

    const interaction = await ai.interactions.create({
      model: 'gemini-3.8-flash-lite-tts',
      input: [
        {
          type: 'text',
          text,
          annotations: [
            {
              type: 'speech_metadata',
              style,
            },
          ],
        },
      ],
      response_format: { type: 'audio' },
      generation_config: {
        speech_config: [
          {
            language: 'en-US',
            voice, // 'Fenrir', 'Puck', 'Charon', 'Kore', 'Zephyr'
          },
        ],
      },
    });

    const audio = interaction.output_audio;
    if (audio?.data) {
      return res.json({
        success: true,
        audioBase64: audio.data,
        mimeType: audio.mime_type || 'audio/wav',
      });
    }

    return res.status(502).json({ success: false, error: 'No audio returned from Gemini TTS.' });
  } catch (error: any) {
    console.warn('Speech generation notice:', error?.message);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate speech.',
    });
  }
});

// Story script expansion / Director commentary generator using gemini-3.8-flash
app.post('/api/generate-lore', async (req, res) => {
  try {
    const { sceneNumber, characterState } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, error: 'GEMINI_API_KEY is not configured.' });
    }
    const ai = getGeminiClient();
    const interaction = await ai.interactions.create({
      model: 'gemini-3.8-flash',
      input: `You are the chief cinematic director of Marvel-style superhero sci-fi movies. 
Provide a short 3-sentence director's visual VFX cue, technical camera rigging notes, and dramatic lore for:
Scene ${sceneNumber}: "${characterState}" in the 30-second saga 'RISE OF THE IRON WARRIOR'.
Keep it punchy, hyper-cinematic, with lighting and sound notes.`,
    });

    return res.json({
      success: true,
      text: interaction.output_text || '',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
