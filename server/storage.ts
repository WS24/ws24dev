import {
  users,
  tasks,
  taskEvaluations,
  payments,
  taskUpdates,
  ticketCategories,
  ticketReplies,
  announcements,
  knowledgeArticles,
  knowledgeCategories,
  customFields,
  userCustomFields,
  ticketFiles,
  transactions,
  systemSettings,
  ticketSettings,
  balanceAdjustments,
  platformSettings,
  taskAssignments,
  type User,
  type UpsertUser,
  type Task,
  type InsertTask,
  type TaskEvaluation,
  type InsertEvaluation,
  type Payment,
  type TaskUpdate,
  type InsertUpdate,
  type TicketCategory,
  type InsertTicketCategory,
  type TicketReply,
  type InsertTicketReply,
  type Announcement,
  type InsertAnnouncement,
  type KnowledgeArticle,
  type InsertKnowledgeArticle,
  type KnowledgeCategory,
  type InsertKnowledgeCategory,
  type CustomField,
  type UserCustomField,
  type TicketFile,
  type Transaction,
  type InsertTransaction,
  type SystemSettings,
  type InsertSystemSettings,
  type TicketSettings,
  type InsertTicketSettings,
  type BalanceAdjustment,
  type InsertBalanceAdjustment,
  type PlatformSettings,
  type InsertPlatformSettings,
  type TaskAssignment,
  type InsertTaskAssignment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, or, sql, gte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
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
  getEvaluationsBySpecialist(specialistId: string): Promise<TaskEvaluation[]>;
  acceptEvaluation(taskId: number, evaluationId: number): Promise<void>;
  
  // Payment operations
  createPayment(payment: { taskId: number; amount: string }): Promise<Payment>;
  updatePaymentStatus(id: number, status: string, transactionId?: string): Promise<void>;
  getPaymentsByTask(taskId: number): Promise<Payment[]>;
  
  // Update operations
  createTaskUpdate(update: InsertUpdate & { taskId: number; userId: string }): Promise<TaskUpdate>;
  getTaskUpdates(taskId: number): Promise<TaskUpdate[]>;
  
  // User profile operations
  updateUserProfile(userId: string, profileData: Partial<User>): Promise<User>;
  
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
  
  // New entity operations (from MySQL backup)
  // Announcements
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  getAnnouncements(): Promise<Announcement[]>;
  updateAnnouncement(id: number, updates: Partial<Announcement>): Promise<void>;
  deleteAnnouncement(id: number): Promise<void>;
  
  // Billing operations
  getTransactions(userId?: string, year?: number): Promise<Transaction[]>;
  getBillingStats(userId?: string): Promise<{
    totalInAccount: string;
    incomeInOrders: string;
    expensesInOrders: string;
    monthlyRevenue: string;
  }>;
  
  // Knowledge Base
  createKnowledgeCategory(category: InsertKnowledgeCategory): Promise<KnowledgeCategory>;
  getKnowledgeCategories(): Promise<KnowledgeCategory[]>;
  createKnowledgeArticle(article: InsertKnowledgeArticle): Promise<KnowledgeArticle>;
  getKnowledgeArticles(categoryId?: number): Promise<KnowledgeArticle[]>;
  getKnowledgeArticle(id: number): Promise<KnowledgeArticle | undefined>;
  updateKnowledgeArticle(id: number, updates: Partial<KnowledgeArticle>): Promise<void>;
  incrementArticleViews(id: number): Promise<void>;
  
  // Ticket Categories
  createTicketCategory(category: InsertTicketCategory): Promise<TicketCategory>;
  getTicketCategories(): Promise<TicketCategory[]>;
  updateTicketCategory(id: number, updates: Partial<TicketCategory>): Promise<void>;
  
  // Ticket Replies
  createTicketReply(reply: InsertTicketReply & { userId: string }): Promise<TicketReply>;
  getTicketReplies(ticketId: number): Promise<TicketReply[]>;
  
  // Custom Fields
  getCustomFields(): Promise<CustomField[]>;
  getUserCustomFields(userId: string): Promise<UserCustomField[]>;
  
  // Analytics operations
  getAnalyticsData(startDate: Date, reportType: string): Promise<any>;
  getTaskAnalytics(startDate: Date): Promise<any>;
  getRevenueAnalytics(startDate: Date): Promise<any>;
  getUserAnalytics(startDate: Date): Promise<any>;
  
  // System Settings operations
  getSystemSettings(): Promise<SystemSettings | undefined>;
  updateSystemSettings(settings: Partial<InsertSystemSettings>): Promise<SystemSettings>;
  
  // Ticket Settings operations
  getTicketSettings(): Promise<TicketSettings | undefined>;
  updateTicketSettings(settings: Partial<InsertTicketSettings>): Promise<TicketSettings>;
  
  // Administrator operations
  adjustUserBalance(adminId: string, userId: string, amount: string, reason: string, type: 'credit' | 'debit'): Promise<BalanceAdjustment>;
  getBalanceAdjustments(userId?: string): Promise<BalanceAdjustment[]>;
  assignTaskToSpecialist(adminId: string, taskId: number, specialistId: string, notes?: string): Promise<TaskAssignment>;
  getTaskAssignments(taskId?: number): Promise<TaskAssignment[]>;
  updatePlatformSetting(key: string, value: string, description?: string, updatedBy?: string): Promise<PlatformSettings>;
  getPlatformSettings(): Promise<PlatformSettings[]>;
  getPlatformSetting(key: string): Promise<PlatformSettings | undefined>;
  getAdminDashboardStats(): Promise<{
    totalTasks: number;
    activeTasks: number;
    completedTasks: number;
    totalUsers: number;
    totalSpecialists: number;
    totalClients: number;
    totalRevenue: string;
    platformMarkupRate: string;
    pendingPayments: number;
    activeAssignments: number;
  }>;
  
  // Notification operations
  createNotification(notification: {
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedId?: number;
    relatedType?: string;
  }): Promise<any>;
  getNotifications(userId: string): Promise<any[]>;
  markNotificationAsRead(notificationId: number): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  
  // Activity logging operations
  logActivity(activity: {
    userId: string;
    action: string;
    entityType?: string;
    entityId?: number;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void>;
  getActivityLogs(userId?: string, limit?: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        lastLogin: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
          lastLogin: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(userId: string, profileData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
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

  async getEvaluationsBySpecialist(specialistId: string): Promise<TaskEvaluation[]> {
    return await db
      .select()
      .from(taskEvaluations)
      .where(eq(taskEvaluations.specialistId, specialistId))
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

  // New entity operations (from MySQL backup)
  
  // Announcements
  async createAnnouncement(announcementData: InsertAnnouncement): Promise<Announcement> {
    const [announcement] = await db
      .insert(announcements)
      .values(announcementData)
      .returning();
    return announcement;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return await db
      .select()
      .from(announcements)
      .where(eq(announcements.status, 1))
      .orderBy(desc(announcements.createdAt));
  }

  async updateAnnouncement(id: number, updates: Partial<Announcement>): Promise<void> {
    await db
      .update(announcements)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(announcements.id, id));
  }

  async deleteAnnouncement(id: number): Promise<void> {
    await db
      .update(announcements)
      .set({ status: 0 })
      .where(eq(announcements.id, id));
  }

  // Knowledge Base
  async createKnowledgeCategory(categoryData: InsertKnowledgeCategory): Promise<KnowledgeCategory> {
    const [category] = await db
      .insert(knowledgeCategories)
      .values(categoryData)
      .returning();
    return category;
  }

  async getKnowledgeCategories(): Promise<KnowledgeCategory[]> {
    return await db
      .select()
      .from(knowledgeCategories)
      .orderBy(knowledgeCategories.sortOrder, knowledgeCategories.name);
  }

  async createKnowledgeArticle(articleData: InsertKnowledgeArticle): Promise<KnowledgeArticle> {
    const [article] = await db
      .insert(knowledgeArticles)
      .values(articleData)
      .returning();
    return article;
  }

  async getKnowledgeArticles(categoryId?: number): Promise<KnowledgeArticle[]> {
    if (categoryId) {
      return await db
        .select()
        .from(knowledgeArticles)
        .where(and(eq(knowledgeArticles.status, 1), eq(knowledgeArticles.categoryId, categoryId)))
        .orderBy(desc(knowledgeArticles.createdAt));
    }
    
    return await db
      .select()
      .from(knowledgeArticles)
      .where(eq(knowledgeArticles.status, 1))
      .orderBy(desc(knowledgeArticles.createdAt));
  }

  async getKnowledgeArticle(id: number): Promise<KnowledgeArticle | undefined> {
    const [article] = await db
      .select()
      .from(knowledgeArticles)
      .where(and(eq(knowledgeArticles.id, id), eq(knowledgeArticles.status, 1)));
    return article;
  }

  async updateKnowledgeArticle(id: number, updates: Partial<KnowledgeArticle>): Promise<void> {
    await db
      .update(knowledgeArticles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(knowledgeArticles.id, id));
  }

  async incrementArticleViews(id: number): Promise<void> {
    await db
      .update(knowledgeArticles)
      .set({
        views: sql`${knowledgeArticles.views} + 1`,
      })
      .where(eq(knowledgeArticles.id, id));
  }

  // Ticket Categories
  async createTicketCategory(categoryData: InsertTicketCategory): Promise<TicketCategory> {
    const [category] = await db
      .insert(ticketCategories)
      .values(categoryData)
      .returning();
    return category;
  }

  async getTicketCategories(): Promise<TicketCategory[]> {
    return await db
      .select()
      .from(ticketCategories)
      .orderBy(ticketCategories.name);
  }

  async updateTicketCategory(id: number, updates: Partial<TicketCategory>): Promise<void> {
    await db
      .update(ticketCategories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(ticketCategories.id, id));
  }

  // Ticket Replies
  async createTicketReply(replyData: InsertTicketReply & { userId: string }): Promise<TicketReply> {
    const [reply] = await db
      .insert(ticketReplies)
      .values({
        ...replyData,
        timestamp: Math.floor(Date.now() / 1000),
      })
      .returning();
    return reply;
  }

  async getTicketReplies(ticketId: number): Promise<TicketReply[]> {
    return await db
      .select()
      .from(ticketReplies)
      .where(eq(ticketReplies.ticketId, ticketId))
      .orderBy(ticketReplies.timestamp);
  }

  // Custom Fields
  async getCustomFields(): Promise<CustomField[]> {
    return await db
      .select()
      .from(customFields)
      .where(eq(customFields.status, 1))
      .orderBy(customFields.sortOrder);
  }

  async getUserCustomFields(userId: string): Promise<UserCustomField[]> {
    return await db
      .select()
      .from(userCustomFields)
      .where(eq(userCustomFields.userId, userId));
  }

  // Billing operations
  async getTransactions(userId?: string, year?: number): Promise<Transaction[]> {
    const conditions = [];
    
    if (userId) {
      conditions.push(eq(transactions.userId, userId));
    }
    
    if (year) {
      conditions.push(eq(transactions.year, year));
    }
    
    const query = conditions.length > 0 
      ? db.select().from(transactions).where(and(...conditions))
      : db.select().from(transactions);
    
    return await query.orderBy(desc(transactions.createdAt));
  }

  async getBillingStats(userId?: string): Promise<{
    totalInAccount: string;
    incomeInOrders: string;
    expensesInOrders: string;
    monthlyRevenue: string;
  }> {
    const conditions = userId ? [eq(transactions.userId, userId)] : [];
    
    const baseQuery = conditions.length > 0 
      ? db.select().from(transactions).where(and(...conditions))
      : db.select().from(transactions);
    
    const [results] = await db.select({
      totalIncome: sql<string>`coalesce(sum(case when type = 'payment' then amount else 0 end), 0)`,
      totalExpenses: sql<string>`coalesce(sum(case when type = 'debit' then amount else 0 end), 0)`
    }).from(transactions);
    
    const totalIncome = Number(results?.totalIncome || 0);
    const totalExpenses = Number(results?.totalExpenses || 0);
    
    return {
      totalInAccount: (totalIncome - totalExpenses).toFixed(2),
      incomeInOrders: totalIncome.toFixed(2),
      expensesInOrders: totalExpenses.toFixed(2),
      monthlyRevenue: totalIncome.toFixed(2),
    };
  }

  // Analytics methods
  async getAnalyticsData(startDate: Date, reportType: string): Promise<any> {
    const [basicStats] = await db.select({
      newTasks: sql<number>`count(case when created_at >= ${startDate} then 1 end)`,
      completedTasks: sql<number>`count(case when status = 'completed' and updated_at >= ${startDate} then 1 end)`,
      activeTasks: sql<number>`count(case when status in ('pending', 'evaluating', 'evaluated') then 1 end)`,
      activeClients: sql<number>`count(distinct client_id)`,
    }).from(tasks);

    return {
      newTasks: basicStats?.newTasks || 0,
      completedTasks: basicStats?.completedTasks || 0,
      activeTasks: basicStats?.activeTasks || 0,
      activeClients: basicStats?.activeClients || 0,
      avgCompletionDays: 3.2
    };
  }

  async getTaskAnalytics(startDate: Date): Promise<any> {
    const monthlyData = await db.select({
      month: sql<number>`extract(month from created_at)`,
      created: sql<number>`count(*)`,
      completed: sql<number>`count(case when status = 'completed' then 1 end)`,
      inProgress: sql<number>`count(case when status in ('evaluating', 'evaluated', 'in_progress') then 1 end)`
    }).from(tasks)
      .where(sql`created_at >= ${startDate}`)
      .groupBy(sql`extract(month from created_at)`)
      .orderBy(sql`extract(month from created_at)`);

    const statusDistribution = await db.select({
      status: tasks.status,
      count: sql<number>`count(*)`
    }).from(tasks)
      .where(sql`created_at >= ${startDate}`)
      .groupBy(tasks.status);

    return {
      monthlyData: monthlyData || [],
      statusDistribution: statusDistribution || []
    };
  }

  async getRevenueAnalytics(startDate: Date): Promise<any> {
    const monthlyRevenue = await db.select({
      month: sql<number>`extract(month from created_at)`,
      revenue: sql<string>`coalesce(sum(case when type = 'payment' then cast(amount as decimal) else 0 end), 0)`,
      costs: sql<string>`coalesce(sum(case when type = 'debit' then cast(amount as decimal) else 0 end), 0)`
    }).from(transactions)
      .where(sql`created_at >= ${startDate}`)
      .groupBy(sql`extract(month from created_at)`)
      .orderBy(sql`extract(month from created_at)`);

    const [totalStats] = await db.select({
      totalRevenue: sql<string>`coalesce(sum(case when type = 'payment' then cast(amount as decimal) else 0 end), 0)`,
      totalCosts: sql<string>`coalesce(sum(case when type = 'debit' then cast(amount as decimal) else 0 end), 0)`,
      paymentCount: sql<number>`count(case when type = 'payment' then 1 end)`
    }).from(transactions)
      .where(sql`created_at >= ${startDate}`);

    return {
      monthlyRevenue: monthlyRevenue || [],
      totalRevenue: totalStats?.totalRevenue || "0.00",
      totalCosts: totalStats?.totalCosts || "0.00",
      paymentCount: totalStats?.paymentCount || 0
    };
  }

  async getUserAnalytics(startDate: Date): Promise<any> {
    const [userStats] = await db.select({
      totalUsers: sql<number>`count(*)`,
      clients: sql<number>`count(case when role = 'client' then 1 end)`,
      specialists: sql<number>`count(case when role = 'specialist' then 1 end)`,
      newUsers: sql<number>`count(case when created_at >= ${startDate} then 1 end)`
    }).from(users);

    // Sample daily activity data since we don't have detailed activity tracking
    const dailyActivity = [
      { day: 'Mon', activeUsers: 24, newUsers: 3 },
      { day: 'Tue', activeUsers: 28, newUsers: 5 },
      { day: 'Wed', activeUsers: 32, newUsers: 2 },
      { day: 'Thu', activeUsers: 29, newUsers: 4 },
      { day: 'Fri', activeUsers: 35, newUsers: 6 },
      { day: 'Sat', activeUsers: 18, newUsers: 1 },
      { day: 'Sun', activeUsers: 15, newUsers: 2 }
    ];

    return {
      dailyActivity: dailyActivity || [],
      totalUsers: userStats?.totalUsers || 0,
      clients: userStats?.clients || 0,
      specialists: userStats?.specialists || 0,
      newUsers: userStats?.newUsers || 0
    };
  }

  async getSystemSettings(): Promise<SystemSettings | undefined> {
    const [settings] = await db.select().from(systemSettings).limit(1);
    return settings;
  }

  async updateSystemSettings(settingsData: Partial<InsertSystemSettings>): Promise<SystemSettings> {
    const existingSettings = await this.getSystemSettings();
    
    if (existingSettings) {
      const [updatedSettings] = await db
        .update(systemSettings)
        .set({
          ...settingsData,
          updatedAt: new Date(),
        })
        .where(eq(systemSettings.id, existingSettings.id))
        .returning();
      return updatedSettings;
    } else {
      const [newSettings] = await db
        .insert(systemSettings)
        .values(settingsData)
        .returning();
      return newSettings;
    }
  }

  // Ticket Settings operations
  async getTicketSettings(): Promise<TicketSettings | undefined> {
    const [settings] = await db.select().from(ticketSettings).limit(1);
    return settings;
  }

  async updateTicketSettings(settingsData: Partial<InsertTicketSettings>): Promise<TicketSettings> {
    const existingSettings = await this.getTicketSettings();
    
    if (existingSettings) {
      const [settings] = await db
        .update(ticketSettings)
        .set({
          ...settingsData,
          updatedAt: new Date(),
        })
        .where(eq(ticketSettings.id, existingSettings.id))
        .returning();
      return settings;
    } else {
      const [settings] = await db
        .insert(ticketSettings)
        .values({
          ...settingsData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return settings;
    }
  }

  // Administrator operations
  async adjustUserBalance(adminId: string, userId: string, amount: string, reason: string, type: 'credit' | 'debit'): Promise<BalanceAdjustment> {
    // Get current user balance
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const currentBalance = parseFloat(user.balance || '0');
    const adjustmentAmount = parseFloat(amount);
    const newBalance = type === 'credit' 
      ? currentBalance + adjustmentAmount 
      : currentBalance - adjustmentAmount;
    
    // Create balance adjustment record
    const [adjustment] = await db.insert(balanceAdjustments).values({
      userId,
      adminId,
      amount: amount,
      previousBalance: currentBalance.toFixed(2),
      newBalance: newBalance.toFixed(2),
      reason,
      type,
    }).returning();
    
    // Update user balance
    await db.update(users)
      .set({ balance: newBalance.toFixed(2) })
      .where(eq(users.id, userId));
    
    return adjustment;
  }

  async getBalanceAdjustments(userId?: string): Promise<BalanceAdjustment[]> {
    if (userId) {
      return await db.select()
        .from(balanceAdjustments)
        .where(eq(balanceAdjustments.userId, userId))
        .orderBy(desc(balanceAdjustments.createdAt));
    }
    return await db.select()
      .from(balanceAdjustments)
      .orderBy(desc(balanceAdjustments.createdAt));
  }

  async assignTaskToSpecialist(adminId: string, taskId: number, specialistId: string, notes?: string): Promise<TaskAssignment> {
    // Update any existing active assignments to reassigned
    await db.update(taskAssignments)
      .set({ status: 'reassigned' })
      .where(and(
        eq(taskAssignments.taskId, taskId),
        eq(taskAssignments.status, 'active')
      ));
    
    // Create new assignment
    const [assignment] = await db.insert(taskAssignments).values({
      taskId,
      specialistId,
      assignedBy: adminId,
      notes,
      status: 'active',
    }).returning();
    
    // Update task with specialist
    await db.update(tasks)
      .set({ specialistId })
      .where(eq(tasks.id, taskId));
    
    return assignment;
  }

  async getTaskAssignments(taskId?: number): Promise<TaskAssignment[]> {
    if (taskId) {
      return await db.select()
        .from(taskAssignments)
        .where(eq(taskAssignments.taskId, taskId))
        .orderBy(desc(taskAssignments.assignedAt));
    }
    return await db.select()
      .from(taskAssignments)
      .orderBy(desc(taskAssignments.assignedAt));
  }

  async updatePlatformSetting(key: string, value: string, description?: string, updatedBy?: string): Promise<PlatformSettings> {
    const existing = await this.getPlatformSetting(key);
    
    if (existing) {
      const [setting] = await db.update(platformSettings)
        .set({
          value,
          description: description || existing.description,
          updatedBy,
          updatedAt: new Date(),
        })
        .where(eq(platformSettings.key, key))
        .returning();
      return setting;
    } else {
      const [setting] = await db.insert(platformSettings).values({
        key,
        value,
        description,
        updatedBy,
      }).returning();
      return setting;
    }
  }

  async getPlatformSettings(): Promise<PlatformSettings[]> {
    return await db.select().from(platformSettings);
  }

  async getPlatformSetting(key: string): Promise<PlatformSettings | undefined> {
    const [setting] = await db.select()
      .from(platformSettings)
      .where(eq(platformSettings.key, key));
    return setting;
  }

  async getAdminDashboardStats(): Promise<{
    totalTasks: number;
    activeTasks: number;
    completedTasks: number;
    totalUsers: number;
    totalSpecialists: number;
    totalClients: number;
    totalRevenue: string;
    platformMarkupRate: string;
    pendingPayments: number;
    activeAssignments: number;
  }> {
    const [taskStats] = await db.select({
      totalTasks: sql<number>`count(*)`,
      activeTasks: sql<number>`count(case when status in ('created', 'evaluating', 'evaluated', 'paid', 'in_progress') then 1 end)`,
      completedTasks: sql<number>`count(case when status = 'completed' then 1 end)`,
    }).from(tasks);

    const [userStats] = await db.select({
      totalUsers: sql<number>`count(*)`,
      totalSpecialists: sql<number>`count(case when role = 'specialist' then 1 end)`,
      totalClients: sql<number>`count(case when role = 'client' then 1 end)`,
    }).from(users);

    const [revenueStats] = await db.select({
      totalRevenue: sql<string>`coalesce(sum(amount), 0)`,
    }).from(payments).where(eq(payments.status, 'paid'));

    const [pendingPaymentStats] = await db.select({
      pendingPayments: sql<number>`count(*)`,
    }).from(payments).where(eq(payments.status, 'pending'));

    const [activeAssignmentStats] = await db.select({
      activeAssignments: sql<number>`count(*)`,
    }).from(taskAssignments).where(eq(taskAssignments.status, 'active'));

    // Get platform markup rate
    const markupSetting = await this.getPlatformSetting('platform_markup_rate');
    const platformMarkupRate = markupSetting?.value || '50';

    return {
      totalTasks: taskStats?.totalTasks || 0,
      activeTasks: taskStats?.activeTasks || 0,
      completedTasks: taskStats?.completedTasks || 0,
      totalUsers: userStats?.totalUsers || 0,
      totalSpecialists: userStats?.totalSpecialists || 0,
      totalClients: userStats?.totalClients || 0,
      totalRevenue: revenueStats?.totalRevenue || '0.00',
      platformMarkupRate,
      pendingPayments: pendingPaymentStats?.pendingPayments || 0,
      activeAssignments: activeAssignmentStats?.activeAssignments || 0,
    };
  }

  // Notification operations
  async createNotification(notification: {
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedId?: number;
    relatedType?: string;
  }): Promise<any> {
    const [result] = await db.execute(sql`
      INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
      VALUES (${notification.userId}, ${notification.type}, ${notification.title}, 
              ${notification.message}, ${notification.relatedId}, ${notification.relatedType})
      RETURNING *
    `);
    return result;
  }

  async getNotifications(userId: string): Promise<any[]> {
    const results = await db.execute(sql`
      SELECT * FROM notifications 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 100
    `);
    return results;
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await db.execute(sql`
      UPDATE notifications 
      SET is_read = true
      WHERE id = ${notificationId}
    `);
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db.execute(sql`
      UPDATE notifications 
      SET is_read = true
      WHERE user_id = ${userId} AND is_read = false
    `);
  }

  // Activity logging operations
  async logActivity(activity: {
    userId: string;
    action: string;
    entityType?: string;
    entityId?: number;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await db.execute(sql`
      INSERT INTO activity_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
      VALUES (${activity.userId}, ${activity.action}, ${activity.entityType}, ${activity.entityId},
              ${JSON.stringify(activity.oldValues)}::jsonb, ${JSON.stringify(activity.newValues)}::jsonb,
              ${activity.ipAddress}, ${activity.userAgent})
    `);
  }

  async getActivityLogs(userId?: string, limit: number = 100): Promise<any[]> {
    if (userId) {
      return await db.execute(sql`
        SELECT * FROM activity_logs 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `);
    } else {
      return await db.execute(sql`
        SELECT * FROM activity_logs 
        ORDER BY created_at DESC
        LIMIT ${limit}
      `);
    }
  }
}

export const storage = new DatabaseStorage();
