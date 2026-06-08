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

  // Proxy route for your Live Matches API
  // Ye route frontend call karega, aur backend aage actual Live API ko call karega
  apiRouter.get("/live-matches", async (req, res) => {
    try {
      // 1. Apne environment variables se API Key aur URL get karein
      const apiUrl = "https://api.cricapi.com/v1/cricScore?apikey=55deec14-d2da-412e-a0ba-e98090b4cce8";
      const apiKey = "55deec14-d2da-412e-a0ba-e98090b4cce8";

      // Fetch from actual API
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      // console.log("CricAPI Response Status:", data.status, "Info:", data.info?.hitsToday);
      if (data.status === 'failure' || data.apikey === false) {
        // Silently handle error
      }
      
      // Send the data formatted back or raw
      return res.json({
        success: data.status !== 'failure',
        error: data.reason,
        matches: data.data || [] // Assuming data.data holds the matches based on CricAPI format
      });
    } catch (error) {
      // Silently handle API failures
      res.status(500).json({ success: false, error: "Failed to fetch live matches" });
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
