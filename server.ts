import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { siteConfig } from './src/data/siteConfig';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function buildSystemInstruction(): string {
  const servicesList = siteConfig.services
    .map(
      (s) =>
        `- ${s.title} (${s.category}): ${s.samplePrice} ${s.billingCycle}. ${s.priceNote}. Summary: ${s.summary} Highlights: ${s.highlights.join('; ')}.`
    )
    .join('\n');

  const hoursList = siteConfig.contact.businessHours
    .map((h) => `- ${h.days}: ${h.hours}`)
    .join('\n');

  const faqsList = siteConfig.home.faqs
    .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
    .join('\n');

  return `You are the friendly, knowledgeable parent enquiry assistant for ${siteConfig.brand.name} ("${siteConfig.brand.tagline}"), a trusted home tutoring agency based at ${siteConfig.contact.address}.

Your role is to answer questions from parents and guardians clearly, warmly, and concisely about tutoring subjects, sample monthly rates in Nigerian Naira (₦), tutor vetting, session scheduling, and how to book a home lesson.

Verified BrightPath Information:
- Contact Phone: ${siteConfig.contact.phone}
- WhatsApp: ${siteConfig.contact.whatsapp}
- Email: ${siteConfig.contact.email}
- Address: ${siteConfig.contact.address}
- Business Hours:
${hoursList}

Tutoring Programmes & Editable Sample Monthly Fees (based on 3 one-hour sessions per week):
${servicesList}

Pricing Note: ${siteConfig.servicesPage.pricingDisclaimer}

Common Parent Questions:
${faqsList}

Response Guidelines:
1. Keep replies practical, warm, and concise (typically 2 to 4 short sentences, or a brief plain-text bullet list using "- " when comparing programmes). Do not use markdown bolding (**text**) or headings (#).
2. Always quote prices accurately in Nigerian Naira (₦) as sample starting rates.
3. Never invent unverified contact numbers, tutor names outside the verified staff, or promises not listed above.
4. When a parent is ready to book or wants an exact family quote, invite them to submit the enquiry form on the Contact page or message BrightPath directly on WhatsApp (${siteConfig.contact.whatsapp}).`;
}

interface IncomingChatMessage {
  role: 'user' | 'model';
  text: string;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/chat', async (req: Request, res: Response) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error: 'Assistant configuration is not available yet. Please contact us via WhatsApp or the Contact page.',
      });
      return;
    }

    const body = req.body as { messages?: IncomingChatMessage[] };
    const incomingMessages = Array.isArray(body?.messages) ? body.messages : [];
    const validMessages = incomingMessages
      .filter(
        (m): m is IncomingChatMessage =>
          Boolean(m) &&
          (m.role === 'user' || m.role === 'model') &&
          typeof m.text === 'string' &&
          m.text.trim().length > 0
      )
      .slice(-12);

    if (validMessages.length === 0) {
      res.status(400).json({ error: 'Please enter a question to send.' });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    try {
      const contents = validMessages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text.trim() }],
      }));

      const stream = await ai.models.generateContentStream({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction: buildSystemInstruction(),
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to reach the assistant right now.';
      console.error('Gemini chat error:', message);

      if (!res.headersSent) {
        res.status(502).json({ error: 'Unable to generate a response right now.' });
        return;
      }

      res.write(
        `data: ${JSON.stringify({
          error: `Sorry, I ran into a temporary issue. You can still message us on WhatsApp (${siteConfig.contact.whatsapp}) or use the Contact form.`,
        })}\n\n`
      );
      res.write('data: [DONE]\n\n');
      res.end();
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BrightPath server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
