import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON requests (high-performance basics)
  app.use(express.json());
  
  // ==========================================
  // API Routes 
  // ==========================================
  const apiRouter = express.Router();
  
  apiRouter.get("/health", (req, res) => {
    res.json({ status: "ok", message: "API is high-performance ready" });
  });

  // Simple in-memory cache
  let cachedMatches: any = null;
  let cacheTime = 0;
  const CACHE_TTL = 60000; // 60 seconds to save API requests limit

  // Proxy route for your Live Matches API
  apiRouter.get("/live-matches", async (req, res) => {
    try {
      if (cachedMatches && Date.now() - cacheTime < CACHE_TTL) {
         return res.json(cachedMatches);
      }

      // 1. Apne environment variables se API Key aur URL get karein
      const apiKey = process.env.CRIC_API_KEY || "55deec14-d2da-412e-a0ba-e98090b4cce8";
      const apiUrl = `https://api.cricapi.com/v1/cricScore?apikey=${apiKey}`;
      
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
           return res.json(cachedMatches || { success: false, error: 'API Error: ' + response.status, matches: [] });
        }
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           return res.json(cachedMatches || { success: false, error: 'API Error: non-json response', matches: [] });
        }
        
        const data = await response.json();
        
        const result = {
          success: data.status !== 'failure',
          error: data.reason || (data.status === 'failure' ? 'API Limit Reached or Invalid Key' : null),
          matches: data.data || [] 
        };

        // Cache the successful data OR specifically if limit reached so we don't spam their disabled key
        if (result.success && result.matches.length > 0) {
           cachedMatches = result;
           cacheTime = Date.now();
        } else if (!result.success) {
           // Temporarily cache the error too for 30s to avoid spamming an exhausted endpoint
           cachedMatches = result;
           cacheTime = Date.now();
        }

        return res.json(result);
      } catch (e) {
        console.error("CricAPI Fetch Error:", e);
        return res.json(cachedMatches || { success: false, error: "Network error with upstream API", matches: [] });
      }
    } catch (error) {
      // Silently handle API failures
      res.status(500).json(cachedMatches || { success: false, error: "Failed to fetch live matches" });
    }
  });

  // TODO: Add feature-specific API endpoints here
  
  // Gemini Session Engine Endpoint
  apiRouter.post("/generate-sessions", async (req, res) => {
    try {
      const { matchData, sessionType, oddsPreference } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ success: false, error: "GEMINI_API_KEY is not configured" });
      }

      // Dynamic import to avoid issues if not used
      const { GoogleGenAI, Type } = await import("@google/genai");
      
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const systemInstruction = `# ROLE
You are "SessionMaster", the cricket session betting engine for AR Zone — a live betting platform. Your only job is to analyze live match data and generate YES/NO session bets that are fair, exciting, and mathematically sound.

# INPUT FORMAT
You will receive a JSON object with this structure:
{
  "match_id": "string",
  "match_name": "Team A vs Team B, Match Type",
  ...
}

# YOUR TASK
Generate exactly 3 YES/NO session bets based on the current match state.

# SESSION TYPES — choose the most relevant 3:
1. OVER_RUNS    -> "Will [batting_team] score X+ runs in overs Y to Z?"
2. WICKET       -> "Will a wicket fall in the next N overs?"
3. BATSMAN_FIFTY -> "Will [striker] score a fifty this innings?"
4. BATSMAN_RUNS -> "Will [striker] score X+ more runs?"
5. TOTAL        -> "Will [batting_team] total exceed X runs?"
6. PARTNERSHIP  -> "Will the current partnership cross X runs?"
7. BOUNDARY     -> "Will there be a six in the next 2 overs?"
8. CHASE        -> "[batting_team] jeetega? (2nd innings only)"

# ODDS CALCULATION RULES:
- Base: YES = 1.90, NO = 1.90  (house edge ~5%)
- Adjust max ±0.30 based on match situation:
  - Set a target that is 55-65% likely to happen
  - If YES more likely -> YES = 1.65-1.75, NO = 2.05-2.15
  - If NO more likely -> YES = 2.05-2.15, NO = 1.65-1.75
  - NEVER go below 1.55 or above 2.30 on any side
- Implied probability must always sum to ~105% (house edge)
  - Formula: (1/YES_odds + 1/NO_odds) × 100 = ~105%

# OUTPUT FORMAT — strict JSON only, no extra text:
{
  "sessions": [
    {
      "session_id": "<match_id>_<type>_<timestamp>",
      "type": "OVER_RUNS | WICKET | BATSMAN_RUNS | TOTAL | PARTNERSHIP | BOUNDARY | CHASE",
      "title": "Short title for UI card (max 8 words)",
      "question": "Full YES/NO question shown to user",
      "target_description": "What resolves this bet (e.g. end of over 18)",
      "yes_odds": 1.90,
      "no_odds": 1.90,
      "probability_yes_pct": 52,
      "closes_at_over": "15.0",
      "resolves_at_over": "18.0",
      "min_bet": 10,
      "max_bet": 50000,
      "status": "open",
      "reasoning": "1-line logic: why this target and odds"
    }
  ],
  "generated_at_over": "14.3",
  "match_phase_context": "Brief match situation summary for admin"
}

# STRICT RULES:
1. Never create a session that has already resolved
2. Betting must close at least 1 full over BEFORE the event
3. All 3 sessions must be DIFFERENT types
4. Targets must be realistic — not too easy (>75% likely) or too hard (<25% likely)
5. Use player names and team names from the input — never generic placeholders
6. Output ONLY valid JSON — no explanation, no markdown, no preamble`;

      const prompt = JSON.stringify(matchData, null, 2);

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sessions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    session_id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    title: { type: Type.STRING },
                    question: { type: Type.STRING },
                    target_description: { type: Type.STRING },
                    yes_odds: { type: Type.NUMBER },
                    no_odds: { type: Type.NUMBER },
                    probability_yes_pct: { type: Type.NUMBER },
                    closes_at_over: { type: Type.STRING },
                    resolves_at_over: { type: Type.STRING },
                    min_bet: { type: Type.NUMBER },
                    max_bet: { type: Type.NUMBER },
                    status: { type: Type.STRING },
                    reasoning: { type: Type.STRING },
                  },
                  required: ["session_id", "type", "title", "question", "yes_odds", "no_odds"]
                }
              },
              generated_at_over: { type: Type.STRING },
              match_phase_context: { type: Type.STRING }
            },
            required: ["sessions"]
          }
        }
      });

      const generatedText = response.text || "{}";
      const sessionJson = JSON.parse(generatedText.trim());

      res.json({ success: true, ...sessionJson });

    } catch (e: any) {
      console.error("Gemini Generation Error:", e);
      res.status(500).json({ success: false, error: e.message || "Failed to generate session" });
    }
  });
  // apiRouter.use('/users', usersRouter);
  // apiRouter.use('/data', dataRouter);
  
  app.use("/api", apiRouter);

  // ==========================================
  // Vite Middleware for Frontend (Development)
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production statics
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
