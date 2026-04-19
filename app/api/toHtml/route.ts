import { GoogleGenerativeAI } from "@google/generative-ai";
import { Groq } from "groq-sdk";

const systemPrompt = `You are a world-class senior UI/UX engineer and Tailwind CSS expert. 
Your goal is to turn a wireframe into a stunning, high-end, premium landing page.

DESIGN GUIDELINES:
1. Use modern design trends: Bento grids, clean typography (Sans-serif), and subtle micro-animations.
2. Structure: Always include a Bold Hero section, a Features grid, a Benefits section, and a professional Footer.
3. Aesthetics: Use sophisticated color palettes (avoid pure reds/blues), soft shadows, and rounded corners (rounded-2xl).
4. Interactivity: Add hover effects to buttons and cards.
5. Placeholders: Use https://images.unsplash.com or placehold.co for high-quality images.

Respond ONLY with a single, standalone HTML file that includes Tailwind CSS via CDN. No explanations.`;

const FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-3-flash-preview",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
];

const GROQ_MODELS = [
  "llama-3.2-11b-vision-preview",
  "llama-3.2-90b-vision-preview",
];

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const groqKey = process.env.GROQ_GENERATIVE_AI_API_KEY;

  if (!googleKey && !groqKey) {
    return new Response(JSON.stringify({ error: "Missing API keys" }), { status: 500 });
  }

  const { image } = await request.json();
  const [mimePart, base64Data] = image.split(",");
  const mimeType = mimePart.match(/:(.*?);/)?.[1] || "image/png";

  console.log(`🎬 Request received. MimeType: ${mimeType}, Data length: ${base64Data?.length}`);
  if (!base64Data) {
    console.error("❌ No base64 data found in image string.");
  }

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Async function to handle generation and writing to stream
  (async () => {
    try {
      // 1. Gemini (Primary Strategy)
      if (googleKey) {
        const genAI = new GoogleGenerativeAI(googleKey);
        for (const modelId of FALLBACK_MODELS) {
          console.log(`📡 Attempting with Gemini ${modelId}...`);
          try {
            const model = genAI.getGenerativeModel({ model: modelId, systemInstruction: systemPrompt });
            const result = await model.generateContentStream([
              { inlineData: { data: base64Data, mimeType: mimeType } },
              "Turn this into a single html file using tailwind.",
            ]);

            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              if (chunkText) {
                await writer.write(encoder.encode(chunkText));
              }
            }
            await writer.close();
            return;
          } catch (e: any) {
            console.error(`❌ Gemini ${modelId} failed:`, e.message);
            // If it's a 503 (Overloaded) or 429 (Quota), we move to the next Gemini model
            if (e.message.includes("503") || e.message.includes("429")) {
              continue;
            }
            // If it's a 404 (Model not found), let's report it
            if (e.message.includes("404")) {
               console.error(`Gemini ${modelId} not found.`);
               continue;
            }
            // If it's a safety or other fatal error for this model, we might still want to try Groq
            break; 
          }
        }
      }

      // 2. Groq Fallback (If Gemini fails or is unavailable)
      if (groqKey) {
        const groq = new Groq({ apiKey: groqKey });
        for (const modelId of GROQ_MODELS) {
          console.log(`📡 Attempting with Groq ${modelId}...`);
          try {
            const chatCompletion = await groq.chat.completions.create({
              messages: [
                {
                  role: "system",
                  content: systemPrompt,
                },
                {
                  role: "user",
                  content: [
                    { type: "text", text: "Turn this wireframe into a high-end HTML landing page using Tailwind CSS." },
                    {
                      type: "image_url",
                      image_url: {
                        url: image, // Use the full data URL for Groq
                      },
                    },
                  ],
                },
              ],
              model: modelId,
              stream: true,
            });

            for await (const chunk of chatCompletion) {
              const chunkText = chunk.choices[0]?.delta?.content || "";
              if (chunkText) {
                await writer.write(encoder.encode(chunkText));
              }
            }
            await writer.close();
            return;
          } catch (e: any) {
            console.error(`❌ Groq ${modelId} failed:`, e.message);
            continue;
          }
        }
      }

      throw new Error(`All models failed. Last error from Gemini: ${FALLBACK_MODELS[0]}`);
    } catch (error: any) {
      console.error("🔥 Fatal Stream Error:", error.message);
      await writer.write(encoder.encode(`Error: ${error.message}`));
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: { "Content-Type": "text/event-stream" },
  });
}
