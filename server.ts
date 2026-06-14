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
