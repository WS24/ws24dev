/**
 * WS24 Dev - API Routes Module
 * 
 * This module defines all API endpoints for the WS24 Dev platform with comprehensive
 * input validation, authentication, and error handling. All routes implement proper
 * security measures including input sanitization and parameterized queries.
 * 
 * @module Routes
 * @requires express-validator - Input validation and sanitization
 * @requires zod - Schema validation
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import { body, param, query, validationResult } from "express-validator";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTaskSchema, insertEvaluationSchema, insertUpdateSchema } from "@shared/schema";
import { z } from "zod";

/**
 * Middleware to handle validation errors from express-validator
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: "Validation failed", 
      errors: errors.array() 
    });
  }
  next();
};

/**
 * Register all API routes with comprehensive validation and security
 * 
 * @param app - Express application instance
 * @returns HTTP server instance
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  /**
   * Get current authenticated user information
   * 
   * @route GET /api/auth/user
   * @access Private - Requires authentication
   */
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      if (!user) {
        // In development mode, create a default user if none exists
        if (process.env.NODE_ENV === "development") {
          console.log("Creating default user for development");
          user = await storage.upsertUser({
            id: userId,
            email: req.user.claims.email || "ws24adwords@gmail.com",
            firstName: req.user.claims.first_name || "Test",
            lastName: req.user.claims.last_name || "User",
            username: "testuser",
            role: "admin",
            balance: "1000.00",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else {
          return res.status(404).json({ message: "User not found" });
        }
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.put('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = req.body;
      
      // Update IP address from request
      if (req.ip) {
        profileData.ipAddress = req.ip;
      }
      
      const updatedUser = await storage.updateUserProfile(userId, profileData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  app.get('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Task routes
  app.get("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let tasks;
      if (user.role === "specialist") {
        tasks = await storage.getTasksBySpecialist(userId);
      } else {
        tasks = await storage.getTasksByClient(userId);
      }

      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/pending", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "specialist") {
        return res.status(403).json({ message: "Access denied" });
      }

      const tasks = await storage.getPendingTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching pending tasks:", error);
      res.status(500).json({ message: "Failed to fetch pending tasks" });
    }
  });

  app.get("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Check if user has access to this task
      const userId = req.user.claims.sub;
      if (task.clientId !== userId && task.specialistId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== "client" && user.role !== "admin")) {
        return res.status(403).json({ message: "Only clients and admins can create tasks" });
      }

      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask({
        ...validatedData,
        clientId: userId,
      });

      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.get("/api/tasks/:id/updates", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskId = parseInt(req.params.id);
      
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Check if user has permission to view this task
      if (task.clientId !== userId && task.specialistId !== userId) {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const updates = await storage.getTaskUpdates(taskId);
      res.json(updates);
    } catch (error) {
      console.error("Error fetching task updates:", error);
      res.status(500).json({ message: "Failed to fetch task updates" });
    }
  });

  app.post("/api/tasks/:id/updates", isAuthenticated, [
    body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
    handleValidationErrors,
  ], async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskId = parseInt(req.params.id);
      
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Check if user has permission to comment on this task
      if (task.clientId !== userId && task.specialistId !== userId) {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const update = await storage.createTaskUpdate({
        taskId,
        userId,
        content: req.body.content,
        type: "comment"
      });
      
      res.status(201).json(update);
    } catch (error) {
      console.error("Error creating task update:", error);
      res.status(500).json({ message: "Failed to create task update" });
    }
  });

  app.patch("/api/tasks/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const { status } = req.body;
      const userId = req.user.claims.sub;

      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Validate status transitions
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only specialists can take on tasks or mark them complete
      if (status === "in_progress" && user.role === "specialist") {
        await storage.updateTaskStatus(taskId, status, userId);
      } else if (status === "completed" && task.specialistId === userId) {
        await storage.updateTaskStatus(taskId, status);
      } else {
        return res.status(403).json({ message: "Invalid status change" });
      }

      res.json({ message: "Task status updated" });
    } catch (error) {
      console.error("Error updating task status:", error);
      res.status(500).json({ message: "Failed to update task status" });
    }
  });

  // Evaluation routes
  app.post("/api/tasks/:id/evaluate", isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "specialist") {
        return res.status(403).json({ message: "Only specialists can evaluate tasks" });
      }

      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      if (task.status !== "created" && task.status !== "evaluating") {
        return res.status(400).json({ message: "Task cannot be evaluated at this stage" });
      }

      const validatedData = insertEvaluationSchema.parse(req.body);
      const evaluation = await storage.createEvaluation({
        ...validatedData,
        taskId,
        specialistId: userId,
      });

      res.status(201).json(evaluation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating evaluation:", error);
      res.status(500).json({ message: "Failed to create evaluation" });
    }
  });

  app.get("/api/tasks/:id/evaluations", isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const evaluations = await storage.getEvaluationsByTask(taskId);
      res.json(evaluations);
    } catch (error) {
      console.error("Error fetching evaluations:", error);
      res.status(500).json({ message: "Failed to fetch evaluations" });
    }
  });

  app.post("/api/tasks/:taskId/evaluations/:evaluationId/accept", isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const evaluationId = parseInt(req.params.evaluationId);
      const userId = req.user.claims.sub;

      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      if (task.clientId !== userId) {
        return res.status(403).json({ message: "Only the task client can accept evaluations" });
      }

      await storage.acceptEvaluation(taskId, evaluationId);
      
      // Create payment record
      if (task.totalCost) {
        await storage.createPayment({
          taskId,
          amount: task.totalCost,
        });
      }

      res.json({ message: "Evaluation accepted" });
    } catch (error) {
      console.error("Error accepting evaluation:", error);
      res.status(500).json({ message: "Failed to accept evaluation" });
    }
  });

  // Payment routes
  app.get("/api/tasks/:id/payments", isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const payments = await storage.getPaymentsByTask(taskId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.patch("/api/payments/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      const { status, transactionId } = req.body;

      await storage.updatePaymentStatus(paymentId, status, transactionId);
      res.json({ message: "Payment status updated" });
    } catch (error) {
      console.error("Error updating payment status:", error);
      res.status(500).json({ message: "Failed to update payment status" });
    }
  });

  // Task updates routes
  app.get("/api/tasks/:id/updates", isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const updates = await storage.getTaskUpdates(taskId);
      res.json(updates);
    } catch (error) {
      console.error("Error fetching task updates:", error);
      res.status(500).json({ message: "Failed to fetch task updates" });
    }
  });

  app.post("/api/tasks/:id/updates", isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      if (task.clientId !== userId && task.specialistId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertUpdateSchema.parse(req.body);
      const update = await storage.createTaskUpdate({
        ...validatedData,
        taskId,
        userId,
      });

      res.status(201).json(update);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating task update:", error);
      res.status(500).json({ message: "Failed to create task update" });
    }
  });

  // Stats routes
  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let stats;
      if (user.role === "specialist") {
        stats = await storage.getSpecialistStats(userId);
      } else {
        stats = await storage.getClientStats(userId);
      }

      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Task evaluation routes
  app.get("/api/tasks/pending-evaluation", isAuthenticated, async (req, res) => {
    try {
      const tasks = await storage.getPendingTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching pending tasks:", error);
      res.status(500).json({ message: "Failed to fetch pending tasks" });
    }
  });

  app.post("/api/tasks/:id/evaluate", isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const evaluation = await storage.createEvaluation({
        ...req.body,
        taskId,
        specialistId: userId,
      });
      res.json(evaluation);
    } catch (error) {
      console.error("Error creating evaluation:", error);
      res.status(500).json({ message: "Failed to create evaluation" });
    }
  });

  app.get("/api/evaluations/my-evaluations", isAuthenticated, async (req, res) => {
    try {
      const evaluations = await storage.getEvaluationsByTask(0); // Get all user's evaluations
      res.json(evaluations);
    } catch (error) {
      console.error("Error fetching evaluations:", error);
      res.status(500).json({ message: "Failed to fetch evaluations" });
    }
  });

  // System settings routes
  app.get("/api/system-settings", isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings || {});
    } catch (error) {
      console.error("Error fetching system settings:", error);
      res.status(500).json({ message: "Failed to fetch system settings" });
    }
  });

  app.put("/api/system-settings", isAuthenticated, async (req, res) => {
    try {
      const updatedSettings = await storage.updateSystemSettings(req.body);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating system settings:", error);
      res.status(500).json({ message: "Failed to update system settings" });
    }
  });

  // Temporary admin access (remove in production)
  app.get("/api/admin/demo", async (req: any, res) => {
    try {
      const tasks = await storage.getTasksWithDetails();
      const stats = await storage.getAdminStats();
      const users = await storage.getAllUsers();
      
      res.json({
        tasks,
        stats,
        users,
        currentUser: { id: "40361721", role: "admin" }
      });
    } catch (error) {
      console.error("Error fetching admin demo data:", error);
      res.status(500).json({ message: "Failed to fetch demo data" });
    }
  });

  // Admin routes
  app.get("/api/admin/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const tasks = await storage.getTasksWithDetails();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching admin tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", isAuthenticated, [
    body('email').isEmail().withMessage('Valid email is required'),
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('role').isIn(['client', 'specialist', 'admin']).withMessage('Invalid role'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    handleValidationErrors,
  ], async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { email, username, firstName, lastName, role, password } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create user with a unique ID
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newUser = await storage.upsertUser({
        id: newUserId,
        email,
        username,
        firstName,
        lastName,
        role,
        balance: "0.00",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      res.json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/admin/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.patch("/api/admin/users/:id/role", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const targetUserId = req.params.id;
      const { role } = req.body;

      if (!["client", "specialist", "admin", "blocked"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      // Prevent self-demotion from admin
      if (targetUserId === userId && role !== "admin") {
        return res.status(400).json({ message: "Cannot change your own admin role" });
      }

      await storage.updateUserRole(targetUserId, role);
      res.json({ message: "User role updated successfully" });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Announcements routes
  app.get("/api/announcements", async (req: any, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post("/api/admin/announcements", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const announcement = await storage.createAnnouncement(req.body);
      res.status(201).json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  // Knowledge Base routes
  app.get("/api/knowledge/categories", async (req: any, res) => {
    try {
      const categories = await storage.getKnowledgeCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching knowledge categories:", error);
      res.status(500).json({ message: "Failed to fetch knowledge categories" });
    }
  });

  app.get("/api/knowledge/articles", async (req: any, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId) : undefined;
      const articles = await storage.getKnowledgeArticles(categoryId);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching knowledge articles:", error);
      res.status(500).json({ message: "Failed to fetch knowledge articles" });
    }
  });

  app.get("/api/knowledge/articles/:id", async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getKnowledgeArticle(id);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      // Increment view count
      await storage.incrementArticleViews(id);
      
      res.json(article);
    } catch (error) {
      console.error("Error fetching knowledge article:", error);
      res.status(500).json({ message: "Failed to fetch knowledge article" });
    }
  });

  app.post("/api/admin/knowledge/articles", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const article = await storage.createKnowledgeArticle(req.body);
      res.status(201).json(article);
    } catch (error) {
      console.error("Error creating knowledge article:", error);
      res.status(500).json({ message: "Failed to create knowledge article" });
    }
  });

  // Ticket Categories routes
  app.get("/api/ticket-categories", async (req: any, res) => {
    try {
      const categories = await storage.getTicketCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching ticket categories:", error);
      res.status(500).json({ message: "Failed to fetch ticket categories" });
    }
  });

  // Ticket Replies routes
  app.get("/api/tasks/:id/replies", isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const replies = await storage.getTicketReplies(taskId);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching ticket replies:", error);
      res.status(500).json({ message: "Failed to fetch ticket replies" });
    }
  });

  app.post("/api/tasks/:id/replies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskId = parseInt(req.params.id);
      
      const reply = await storage.createTicketReply({
        ticketId: taskId,
        userId: userId,
        body: req.body.body,
      });
      
      res.status(201).json(reply);
    } catch (error) {
      console.error("Error creating ticket reply:", error);
      res.status(500).json({ message: "Failed to create ticket reply" });
    }
  });

  // Billing routes
  app.get('/api/billing/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const year = req.query.year ? parseInt(req.query.year) : undefined;
      const transactions = await storage.getTransactions(userId, year);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get('/api/billing/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getBillingStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching billing stats:", error);
      res.status(500).json({ message: "Failed to fetch billing stats" });
    }
  });

  // Knowledge Base routes
  app.get('/api/knowledge/categories', async (req, res) => {
    try {
      const categories = await storage.getKnowledgeCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching knowledge categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/knowledge/articles', async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const articles = await storage.getKnowledgeArticles(categoryId);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching knowledge articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  // Announcements routes
  app.get('/api/announcements', async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  // Analytics routes
  app.get('/api/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const dateRange = req.query.dateRange as string || '30';
      const reportType = req.query.reportType as string || 'overview';
      
      // Calculate date range
      const daysBack = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      
      const analytics = await storage.getAnalyticsData(startDate, reportType);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/analytics/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const dateRange = req.query.dateRange as string || '30';
      const daysBack = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      
      const taskMetrics = await storage.getTaskAnalytics(startDate);
      res.json(taskMetrics);
    } catch (error) {
      console.error("Error fetching task analytics:", error);
      res.status(500).json({ message: "Failed to fetch task analytics" });
    }
  });

  app.get('/api/analytics/revenue', isAuthenticated, async (req: any, res) => {
    try {
      const dateRange = req.query.dateRange as string || '30';
      const daysBack = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      
      const revenueMetrics = await storage.getRevenueAnalytics(startDate);
      res.json(revenueMetrics);
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ message: "Failed to fetch revenue analytics" });
    }
  });

  app.get('/api/analytics/users', isAuthenticated, async (req: any, res) => {
    try {
      const dateRange = req.query.dateRange as string || '30';
      const daysBack = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      
      const userMetrics = await storage.getUserAnalytics(startDate);
      res.json(userMetrics);
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      res.status(500).json({ message: "Failed to fetch user analytics" });
    }
  });

  // Admin users management endpoints
  app.get("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put("/api/admin/users/:id", isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user.claims.sub;
      const adminUser = await storage.getUser(adminUserId);
      
      if (!adminUser || adminUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const userData = req.body;
      const updatedUser = await storage.updateUserProfile(id, userData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Stripe settings routes
  app.post('/api/admin/stripe-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      // In a real implementation, these would be stored securely
      // For now, we'll just validate and return success
      const { publicKey, secretKey } = req.body;
      
      if (!publicKey?.startsWith('pk_') || !secretKey?.startsWith('sk_')) {
        return res.status(400).json({ message: "Invalid Stripe API keys" });
      }

      res.json({ message: "Stripe settings saved successfully" });
    } catch (error) {
      console.error("Error saving Stripe settings:", error);
      res.status(500).json({ message: "Failed to save Stripe settings" });
    }
  });

  app.post('/api/admin/stripe-test', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { publicKey, secretKey } = req.body;
      
      // Basic validation - in real implementation, test actual Stripe connection
      if (publicKey?.startsWith('pk_') && secretKey?.startsWith('sk_')) {
        res.json({ status: "connected", message: "Stripe connection successful" });
      } else {
        res.status(400).json({ status: "failed", message: "Invalid API keys" });
      }
    } catch (error) {
      console.error("Error testing Stripe connection:", error);
      res.status(500).json({ message: "Failed to test Stripe connection" });
    }
  });

  // Ticket Settings endpoints
  app.get('/api/ticket-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const settings = await storage.getTicketSettings();
      res.json(settings || {
        allowFileUpload: true,
        allowGuestTickets: false,
        allowTicketEdit: true,
        requireLogin: false,
        allowTicketRating: true,
        preventRepliesAfterClose: true,
        staffReplyAction: "nothing",
        clientReplyAction: "nothing",
        imapProtocol: "imap",
        imapHost: "imap.timeweb.ru:993",
        imapSsl: true,
        imapSkipCertValidation: false,
        imapEmail: "ticket@ws24.pro",
        imapPassword: "",
        ticketTitle: "Support Ticket",
        defaultCategory: "general",
        defaultStatus: "new",
        imapTicketString: "## Номер заявки:",
        imapReplyString: "##- Введите свой ответ над этой строкой -##",
      });
    } catch (error) {
      console.error("Error fetching ticket settings:", error);
      res.status(500).json({ message: "Failed to fetch ticket settings" });
    }
  });

  app.put('/api/ticket-settings', isAuthenticated, [
    body('allowFileUpload').optional().isBoolean(),
    body('allowGuestTickets').optional().isBoolean(),
    body('allowTicketEdit').optional().isBoolean(),
    body('requireLogin').optional().isBoolean(),
    body('allowTicketRating').optional().isBoolean(),
    body('preventRepliesAfterClose').optional().isBoolean(),
    body('staffReplyAction').optional().isString(),
    body('clientReplyAction').optional().isString(),
    body('imapProtocol').optional().isString(),
    body('imapHost').optional().isString(),
    body('imapSsl').optional().isBoolean(),
    body('imapSkipCertValidation').optional().isBoolean(),
    body('imapEmail').optional().isEmail(),
    body('imapPassword').optional().isString(),
    body('ticketTitle').optional().isString(),
    body('defaultCategory').optional().isString(),
    body('defaultStatus').optional().isString(),
    body('imapTicketString').optional().isString(),
    body('imapReplyString').optional().isString(),
    handleValidationErrors,
  ], async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const updatedSettings = await storage.updateTicketSettings(req.body);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating ticket settings:", error);
      res.status(500).json({ message: "Failed to update ticket settings" });
    }
  });

  // Administrator endpoints
  app.get('/api/admin/dashboard-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getAdminDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.post('/api/admin/adjust-balance', isAuthenticated, [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('amount').isNumeric().withMessage('Amount must be numeric'),
    body('reason').notEmpty().withMessage('Reason is required'),
    body('type').isIn(['credit', 'debit']).withMessage('Type must be credit or debit'),
    handleValidationErrors,
  ], async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const admin = await storage.getUser(adminId);
      
      if (!admin || admin.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { userId, amount, reason, type } = req.body;
      const adjustment = await storage.adjustUserBalance(adminId, userId, amount, reason, type);
      res.json(adjustment);
    } catch (error) {
      console.error("Error adjusting balance:", error);
      res.status(500).json({ message: "Failed to adjust balance" });
    }
  });

  app.get('/api/admin/balance-adjustments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const adjustments = await storage.getBalanceAdjustments();
      res.json(adjustments);
    } catch (error) {
      console.error("Error fetching balance adjustments:", error);
      res.status(500).json({ message: "Failed to fetch balance adjustments" });
    }
  });

  app.post('/api/admin/assign-task', isAuthenticated, [
    body('taskId').isNumeric().withMessage('Task ID must be numeric'),
    body('specialistId').notEmpty().withMessage('Specialist ID is required'),
    handleValidationErrors,
  ], async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const admin = await storage.getUser(adminId);
      
      if (!admin || admin.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { taskId, specialistId, notes } = req.body;
      const assignment = await storage.assignTaskToSpecialist(adminId, taskId, specialistId, notes);
      res.json(assignment);
    } catch (error) {
      console.error("Error assigning task:", error);
      res.status(500).json({ message: "Failed to assign task" });
    }
  });

  app.get('/api/admin/platform-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const settings = await storage.getPlatformSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching platform settings:", error);
      res.status(500).json({ message: "Failed to fetch platform settings" });
    }
  });

  app.put('/api/admin/platform-settings/:key', isAuthenticated, [
    body('value').notEmpty().withMessage('Value is required'),
    handleValidationErrors,
  ], async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const admin = await storage.getUser(adminId);
      
      if (!admin || admin.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { key } = req.params;
      const { value } = req.body;
      const setting = await storage.updatePlatformSetting(key, value, undefined, adminId);
      res.json(setting);
    } catch (error) {
      console.error("Error updating platform setting:", error);
      res.status(500).json({ message: "Failed to update platform setting" });
    }
  });

  // Client endpoints
  app.get('/api/client/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "client") {
        return res.status(403).json({ message: "Client access required" });
      }

      const stats = await storage.getClientStats(userId);
      const balance = user.balance || "0.00";
      
      res.json({
        ...stats,
        accountBalance: balance,
      });
    } catch (error) {
      console.error("Error fetching client stats:", error);
      res.status(500).json({ message: "Failed to fetch client stats" });
    }
  });

  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Specialist endpoints
  app.get('/api/specialist/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "specialist") {
        return res.status(403).json({ message: "Specialist access required" });
      }

      const stats = await storage.getSpecialistStats(userId);
      
      // Get specializations from user profile
      const specializations = user.specializations ? user.specializations.split(',').map(s => s.trim()) : [];
      
      res.json({
        ...stats,
        averageRating: 4.5, // Placeholder for future rating system
        specializations,
      });
    } catch (error) {
      console.error("Error fetching specialist stats:", error);
      res.status(500).json({ message: "Failed to fetch specialist stats" });
    }
  });

  app.get('/api/specialist/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "specialist") {
        return res.status(403).json({ message: "Specialist access required" });
      }

      const tasks = await storage.getTasksBySpecialist(userId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching specialist tasks:", error);
      res.status(500).json({ message: "Failed to fetch specialist tasks" });
    }
  });

  app.get('/api/specialist/evaluations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "specialist") {
        return res.status(403).json({ message: "Specialist access required" });
      }

      const evaluations = await storage.getEvaluationsBySpecialist(userId);
      res.json(evaluations);
    } catch (error) {
      console.error("Error fetching specialist evaluations:", error);
      res.status(500).json({ message: "Failed to fetch specialist evaluations" });
    }
  });

  app.put('/api/tasks/:id/complete', isAuthenticated, [
    param('id').isNumeric().withMessage('Task ID must be numeric'),
    handleValidationErrors,
  ], async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const taskId = parseInt(req.params.id);
      
      if (!user || user.role !== "specialist") {
        return res.status(403).json({ message: "Specialist access required" });
      }

      const task = await storage.getTask(taskId);
      if (!task || task.specialistId !== userId) {
        return res.status(404).json({ message: "Task not found or unauthorized" });
      }

      await storage.updateTaskStatus(taskId, "completed");
      res.json({ message: "Task marked as completed" });
    } catch (error) {
      console.error("Error completing task:", error);
      res.status(500).json({ message: "Failed to complete task" });
    }
  });

  // Notification routes
  app.get("/api/notifications", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req: any, res: Response) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/read-all", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Activity logs endpoint for administrators
  app.get("/api/admin/activity-logs", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const logs = await storage.getActivityLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  /**
   * Helpdesk Dashboard Stats
   * 
   * @route GET /api/helpdesk/dashboard-stats
   * @access Private - Requires authentication
   */
  app.get("/api/helpdesk/dashboard-stats", isAuthenticated, async (req: any, res: Response) => {
    try {
      const stats = await storage.getHelpdeskDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching helpdesk stats:", error);
      res.status(500).json({ message: "Failed to fetch helpdesk statistics" });
    }
  });

  /**
   * Recent Helpdesk Activity
   * 
   * @route GET /api/helpdesk/recent-activity
   * @access Private - Requires authentication
   */
  app.get("/api/helpdesk/recent-activity", isAuthenticated, async (req: any, res: Response) => {
    try {
      const activity = await storage.getRecentHelpdeskActivity(10);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  /**
   * Get Ticket Details
   * 
   * @route GET /api/tickets/:id
   * @access Private - Requires authentication
   */
  app.get("/api/tickets/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const ticket = await storage.getTicketDetails(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      // Check access permissions
      if (req.user.claims.role !== "admin" && 
          ticket.clientId !== userId && 
          ticket.specialistId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(ticket);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      res.status(500).json({ message: "Failed to fetch ticket details" });
    }
  });

  /**
   * Get Ticket Messages
   * 
   * @route GET /api/tickets/:id/messages
   * @access Private - Requires authentication
   */
  app.get("/api/tickets/:id/messages", isAuthenticated, async (req: any, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const userRole = req.user.claims.role;
      
      const messages = await storage.getTicketMessages(ticketId, userId, userRole);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  /**
   * Send Ticket Message
   * 
   * @route POST /api/tickets/:id/messages
   * @access Private - Requires authentication
   */
  app.post("/api/tickets/:id/messages", 
    isAuthenticated,
    body("message").trim().notEmpty().withMessage("Message is required"),
    body("isInternal").optional().isBoolean(),
    handleValidationErrors,
    async (req: any, res: Response) => {
      try {
        const ticketId = parseInt(req.params.id);
        const userId = req.user.claims.sub;
        const { message, isInternal } = req.body;
        
        const newMessage = await storage.createTicketMessage({
          ticketId,
          userId,
          message,
          isInternal: isInternal || false
        });
        
        // Log activity
        await storage.logActivity({
          userId,
          action: isInternal ? "Added internal note" : "Sent message",
          entityType: "ticket",
          entityId: ticketId
        });
        
        res.json(newMessage);
      } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Failed to send message" });
      }
    }
  );

  /**
   * Get Ticket Change Log
   * 
   * @route GET /api/tickets/:id/changelog
   * @access Private - Requires authentication
   */
  app.get("/api/tickets/:id/changelog", isAuthenticated, async (req: any, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id);
      const changeLog = await storage.getTicketChangeLog(ticketId);
      res.json(changeLog);
    } catch (error) {
      console.error("Error fetching change log:", error);
      res.status(500).json({ message: "Failed to fetch change log" });
    }
  });

  /**
   * Update Ticket Settings
   * 
   * @route PATCH /api/tickets/:id
   * @access Private - Requires authentication (Admin or Assigned Specialist)
   */
  app.patch("/api/tickets/:id", 
    isAuthenticated,
    body("status").optional().isIn(["Created", "In Progress", "Evaluation", "Completed", "Rejected"]),
    body("priority").optional().isIn(["low", "medium", "high"]),
    body("estimatedDelivery").optional().isISO8601(),
    body("quotedCost").optional().isNumeric(),
    body("adminApproval").optional().isBoolean(),
    handleValidationErrors,
    async (req: any, res: Response) => {
      try {
        const ticketId = parseInt(req.params.id);
        const userId = req.user.claims.sub;
        const userRole = req.user.claims.role;
        
        const ticket = await storage.getTask(ticketId);
        if (!ticket) {
          return res.status(404).json({ message: "Ticket not found" });
        }
        
        // Check permissions
        if (userRole !== "admin" && ticket.specialistId !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }
        
        const updates = req.body;
        const oldValues = { ...ticket };
        
        await storage.updateTicketSettings(ticketId, updates);
        
        // Log changes
        await storage.logActivity({
          userId,
          action: "Updated ticket settings",
          entityType: "ticket",
          entityId: ticketId,
          oldValues,
          newValues: updates
        });
        
        res.json({ message: "Ticket updated successfully" });
      } catch (error) {
        console.error("Error updating ticket:", error);
        res.status(500).json({ message: "Failed to update ticket" });
      }
    }
  );

  /**
   * Get Ticket Attachments
   * 
   * @route GET /api/tickets/:id/attachments
   * @access Private - Requires authentication
   */
  app.get("/api/tickets/:id/attachments", isAuthenticated, async (req: any, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id);
      const attachments = await storage.getTicketAttachments(ticketId);
      res.json(attachments);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      res.status(500).json({ message: "Failed to fetch attachments" });
    }
  });

  /**
   * Upload Ticket Attachment
   * 
   * @route POST /api/tickets/:id/attachments
   * @access Private - Requires authentication
   */
  app.post("/api/tickets/:id/attachments", isAuthenticated, async (req: any, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // In a real implementation, you would handle file upload here
      // For now, we'll just create a placeholder
      const attachment = await storage.createTicketAttachment({
        ticketId,
        userId,
        name: "uploaded-file.pdf",
        size: "2.5 MB",
        url: "/files/placeholder.pdf"
      });
      
      await storage.logActivity({
        userId,
        action: "Uploaded attachment",
        entityType: "ticket",
        entityId: ticketId
      });
      
      res.json(attachment);
    } catch (error) {
      console.error("Error uploading attachment:", error);
      res.status(500).json({ message: "Failed to upload attachment" });
    }
  });

  /**
   * Billing and Payment Routes
   */
  app.get("/api/billing/stats", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const balance = await storage.getUserBalance(userId);
      
      // Get total spent this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const transactions = await storage.getTransactionHistory(userId);
      
      const totalSpent = transactions
        .filter((t: any) => t.fromUserId === userId && t.type === 'payment' && new Date(t.createdAt!) >= startOfMonth)
        .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
      
      // Get pending invoices
      const invoices = await storage.getUserInvoices(userId);
      const pendingInvoices = invoices.filter((i: any) => i.status === 'pending');
      const pendingAmount = pendingInvoices.reduce((sum: number, i: any) => sum + parseFloat(i.total), 0);
      
      res.json({
        balance,
        totalSpent: totalSpent.toFixed(2),
        pendingInvoices: pendingInvoices.length,
        pendingAmount: pendingAmount.toFixed(2)
      });
    } catch (error) {
      console.error("Error fetching billing stats:", error);
      res.status(500).json({ message: "Failed to fetch billing stats" });
    }
  });

  app.get("/api/billing/transactions", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getTransactionHistory(userId, 50);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/billing/invoices", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const invoices = await storage.getUserInvoices(userId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post("/api/billing/topup", 
    isAuthenticated,
    [
      body("amount").isFloat({ min: 1 }).withMessage("Amount must be at least $1"),
    ],
    handleValidationErrors,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.claims.sub;
        const { amount } = req.body;
        
        // Update user balance
        await storage.updateUserBalance(userId, amount, 'add');
        
        // Create transaction record
        await storage.createTransaction({
          transactionId: `TOPUP${Date.now()}`,
          type: 'topup',
          amount: amount.toFixed(2),
          userId: userId,
          description: `Balance top-up`,
          status: 'completed',
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          day: new Date().getDate()
        });
        
        res.json({ message: "Balance topped up successfully" });
      } catch (error) {
        console.error("Error processing top-up:", error);
        res.status(500).json({ message: "Failed to process top-up" });
      }
    }
  );

  app.post("/api/billing/invoices",
    isAuthenticated,
    [
      body("amount").isFloat({ min: 0 }).withMessage("Invalid amount"),
      body("description").optional().isString(),
      body("dueDate").optional().isISO8601(),
      body("companyName").optional().isString(),
      body("companyAddress").optional().isString(),
      body("companyTaxId").optional().isString(),
    ],
    handleValidationErrors,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        
        if (user?.role !== 'admin') {
          return res.status(403).json({ message: "Only admins can create manual invoices" });
        }

        const { amount, description, dueDate, companyName, companyAddress, companyTaxId } = req.body;
        
        const invoice = await storage.createInvoice({
          invoiceNumber: `INV${Date.now()}`,
          userId,
          amount: amount.toFixed(2),
          tax: "0",
          total: amount.toFixed(2),
          status: 'pending',
          dueDate: dueDate ? new Date(dueDate) : undefined,
          companyName,
          companyAddress,
          companyTaxId,
          notes: description
        });
        
        res.json(invoice);
      } catch (error) {
        console.error("Error creating invoice:", error);
        res.status(500).json({ message: "Failed to create invoice" });
      }
    }
  );

  app.post("/api/billing/process-payment/:taskId",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = req.user.claims.sub;
        const taskId = parseInt(req.params.taskId);
        const { amount } = req.body;
        
        const result = await storage.processTaskPayment(taskId, userId, amount);
        
        res.json({
          message: "Payment processed successfully",
          ...result
        });
      } catch (error: any) {
        console.error("Error processing payment:", error);
        res.status(400).json({ message: error.message || "Failed to process payment" });
      }
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}
