/**
 * WS24 Dev - Main Server Entry Point
 * 
 * This module initializes and configures the Express.js server with comprehensive
 * security middleware, error handling, and development/production environment support.
 * 
 * @module ServerIndex
 * @requires express - Web application framework
 * @requires helmet - Security middleware for setting HTTP headers
 * @requires cors - Cross-origin resource sharing middleware
 * @requires morgan - HTTP request logging middleware
 */

// Load environment variables first
import dotenv from "dotenv";
dotenv.config();

// Then validate environment variables before importing other modules
import { validateEnvironmentOrExit } from "./env-validation";
const validatedEnv = validateEnvironmentOrExit();

import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

/**
 * Express application instance with comprehensive middleware configuration
 */
const app = express();

// Security middleware - must be first
app.use(helmet({
  contentSecurityPolicy: validatedEnv.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  } : false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: validatedEnv.NODE_ENV === 'production' 
    ? validatedEnv.REPLIT_DOMAINS || false
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Request logging
app.use(morgan(validatedEnv.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Health check endpoint for Docker/Kubernetes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: validatedEnv.NODE_ENV,
    version: '1.0.0'
  });
});

(async () => {
  const server = await registerRoutes(app);

  /**
   * Global error handling middleware
   * Ensures no stack traces are exposed in production
   * 
   * @param err - Error object
   * @param _req - Express request object
   * @param res - Express response object
   * @param _next - Express next function
   */
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = validatedEnv.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message || "Internal Server Error";

    // Log error for debugging (without exposing to client)
    console.error('Server Error:', {
      status,
      message: err.message,
      stack: validatedEnv.NODE_ENV === 'development' ? err.stack : undefined,
      timestamp: new Date().toISOString(),
      url: _req.url,
      method: _req.method
    });

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (validatedEnv.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use validated port from environment validation
  server.listen(8000, "0.0.0.0", () => {
    log(`serving on port 8000`);
  });
})();
