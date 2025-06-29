import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTaskSchema, insertEvaluationSchema, insertUpdateSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
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

  const httpServer = createServer(app);
  return httpServer;
}
