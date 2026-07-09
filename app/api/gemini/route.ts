import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Initialize Gemini client with proper User-Agent telemetry lazy loader
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    if (action === "synthesize") {
      const { textInput, existingStructure } = payload;
      
      const prompt = `You are the AI Intelligence Architect for the AI Strategic Intelligence Vault. 
Analyze the following raw input text (which could be a news story, a trend, an idea, or an observation):
"${textInput}"

Synthesize this input into a structured strategic intelligence report. 
Decide which of the standard Obsidian folders this belongs to:
- "00_Inbox" (raw and unrefined quick captures/ideas/links)
- "01_Projects" (active files on plans and execution)
- "02_Research" (long-term intelligence, trends, markets)
- "03_AI" (prompts, models, experiments)
- "04_Content" (creative ideas, drafts, scripts)
- "05_Finance" (monetization, strategy)
- "06_Learning" (courses, coding, skill acquisition)
- "07_Archive" (inactive items)
- "99_System" (dashboards, templates, configurations)

Additionally, map it to one of the 7 Core Patterns:
1. Automation Replaces Repetition
2. AI Compresses Time
3. Information Becomes Infrastructure
4. Systems Scale Better Than Manual Effort
5. Leverage Multiplies Output
6. Clarity Creates Momentum
7. Adaptation Compounds Advantage

And map it to one of the 8 Key Signals:
1. AI Customer Service Expansion
2. Enterprise Copilot Adoption
3. GPU & Infrastructure Investment
4. Open-Source LLM Competition
5. AI Automation Platforms Scale
6. AI Agent Frameworks Growth
7. Enterprise AI Budget Expansion
8. Regulation & Governance Increase

Provide a proposed filename (lowercase, underscores, with .md extension), a markdown body that matches Obsidian formatting with beautiful headings and bullet points, and connection strength (either "Strong", "Emerging", or "Weak").`;

      const response = await getAiClient().models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              folder: {
                type: Type.STRING,
                description: "The suggested folder from the defined list.",
              },
              filename: {
                type: Type.STRING,
                description: "E.g., startup_observations.md or meta_agent_frameworks.md",
              },
              title: {
                type: Type.STRING,
                description: "Clean title of the report.",
              },
              markdownContent: {
                type: Type.STRING,
                description: "Full markdown file content, formatted elegantly.",
              },
              associatedPattern: {
                type: Type.STRING,
                description: "The name of the closest Core Pattern matching the 7 list.",
              },
              associatedSignal: {
                type: Type.STRING,
                description: "The name of the closest Key Signal matching the 8 list.",
              },
              connectionStrength: {
                type: Type.STRING,
                description: "Strength of the connection: Strong, Emerging, Weak",
              },
              strategicSummary: {
                type: Type.STRING,
                description: "1-2 sentence executive summary of the insight.",
              },
              impactLevel: {
                type: Type.STRING,
                description: "The impact level: High Impact, Medium Impact, Low Impact",
              },
            },
            required: [
              "folder",
              "filename",
              "title",
              "markdownContent",
              "associatedPattern",
              "associatedSignal",
              "connectionStrength",
              "strategicSummary",
              "impactLevel",
            ],
          },
        },
      });

      const responseText = response.text || "{}";
      return NextResponse.json(JSON.parse(responseText));
    }

    if (action === "generate_future_impact") {
      const { patternTitle, patternDesc, signalTitle, signalDesc, connectionStrength, noteHistory } = payload;

      const prompt = `You are a Senior Strategic Futurist and Scenario Planner for the Strategic Intelligence Vault.
Analyze the strategic convergence of the following Node connection:

CORE PATTERN:
Title: ${patternTitle}
Details/Implications: ${patternDesc}

KEY SIGNAL:
Title: ${signalTitle}
Description: ${signalDesc}

CONNECTION STATUS:
Strength: ${connectionStrength}
Analyst's Structural Notes: "${noteHistory || "No notes captured yet."}"

Based on this connection's strength and note history, synthesize a 'Future Impact Scenario' projecting its consequences over a 3-year to 5-year macro horizon.

Requirements:
- scenarioTitle: Create a highly technical and descriptive strategic title (e.g., "The Decoupling of Local Latency: Autonomous Edge Agent Hegemony").
- scenarioText: Write a detailed macro scenario in markdown format. Use bullet points and elegant headings. Focus on the compound ripple effects: who wins, who is disrupted, and how this convergence reshapes market landscapes. Ensure it incorporates the analyst's structural note trends. Do not use generic placeholders.
- strategicTakeaway: Compile a single, highly actionable strategic advice/recommendation.
- probabilityScore: Estimate a logical probability percentage (e.g., "85%") based on the synergy matching. Stronger connection strength and mature notes should correspond to higher probability scores (e.g., 70-95%), whereas weak connections with obscure notes represent black-swans or wild-cards (e.g., 15-40%).`;

      const response = await getAiClient().models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scenarioTitle: {
                type: Type.STRING,
                description: "Visually striking title of the projected scenario.",
              },
              scenarioText: {
                type: Type.STRING,
                description: "Detailed, immersive markdown-formatted scenario narrative.",
              },
              strategicTakeaway: {
                type: Type.STRING,
                description: "Actionable executive guidance point.",
              },
              probabilityScore: {
                type: Type.STRING,
                description: "Socio-economic probability score, e.g., '75%'",
              },
            },
            required: [
              "scenarioTitle",
              "scenarioText",
              "strategicTakeaway",
              "probabilityScore",
            ],
          },
        },
      });

      const responseText = response.text || "{}";
      return NextResponse.json(JSON.parse(responseText));
    }

    if (action === "chat") {
      const { message, chatHistory, vaultFiles } = payload;

      // Build context from files
      const filesContext = vaultFiles
        .map((f: { path: string; content: string }) => `[File: ${f.path}]\n${f.content}`)
        .join("\n\n---\n\n");

      const systemInstruction = `You are "Sage", the strategic advisor and AI guide for the user's AI Strategic Intelligence Vault. 
Your tone is deeply analytical, concise, professional, and slightly futuristic but highly practical.
You are helping the user manage their knowledge network, expand their research, make hard strategic decisions (decisions.md), and achieve cognitive relief and clarity in the Breathing Space (breathing_space.md).

Here is the current state of the user's Obsidian Strategic Vault files:
${filesContext}

Refer explicitly to existing files and connections where appropriate. Answer their queries directly and objectively, providing strong structural framework advice. Do not output internal folder structure lists unless asked. Focus on the strategic value layers: What saves time, what creates leverage, and how patterns link with signals.`;

      // Structure chat messages appropriately
      const contents = [
        ...chatHistory.map((h: { sender: string; text: string }) => ({
          role: h.sender === "user" ? "user" : "model",
          parts: [{ text: h.text }],
        })),
        { role: "user", parts: [{ text: message }] },
      ];

      const response = await getAiClient().models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        },
      });

      return NextResponse.json({ text: response.text });
    }

    return NextResponse.json({ error: "Unsupported Action" }, { status: 400 });
  } catch (error: any) {
    console.error("Gemini Route Error:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
