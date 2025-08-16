import express from 'express';
import cors from 'cors';
import { z } from 'zod';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const ChatRequestSchema = z.object({
	prompt: z.string().min(1).max(8000).optional(),
	messages: z
		.array(
			z.object({
				role: z.enum(['user', 'assistant', 'system']),
				content: z.string(),
			})
		)
		.optional(),
});

app.get('/api/health', (_req, res) => {
	res.json({ status: 'ok' });
});

app.post('/api/chat', async (req, res) => {
	const parse = ChatRequestSchema.safeParse(req.body);
	if (!parse.success) {
		res.status(400).json({ error: 'Invalid body', issues: parse.error.issues });
		return;
	}

	// Disable default response buffering to allow streaming
	res.setHeader('Content-Type', 'text/plain; charset=utf-8');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('X-Content-Type-Options', 'nosniff');

	// Simple simulated AI streaming response using markdown
	// In real usage, you would call your AI provider here and stream their chunks
	const prompt = parse.data.prompt ?? parse.data?.messages?.slice(-1)?.[0]?.content ?? '';

	const chunks: string[] = [
		`# Streaming response\n\n`,
		`You asked for: \`${prompt.replace(/`/g, '\\`')}\`\n\n`,
		`Here is some markdown with code and a list.\n\n`,
		`- Item 1\n- Item 2\n- Item 3\n\n`,
		`And a code block (TypeScript):\n\n`,
		'```ts\n',
		"type Message = { role: 'user' | 'assistant'; content: string }\n",
		'async function* stream() {\n',
		"  yield 'Hello';\n",
		'}\n',
		'```\n\n',
		`Thanks for trying the streaming demo!\n`,
	];

	// Write chunks with small delays to simulate token streaming
	for (const piece of chunks) {
		res.write(piece);
		await new Promise((r) => setTimeout(r, 200));
	}

	res.end();
});

app.listen(PORT, () => {
	console.log(`[server] listening on http://localhost:${PORT}`);
});