"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const zod_1 = require("zod");
const app = (0, express_1.default)();
const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '1mb' }));
const ChatRequestSchema = zod_1.z.object({
    prompt: zod_1.z.string().min(1).max(8000).optional(),
    messages: zod_1.z
        .array(zod_1.z.object({
        role: zod_1.z.enum(['user', 'assistant', 'system']),
        content: zod_1.z.string(),
    }))
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
    const chunks = [
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
//# sourceMappingURL=index.js.map