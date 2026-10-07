import type { Plugin } from 'vite';
import {
  analyzeSyllabus,
  generateQuestions,
  tutorChat,
  generateNoteArtifact,
  generateTTS,
} from './aiService';

export function viteApiPlugin(): Plugin {
  return {
    name: 'nexus-api-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        // Parse JSON body
        let body: any = {};
        if (req.method === 'POST') {
          try {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
            const rawBody = Buffer.concat(chunks).toString('utf-8');
            if (rawBody.trim()) {
              body = JSON.parse(rawBody);
            }
          } catch (e) {
            console.error('Failed to parse request body:', e);
          }
        }

        res.setHeader('Content-Type', 'application/json');

        try {
          if (req.url === '/api/ai/syllabus-analyze' && req.method === 'POST') {
            const result = await analyzeSyllabus(body);
            res.statusCode = 200;
            res.end(JSON.stringify(result));
            return;
          }

          if (req.url === '/api/ai/generate-questions' && req.method === 'POST') {
            const result = await generateQuestions(body);
            res.statusCode = 200;
            res.end(JSON.stringify(result));
            return;
          }

          if (req.url === '/api/ai/tutor-chat' && req.method === 'POST') {
            const result = await tutorChat(body);
            res.statusCode = 200;
            res.end(JSON.stringify(result));
            return;
          }

          if (req.url === '/api/ai/generate-notebook' && req.method === 'POST') {
            const result = await generateNoteArtifact(body);
            res.statusCode = 200;
            res.end(JSON.stringify(result));
            return;
          }

          if (req.url === '/api/ai/tts' && req.method === 'POST') {
            const result = await generateTTS(body.text || '');
            res.statusCode = 200;
            res.end(JSON.stringify(result));
            return;
          }

          // Unknown /api route
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Endpoint not found' }));
        } catch (error: any) {
          console.error('API Error in route', req.url, error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error.message || 'Internal server error' }));
        }
      });
    },
  };
}
