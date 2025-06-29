import {
  users,
  tasks,
  taskEvaluations,
  payments,
  taskUpdates,
  type User,
  type UpsertUser,
  type Task,
  type InsertTask,
  type TaskEvaluation,
  type InsertEvaluation,
  type Payment,
  type TaskUpdate,
  type InsertUpdate,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, or, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Task operations
  createTask(task: InsertTask & { clientId: string }): Promise<Task>;
  getTask(id: number): Promise<Task | undefined>;
  getTasksByClient(clientId: string): Promise<Task[]>;
  getTasksBySpecialist(specialistId: string): Promise<Task[]>;
  getPendingTasks(): Promise<Task[]>;
  updateTaskStatus(id: number, status: string, specialistId?: string): Promise<void>;
  updateTask(id: number, updates: Partial<Task>): Promise<void>;
  
  // Evaluation operations
  createEvaluation(evaluation: InsertEvaluation & { taskId: number; specialistId: string }): Promise<TaskEvaluation>;
  getEvaluationsByTask(taskId: number): Promise<TaskEvaluation[]>;
  acceptEvaluation(taskId: number, evaluationId: number): Promise<void>;
  
  // Payment operations
  createPayment(payment: { taskId: number; amount: string }): Promise<Payment>;
  updatePaymentStatus(id: number, status: string, transactionId?: string): Promise<void>;
  getPaymentsByTask(taskId: number): Promise<Payment[]>;
  
  // Update operations
  createTaskUpdate(update: InsertUpdate & { taskId: number; userId: string }): Promise<TaskUpdate>;
  getTaskUpdates(taskId: number): Promise<TaskUpdate[]>;
  
  // Stats operations
  getClientStats(clientId: string): Promise<{
    activeTasks: number;
    completedTasks: number;
    pendingTasks: number;
    totalSpent: string;
  }>;
  getSpecialistStats(specialistId: string): Promise<{
    assignedTasks: number;
    completedTasks: number;
    pendingEvaluations: number;
    totalEarned: string;
  }>;
  
  // Admin operations
  getAllTasks(): Promise<Task[]>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<void>;
  getTasksWithDetails(): Promise<any[]>;
  getAdminStats(): Promise<{
    totalTasks: number;
    totalUsers: number;
    totalSpecialists: number;
    totalClients: number;
    activeTasks: number;
    completedTasks: number;
    totalRevenue: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Task operations
  async createTask(taskData: InsertTask & { clientId: string }): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(taskData)
      .returning();
    return task;
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getTasksByClient(clientId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.clientId, clientId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTasksBySpecialist(specialistId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.specialistId, specialistId))
      .orderBy(desc(tasks.createdAt));
  }

  async getPendingTasks(): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(or(eq(tasks.status, "created"), eq(tasks.status, "evaluating")))
      .orderBy(desc(tasks.createdAt));
  }

  async updateTaskStatus(id: number, status: string, specialistId?: string): Promise<void> {
    const updates: Partial<Task> = { 
      status: status as any,
      updatedAt: new Date()
    };
    
    if (specialistId) {
      updates.specialistId = specialistId;
    }
    
    if (status === "completed") {
      updates.completedAt = new Date();
    }

    await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id));
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<void> {
    await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id));
  }

  // Evaluation operations
  async createEvaluation(evaluationData: InsertEvaluation & { taskId: number; specialistId: string }): Promise<TaskEvaluation> {
    const [evaluation] = await db
      .insert(taskEvaluations)
      .values(evaluationData)
      .returning();
    
    // Update task status to evaluated
    await this.updateTaskStatus(evaluationData.taskId, "evaluated", evaluationData.specialistId);
    
    return evaluation;
  }

  async getEvaluationsByTask(taskId: number): Promise<TaskEvaluation[]> {
    return await db
      .select()
      .from(taskEvaluations)
      .where(eq(taskEvaluations.taskId, taskId))
      .orderBy(desc(taskEvaluations.createdAt));
  }

  async acceptEvaluation(taskId: number, evaluationId: number): Promise<void> {
    const [evaluation] = await db
      .select()
      .from(taskEvaluations)
      .where(eq(taskEvaluations.id, evaluationId));

    if (evaluation) {
      // Mark evaluation as accepted
      await db
        .update(taskEvaluations)
        .set({ acceptedByClient: true })
        .where(eq(taskEvaluations.id, evaluationId));

      // Update task with evaluation details
      await db
        .update(tasks)
        .set({
          estimatedHours: evaluation.estimatedHours,
          hourlyRate: evaluation.hourlyRate,
          totalCost: evaluation.totalCost,
          status: "evaluated",
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, taskId));
    }
  }

  // Payment operations
  async createPayment(paymentData: { taskId: number; amount: string }): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(paymentData)
      .returning();
    return payment;
  }

  async updatePaymentStatus(id: number, status: string, transactionId?: string): Promise<void> {
    const updates: Partial<Payment> = { 
      status: status as any
    };
    
    if (transactionId) {
      updates.transactionId = transactionId;
    }
    
    if (status === "paid") {
      updates.paidAt = new Date();
    }

    await db
      .update(payments)
      .set(updates)
      .where(eq(payments.id, id));
  }

  async getPaymentsByTask(taskId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.taskId, taskId))
      .orderBy(desc(payments.createdAt));
  }

  // Update operations
  async createTaskUpdate(updateData: InsertUpdate & { taskId: number; userId: string }): Promise<TaskUpdate> {
    const [update] = await db
      .insert(taskUpdates)
      .values(updateData)
      .returning();
    return update;
  }

  async getTaskUpdates(taskId: number): Promise<TaskUpdate[]> {
    return await db
      .select()
      .from(taskUpdates)
      .where(eq(taskUpdates.taskId, taskId))
      .orderBy(desc(taskUpdates.createdAt));
  }

  // Stats operations
  async getClientStats(clientId: string): Promise<{
    activeTasks: number;
    completedTasks: number;
    pendingTasks: number;
    totalSpent: string;
  }> {
    const [stats] = await db
      .select({
        activeTasks: sql<number>`count(case when status in ('in_progress', 'paid') then 1 end)`,
        completedTasks: sql<number>`count(case when status = 'completed' then 1 end)`,
        pendingTasks: sql<number>`count(case when status in ('created', 'evaluating', 'evaluated') then 1 end)`,
        totalSpent: sql<string>`coalesce(sum(case when status = 'completed' then total_cost else 0 end), 0)`,
      })
      .from(tasks)
      .where(eq(tasks.clientId, clientId));

    return stats || { activeTasks: 0, completedTasks: 0, pendingTasks: 0, totalSpent: "0" };
  }

  async getSpecialistStats(specialistId: string): Promise<{
    assignedTasks: number;
    completedTasks: number;
    pendingEvaluations: number;
    totalEarned: string;
  }> {
    const [stats] = await db
      .select({
        assignedTasks: sql<number>`count(case when status in ('in_progress', 'paid') then 1 end)`,
        completedTasks: sql<number>`count(case when status = 'completed' then 1 end)`,
        pendingEvaluations: sql<number>`count(case when status = 'created' then 1 end)`,
        totalEarned: sql<string>`coalesce(sum(case when status = 'completed' then total_cost else 0 end), 0)`,
      })
      .from(tasks)
      .where(eq(tasks.specialistId, specialistId));

    return stats || { assignedTasks: 0, completedTasks: 0, pendingEvaluations: 0, totalEarned: "0" };
  }

  // Admin operations
  async getAllTasks(): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .orderBy(desc(tasks.createdAt));
  }

  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async updateUserRole(userId: string, role: string): Promise<void> {
    await db
      .update(users)
      .set({ role: role as any, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async getTasksWithDetails(): Promise<any[]> {
    const tasksWithDetails = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        category: tasks.category,
        priority: tasks.priority,
        status: tasks.status,
        estimatedHours: tasks.estimatedHours,
        hourlyRate: tasks.hourlyRate,
        totalCost: tasks.totalCost,
        deadline: tasks.deadline,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        completedAt: tasks.completedAt,
        clientId: tasks.clientId,
        specialistId: tasks.specialistId,
        clientEmail: users.email,
        clientFirstName: users.firstName,
        clientLastName: users.lastName,
        clientProfileImageUrl: users.profileImageUrl,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.clientId, users.id))
      .orderBy(desc(tasks.createdAt));

    return tasksWithDetails;
  }

  async getAdminStats(): Promise<{
    totalTasks: number;
    totalUsers: number;
    totalSpecialists: number;
    totalClients: number;
    activeTasks: number;
    completedTasks: number;
    totalRevenue: string;
  }> {
    const [taskStats] = await db
      .select({
        totalTasks: sql<number>`count(*)`,
        activeTasks: sql<number>`count(case when status in ('created', 'evaluating', 'evaluated', 'paid', 'in_progress') then 1 end)`,
        completedTasks: sql<number>`count(case when status = 'completed' then 1 end)`,
        totalRevenue: sql<string>`coalesce(sum(case when status = 'completed' then total_cost else 0 end), 0)`,
      })
      .from(tasks);

    const [userStats] = await db
      .select({
        totalUsers: sql<number>`count(*)`,
        totalSpecialists: sql<number>`count(case when role = 'specialist' then 1 end)`,
        totalClients: sql<number>`count(case when role = 'client' then 1 end)`,
      })
      .from(users);

    return {
      totalTasks: taskStats?.totalTasks || 0,
      totalUsers: userStats?.totalUsers || 0,
      totalSpecialists: userStats?.totalSpecialists || 0,
      totalClients: userStats?.totalClients || 0,
      activeTasks: taskStats?.activeTasks || 0,
      completedTasks: taskStats?.completedTasks || 0,
      totalRevenue: taskStats?.totalRevenue || "0",
    };
  }
}

export const storage = new DatabaseStorage();
