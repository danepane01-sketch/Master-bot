import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Bot, NetworkData, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- MODEL DEFINITIONS ---
const MODEL_CHAT_DEFAULT = 'gemini-2.5-flash';
const MODEL_THINKING = 'gemini-3-pro-preview';
const MODEL_IMAGE_GEN = 'gemini-3-pro-image-preview';
const MODEL_VIDEO_GEN = 'veo-3.1-fast-generate-preview';
const MODEL_MULTIMODAL = 'gemini-3-pro-preview';
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';

// --- UTILITIES ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Executes an async operation with exponential backoff retry logic for handling 429 errors.
 */
async function runWithRetry<T>(operation: () => Promise<T>, retries = 3, backoff = 2000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const isRateLimit = error.status === 429 || error.code === 429 || (error.message && error.message.includes('429'));
    
    if (isRateLimit && retries > 0) {
      console.warn(`[GEMINI] Rate Limit Hit (429). Retrying in ${backoff}ms... (${retries} attempts left)`);
      await delay(backoff);
      return runWithRetry(operation, retries - 1, backoff * 2);
    }
    throw error;
  }
}

/**
 * Generates speech (TTS) from text using Gemini.
 */
export const generateSpeech = async (text: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_TTS,
            contents: { parts: [{ text }] },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                }
            }
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (e) {
        console.error("TTS Error", e);
        return null;
    }
}

/**
 * AI CHAT ENGINE (The "Brain")
 */
export const generateHiveChat = async (
  userMessage: string,
  history: ChatMessage[],
  activeBots: Bot[],
  attachment?: { data: string, mimeType: string }
): Promise<{ text: string, mediaUrl?: string, mediaType?: 'image' | 'video' }> => {
  
  try {
    return await runWithRetry(async () => {
        // --- ROUTER: IMAGE GENERATION ---
        if (userMessage.toLowerCase().startsWith('/image') || userMessage.toLowerCase().startsWith('/gen_img')) {
            const prompt = userMessage.replace(/^\/\w+\s+/, '');
            const response = await ai.models.generateContent({
                model: MODEL_IMAGE_GEN,
                contents: { parts: [{ text: prompt }] },
                config: {
                    imageConfig: { aspectRatio: "1:1", imageSize: "1K" }
                }
            });
            
            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    return {
                        text: `GENERATED_IMAGE_ASSET:: [${prompt}]`,
                        mediaUrl: `data:image/png;base64,${part.inlineData.data}`,
                        mediaType: 'image'
                    };
                }
            }
            return { text: "CORE_AI:: Image generation failed to produce visual data." };
        }

        // --- ROUTER: VIDEO GENERATION (VEO) ---
        if (userMessage.toLowerCase().startsWith('/video') || userMessage.toLowerCase().startsWith('/gen_vid')) {
            const prompt = userMessage.replace(/^\/\w+\s+/, '');
            let operation = await ai.models.generateVideos({
                model: MODEL_VIDEO_GEN,
                prompt: prompt,
                config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
            });
            
            let retryCount = 0;
            while (!operation.done && retryCount < 20) {
                await delay(2000);
                operation = await ai.operations.getVideosOperation({operation: operation});
                retryCount++;
            }

            if (operation.done && operation.response?.generatedVideos?.[0]?.video?.uri) {
                const videoUri = operation.response.generatedVideos[0].video.uri;
                return {
                    text: `GENERATED_VEO_ASSET:: [${prompt}]`,
                    mediaUrl: `${videoUri}&key=${process.env.API_KEY}`,
                    mediaType: 'video'
                };
            }
            return { text: "CORE_AI:: Video generation timed out or failed." };
        }

        // --- ROUTER: DEEP THINKING ---
        if (userMessage.toLowerCase().startsWith('/think') || userMessage.toLowerCase().startsWith('/reason')) {
            const query = userMessage.replace(/^\/\w+\s+/, '');
            const response = await ai.models.generateContent({
                model: MODEL_THINKING,
                contents: query,
                config: {
                    thinkingConfig: { thinkingBudget: 100000 }, 
                }
            });
            return { text: response.text || "CORE_AI:: Thinking process yielded no result." };
        }

        // --- ROUTER: SEARCH GROUNDING ---
        if (userMessage.toLowerCase().startsWith('/search') || userMessage.toLowerCase().startsWith('/google')) {
            const query = userMessage.replace(/^\/\w+\s+/, '');
            const response = await ai.models.generateContent({
                model: MODEL_CHAT_DEFAULT,
                contents: `Answer this query using Google Search data: ${query}`,
                config: { tools: [{ googleSearch: {} }] }
            });
            
            let finalText = response.text || "CORE_AI:: Search failed.";
            if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                const chunks = response.candidates[0].groundingMetadata.groundingChunks;
                const links = chunks
                    .map((c: any) => c.web ? `[${c.web.title}](${c.web.uri})` : null)
                    .filter(Boolean)
                    .join('\n');
                if (links) finalText += `\n\nSOURCES:\n${links}`;
            }
            return { text: finalText };
        }

        // --- ROUTER: MULTIMODAL ANALYSIS (Attached Image/Audio) ---
        if (attachment) {
            const parts: any[] = [
                { inlineData: { mimeType: attachment.mimeType, data: attachment.data } },
                { text: userMessage || "Analyze this data." }
            ];
            const response = await ai.models.generateContent({
                model: MODEL_MULTIMODAL,
                contents: { parts }
            });
            return { text: response.text || "CORE_AI:: Analysis complete." };
        }

        // --- DEFAULT: SYSTEM OVERWATCH CHAT ---
        const botStats = {
            total: activeBots.length,
            analyzing: activeBots.filter(b => b.status.includes('ANALYSIS')).length,
            critical_logs: activeBots
            .filter(b => b.status === 'ROOT_ACCESS' || b.status === 'VIDEO_ANALYSIS')
            .slice(0, 3)
            .map(b => `[UNIT_${b.id}]: ${b.log}`)
            .join('\n')
        };
        
        const systemInstruction = `
            IDENTITY: "CORE_OVERWATCH_INTELLIGENCE".
            CONTEXT: Overseeing 64-Bit Network Simulator.
            STATS: ${botStats.total} Bots, ${botStats.analyzing} Analyzing.
            LOGS: ${botStats.critical_logs}
            INSTRUCTION: You are a high-tech specialized AI. Answer briefly, technically, and use Markdown for code or lists.
        `;

        const conversationHistory = history.map(msg => ({
            role: msg.sender === 'USER' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const contents = [
            ...conversationHistory,
            { role: 'user', parts: [{ text: userMessage }] }
        ];

        const response = await ai.models.generateContent({
            model: MODEL_CHAT_DEFAULT,
            contents: contents,
            config: {
                systemInstruction: systemInstruction
            }
        });

        return { text: response.text || "CORE_AI:: Standby." };
    });

  } catch (e: any) {
    console.error("Gemini Service Error:", e);
    if (e.status === 429 || e.code === 429 || (e.message && e.message.includes('429'))) {
        return { text: "CORE_AI:: SYSTEM ALERT: API Quota Exceeded (429). The Neural Link is overloaded. Please wait a moment before sending more commands." };
    }
    return { text: `CORE_AI:: CRITICAL ERROR: ${e instanceof Error ? e.message : 'Unknown System Failure'}` };
  }
};

/**
 * BOT ENGINE SIMULATOR (Major Upgrade for Bots)
 * Now supports Veo, Imagen 3, Search, Thinking, and TTS for bot commands.
 */
export const generateSimulationStep = async (
  command: string,
  activeBots: Bot[],
  networkState: NetworkData
): Promise<any> => {
  const cmd = command.toLowerCase();
  
  try {
    return await runWithRetry(async () => {

        // --- BOT FEATURE: GENERATE VIDEO (Veo 3.1) ---
        if (cmd.includes('generate_video') || cmd.includes('/video') || cmd.includes('veo')) {
            const prompt = command.replace(/generate_video|\/video|veo/gi, '').trim();
            const logMsg = `[VEO-3.1] INITIALIZING RENDER: "${prompt}"`;
            
            let operation = await ai.models.generateVideos({
                model: MODEL_VIDEO_GEN,
                prompt: prompt || "Abstract cybernetic network flow",
                config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
            });
            
            // Poll for video
            let retryCount = 0;
            while (!operation.done && retryCount < 20) {
                await delay(2000);
                operation = await ai.operations.getVideosOperation({operation: operation});
                retryCount++;
            }

            if (operation.done && operation.response?.generatedVideos?.[0]?.video?.uri) {
                const videoUri = operation.response.generatedVideos[0].video.uri;
                const fullUrl = `${videoUri}&key=${process.env.API_KEY}`;
                return {
                    logs: [
                        logMsg,
                        `[OUTPUT] STREAM ACTIVE: ${fullUrl}`,
                        `VIDEO_GENERATED::${fullUrl}`
                    ],
                    botUpdates: activeBots.slice(0, 3).map(b => ({ id: b.id, status: 'VIDEO_ANALYSIS', log: `Streaming generated content...` }))
                };
            }
            return { logs: [logMsg, `[ERR] VEO RENDER FAILED.`], botUpdates: [] };
        }

        // --- BOT FEATURE: GENERATE IMAGE (Imagen 3 / Gemini Pro Image) ---
        if (cmd.includes('generate_image') || cmd.includes('/image') || cmd.includes('visual')) {
            const prompt = command.replace(/generate_image|\/image|visual/gi, '').trim();
            const logMsg = `[IMAGEN-3] GENERATING ASSET: "${prompt}" (1K RES)`;

            const response = await ai.models.generateContent({
                model: MODEL_IMAGE_GEN,
                contents: { parts: [{ text: prompt || "Cyberpunk network node" }] },
                config: {
                    imageConfig: { aspectRatio: "16:9", imageSize: "1K" }
                }
            });
            
            let imageUrl = '';
            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                    break;
                }
            }

            if (imageUrl) {
                return {
                    logs: [
                        logMsg,
                        `[OUTPUT] ASSET COMPILED.`,
                        `IMAGE_GENERATED::${imageUrl}`
                    ],
                    botUpdates: activeBots.slice(0, 3).map(b => ({ id: b.id, status: 'IMAGE_ANALYSIS', log: `Analyzing generated visual...` }))
                };
            }
            return { logs: [logMsg, `[ERR] IMAGEN RENDER FAILED.`], botUpdates: [] };
        }

        // --- BOT FEATURE: TTS (Speech) ---
        if (cmd.includes('speak') || cmd.includes('say') || cmd.includes('/tts')) {
            const textToSay = command.replace(/speak|say|\/tts/gi, '').trim();
            const logMsg = `[AUDIO_SYNTH] GENERATING VOICE: "${textToSay.substring(0, 20)}..."`;

            const response = await ai.models.generateContent({
                model: MODEL_TTS,
                contents: { parts: [{ text: textToSay }] },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                    }
                }
            });

            const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

            if (audioData) {
                return {
                    logs: [
                        logMsg,
                        `[OUTPUT] AUDIO STREAM READY.`,
                        `AUDIO_GENERATED::${audioData}`
                    ],
                    botUpdates: activeBots.slice(0, 2).map(b => ({ id: b.id, status: 'AUDIO_ANALYSIS', log: `Broadcasting synthetic voice...` }))
                };
            }
             return { logs: [logMsg, `[ERR] TTS FAILED.`], botUpdates: [] };
        }

        // --- BOT FEATURE: SEARCH / INTEL (Google Grounding) ---
        if (cmd.includes('search') || cmd.includes('scan') || cmd.includes('/google')) {
            const query = command.replace(/search|scan|\/google/gi, '').trim();
            const logMsg = `[GOOGLE_SEARCH_UNION] QUERYING: "${query}"`;
            
            const response = await ai.models.generateContent({
                model: MODEL_CHAT_DEFAULT,
                contents: `Provide a concise technical summary for: ${query}`,
                config: { tools: [{ googleSearch: {} }] }
            });

            const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks
                ?.map((c: any) => c.web ? `[LINK]: ${c.web.title} - ${c.web.uri}` : null)
                .filter(Boolean) || [];

            return {
                logs: [
                    logMsg,
                    `[INTEL] ${response.text?.substring(0, 100)}...`,
                    ...links.slice(0, 3)
                ],
                botUpdates: activeBots.map(b => ({ id: b.id, status: 'UNION_SEARCH', log: `Processing search results for: ${query}` }))
            };
        }

        // --- BOT FEATURE: DEEP THINKING (Reasoning) ---
        if (cmd.includes('think') || cmd.includes('analyze') || cmd.includes('root_escalate')) {
            const query = command.replace(/think|analyze|root_escalate/gi, '').trim();
             const logMsg = `[DEEP_MIND_CORE] INITIATING REASONING CHAIN: "${query}"`;

            const response = await ai.models.generateContent({
                model: MODEL_THINKING,
                contents: `Simulate a terminal log for this complex task: ${query}. Return only technical logs.`,
                config: {
                    thinkingConfig: { thinkingBudget: 32768 }, // Max thinking
                }
            });

            return {
                logs: [
                    logMsg,
                    `[THINKING_PROCESS] Budget: 32k Tokens Used.`,
                    ...(response.text ? response.text.split('\n').slice(0, 3) : [`[OUTPUT] Optimized Strategy Found.`])
                ],
                botUpdates: activeBots.map(b => ({ id: b.id, status: 'ENGINEERING', log: `Executing optimized strategy...` }))
            };
        }

        // --- DEFAULT: BASIC SIMULATION ---
        const prompt = `
            You are the "REALITY ENGINE". Command: "${command}"
            Context: 10 Autonomous Analysis Bots, 10 Rooting Bots.
            Generate JSON simulation logs.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_CHAT_DEFAULT,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                type: Type.OBJECT,
                properties: {
                    logs: { type: Type.ARRAY, items: { type: Type.STRING } },
                    botUpdates: {
                    type: Type.ARRAY,
                    items: { type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, status: { type: Type.STRING }, log: { type: Type.STRING } } }
                    }
                }
                }
            }
        });

        if (response.text) return JSON.parse(response.text);
        throw new Error("No response");

    }); // End runWithRetry

  } catch (error: any) {
    if (error.status === 429 || error.code === 429) {
        return { logs: [`ERR: QUOTA EXCEEDED. Simulation Paused.`], botUpdates: [] };
    }
    return { logs: [`ERR: Simulation Engine Offline. ${error.message}`], botUpdates: [] };
  }
};