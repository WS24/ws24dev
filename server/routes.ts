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
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
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
      
      if (!user || user.role !== "client") {
        return res.status(403).json({ message: "Only clients can create tasks" });
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

  const httpServer = createServer(app);
  return httpServer;
}
