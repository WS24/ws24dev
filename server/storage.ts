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
  invoices,
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
  type Invoice,
  type InsertInvoice,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, or, sql, gte, ne, lt, isNotNull } from "drizzle-orm";

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
  createPayment(payment: Partial<Payment>): Promise<Payment>;
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
  
  // Per-ticket field updates (avoid name collision with global ticket settings)
  updateTicketFields(ticketId: number, updates: any): Promise<void>;
  
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
  
  // Helpdesk operations
  getHelpdeskDashboardStats(): Promise<{
    totalTickets: number;
    activeTickets: number;
    overdueTickets: number;
    totalUsers: number;
    activeSpecialists: number;
    totalRevenue: string;
    revenueThisMonth: string;
    newTicketsThisWeek: number;
  }>;
  getRecentHelpdeskActivity(limit: number): Promise<any[]>;
  getTicketDetails(ticketId: number): Promise<any>;
  getTicketMessages(ticketId: number, userId: string, userRole: string): Promise<any[]>;
  createTicketMessage(message: {
    ticketId: number;
    userId: string;
    message: string;
    isInternal: boolean;
  }): Promise<any>;
  getTicketChangeLog(ticketId: number): Promise<any[]>;
  updateTicketFields(ticketId: number, updates: any): Promise<void>;
  getTicketAttachments(ticketId: number): Promise<any[]>;
  createTicketAttachment(attachment: {
    ticketId: number;
    userId: string;
    name: string;
    size: string;
    url: string;
  }): Promise<any>;

  // Billing and Payment operations
  getUserBalance(userId: string): Promise<string>;
  updateUserBalance(userId: string, amount: number, operation: 'add' | 'subtract'): Promise<void>;
  getPaymentById(paymentId: number): Promise<Payment | undefined>;
  getUserPayments(userId: string): Promise<Payment[]>;
  getTransactionHistory(userId: string, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoiceById(invoiceId: number): Promise<Invoice | undefined>;
  getUserInvoices(userId: string): Promise<Invoice[]>;
  updateInvoiceStatus(invoiceId: number, status: string): Promise<void>;
  processTaskPayment(taskId: number, clientId: string, amount: number): Promise<{ paymentId: number; transactionId: string }>;
  processSpecialistPayout(taskId: number): Promise<void>;
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
  async createPayment(payment: { amount: string } & Partial<Payment>): Promise<Payment> {
    const { amount, ...rest } = payment;
    const [newPayment] = await db
      .insert(payments)
      .values({ amount, ...rest })
      .returning();
    return newPayment;
  }

  async updatePaymentStatus(id: number, status: string, transactionId?: string): Promise<void> {
    await db
      .update(payments)
      .set({ 
        status,
        transactionId: transactionId ?? payments.transactionId,
        paidAt: status === 'completed' || status === 'paid' ? new Date() : null
      })
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
  async createNotification(_notification: {
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedId?: number;
    relatedType?: string;
  }): Promise<any> {
    // Notifications table not defined; return mock-like response
    return { id: Date.now(), createdAt: new Date(), ..._notification } as any;
  }

  async getNotifications(_userId: string): Promise<any[]> {
    // Notifications table not defined; return empty list
    return [];
  }

  async markNotificationAsRead(_notificationId: number): Promise<void> {
    return;
  }

  async markAllNotificationsAsRead(_userId: string): Promise<void> {
    return;
  }

  // Activity logging operations
  async logActivity(_activity: {
    userId: string;
    action: string;
    entityType?: string;
    entityId?: number;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    return;
  }

  async getActivityLogs(_userId?: string, _limit: number = 100): Promise<any[]> {
    return [];
  }

  async getHelpdeskDashboardStats(): Promise<{
    totalTickets: number;
    activeTickets: number;
    overdueTickets: number;
    totalUsers: number;
    activeSpecialists: number;
    totalRevenue: string;
    revenueThisMonth: string;
    newTicketsThisWeek: number;
  }> {
    const [totalTicketsResult] = await db.select({ count: sql`count(*)` }).from(tasks);
    const totalTickets = Number(totalTicketsResult.count);

    const [activeTicketsResult] = await db.select({ count: sql`count(*)` })
      .from(tasks)
      .where(and(
        ne(tasks.status, "Completed"),
        ne(tasks.status, "Rejected")
      ));
    const activeTickets = Number(activeTicketsResult.count);

    const now = new Date();
    const [overdueResult] = await db.select({ count: sql`count(*)` })
      .from(tasks)
      .where(and(
        ne(tasks.status, "Completed"),
        ne(tasks.status, "Rejected"),
        isNotNull(tasks.deadline),
        lt(tasks.deadline, now)
      ));
    const overdueTickets = Number(overdueResult.count);

    const [totalUsersResult] = await db.select({ count: sql`count(*)` }).from(users);
    const totalUsers = Number(totalUsersResult.count);

    const [specialistsResult] = await db.select({ count: sql`count(*)` })
      .from(users)
      .where(eq(users.role, "specialist"));
    const activeSpecialists = Number(specialistsResult.count);

    const [revenueResult] = await db.select({ total: sql`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)` })
      .from(payments)
      .where(eq(payments.status, "completed"));
    const totalRevenue = revenueResult.total?.toString() || "0";

    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [monthlyRevenueResult] = await db.select({ total: sql`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)` })
      .from(payments)
      .where(and(
        eq(payments.status, "completed"),
        gte(payments.createdAt, firstDayOfMonth)
      ));
    const revenueThisMonth = monthlyRevenueResult.total?.toString() || "0";

    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const [newTicketsResult] = await db.select({ count: sql`count(*)` })
      .from(tasks)
      .where(gte(tasks.createdAt, oneWeekAgo));
    const newTicketsThisWeek = Number(newTicketsResult.count);

    return {
      totalTickets,
      activeTickets,
      overdueTickets,
      totalUsers,
      activeSpecialists,
      totalRevenue,
      revenueThisMonth,
      newTicketsThisWeek
    };
  }

  async getRecentHelpdeskActivity(limit: number): Promise<any[]> {
    const recentTasks = await db.select({
      description: sql`'New ticket created: ' || ${tasks.title}`,
      createdAt: tasks.createdAt
    })
    .from(tasks)
    .orderBy(desc(tasks.createdAt))
    .limit(limit / 2);

    const recentMessages = await db.select({
      description: sql`'New message on ticket #' || ${taskUpdates.taskId}`,
      createdAt: taskUpdates.createdAt
    })
    .from(taskUpdates)
    .orderBy(desc(taskUpdates.createdAt))
    .limit(limit / 2);

    const combined = [...recentTasks, ...recentMessages]
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);

    return combined;
  }

  async getTicketDetails(ticketId: number): Promise<any> {
    const [ticket] = await db.select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      category: tasks.category,
      clientId: tasks.clientId,
      specialistId: tasks.specialistId,
      estimatedHours: tasks.estimatedHours,
      createdAt: tasks.createdAt,
      completedAt: tasks.completedAt,
      clientName: sql`(SELECT username FROM ${users} WHERE id = ${tasks.clientId})`,
      specialistName: sql`(SELECT username FROM ${users} WHERE id = ${tasks.specialistId})`,
      quotedCost: sql`(SELECT total_cost FROM ${taskEvaluations} WHERE task_id = ${tasks.id} AND accepted_by_client = true LIMIT 1)`,
      adminApproval: sql`CASE WHEN EXISTS (SELECT 1 FROM ${taskAssignments} WHERE task_id = ${tasks.id} AND status = 'approved') THEN true ELSE false END`
    })
    .from(tasks)
    .where(eq(tasks.id, ticketId));

    return ticket;
  }

  async getTicketMessages(ticketId: number, userId: string, userRole: string): Promise<any[]> {
    let query = db.select({
      id: taskUpdates.id,
      message: taskUpdates.content,
      userId: taskUpdates.userId,
      userName: sql`(SELECT username FROM ${users} WHERE id = ${taskUpdates.userId})`,
      createdAt: taskUpdates.createdAt,
      isInternal: sql`false`
    })
    .from(taskUpdates)
    .where(eq(taskUpdates.taskId, ticketId));

    const messages = await query.orderBy(taskUpdates.createdAt);
    return messages;
  }

  async createTicketMessage(message: {
    ticketId: number;
    userId: string;
    message: string;
    isInternal: boolean;
  }): Promise<any> {
    const messageText = message.isInternal ? `[Internal] ${message.message}` : message.message;
    
    const [newMessage] = await db.insert(taskUpdates)
      .values({
        taskId: message.ticketId,
        userId: message.userId,
        content: messageText,
        type: 'comment'
      })
      .returning();

    return {
      ...newMessage,
      userName: await this.getUser(message.userId).then(u => u?.username),
      isInternal: message.isInternal
    };
  }

  async getTicketChangeLog(ticketId: number): Promise<any[]> {
    // Activity logs table is not defined in schema; return empty for now
    return [];
  }

  async updateTicketFields(ticketId: number, updates: any): Promise<void> {
    const updateData: any = {};
    
    if (updates.status) updateData.status = updates.status;
    if (updates.priority) updateData.priority = updates.priority;
    if (updates.deadline) updateData.deadline = new Date(updates.deadline);
    if (updates.quotedCost) {
      // Update the accepted evaluation with new cost
      await db.update(taskEvaluations)
        .set({ totalCost: updates.quotedCost })
        .where(and(
          eq(taskEvaluations.taskId, ticketId),
          eq(taskEvaluations.acceptedByClient, true)
        ));
    }
    
    if (Object.keys(updateData).length > 0) {
      await db.update(tasks)
        .set(updateData)
        .where(eq(tasks.id, ticketId));
    }

    // Handle admin approval
    if (updates.adminApproval !== undefined) {
      if (updates.adminApproval) {
        await db.insert(taskAssignments)
          .values({
            taskId: ticketId,
            assignedBy: "system",
            specialistId: "system",
            status: "approved"
          })
          .onConflictDoUpdate({
            target: [taskAssignments.taskId],
            set: { status: "approved" }
          });
      }
    }
  }

  async getTicketAttachments(ticketId: number): Promise<any[]> {
    // Since we don't have a dedicated attachments table, return empty array
    // In a real implementation, you would query the attachments table
    return [];
  }

  async createTicketAttachment(attachment: {
    ticketId: number;
    userId: string;
    name: string;
    size: string;
    url: string;
  }): Promise<any> {
    // In a real implementation, you would insert into attachments table
    // For now, return a mock response
    return {
      id: Date.now(),
      ...attachment,
      createdAt: new Date()
    };
  }

  // Billing and Payment operations
  async getUserBalance(userId: string): Promise<string> {
    const user = await this.getUser(userId);
    return user?.balance || '0.00';
  }

  async updateUserBalance(userId: string, amount: number, operation: 'add' | 'subtract'): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    const currentBalance = parseFloat(user.balance || '0');
    const newBalance = operation === 'add' 
      ? currentBalance + amount 
      : currentBalance - amount;
    
    if (newBalance < 0) throw new Error('Insufficient balance');
    
    await db
      .update(users)
      .set({ balance: newBalance.toFixed(2) })
      .where(eq(users.id, userId));
  }


  async getPaymentById(paymentId: number): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId));
    return payment;
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(or(
        eq(payments.fromUserId, userId),
        eq(payments.toUserId, userId)
      ))
      .orderBy(desc(payments.createdAt));
  }

  async getTransactionHistory(userId: string, limit?: number): Promise<Transaction[]> {
    const query = db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
    
    if (limit) {
      return await query.limit(limit);
    }
    return await query;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db
      .insert(invoices)
      .values(invoice)
      .returning();
    return newInvoice;
  }

  async getInvoiceById(invoiceId: number): Promise<Invoice | undefined> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId));
    return invoice;
  }

  async getUserInvoices(userId: string): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.createdAt));
  }

  async updateInvoiceStatus(invoiceId: number, status: string): Promise<void> {
    await db
      .update(invoices)
      .set({ 
        status,
        paidDate: status === 'paid' ? new Date() : null,
        updatedAt: new Date()
      })
      .where(eq(invoices.id, invoiceId));
  }

  async processTaskPayment(taskId: number, clientId: string, amount: number): Promise<{ paymentId: number; transactionId: string }> {
    // Get platform settings for markup
    const markupSetting = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.key, 'payment_markup_percentage'));
    
    const markupPercentage = markupSetting[0]?.value ? parseFloat(markupSetting[0].value) : 100;
    const markupAmount = amount * (markupPercentage / 100);
    const totalAmount = amount + markupAmount;
    
    // Check client balance
    const clientBalance = parseFloat(await this.getUserBalance(clientId));
    if (clientBalance < totalAmount) {
      throw new Error('Insufficient balance');
    }
    
    // Create payment record
    const payment = await this.createPayment({
      taskId,
      amount: totalAmount.toFixed(2),
      status: 'completed',
      paymentType: 'task',
      fromUserId: clientId,
      markupAmount: markupAmount.toFixed(2),
      specialistAmount: amount.toFixed(2),
      paymentMethod: 'balance',
      paidAt: new Date()
    });
    
    // Deduct from client balance
    await this.updateUserBalance(clientId, totalAmount, 'subtract');
    
    // Create transaction record
    const transactionId = `TXN${Date.now()}`;
    const now = new Date();
    await this.createTransaction({
      type: 'payment',
      status: 'completed',
      amount: totalAmount.toFixed(2),
      userId: clientId,
      description: `Payment for task #${taskId}`,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      taskId
    });
    
    // Update task status
    await db
      .update(tasks)
      .set({ status: 'paid' })
      .where(eq(tasks.id, taskId));
    
    return { paymentId: payment.id, transactionId };
  }

  async processSpecialistPayout(taskId: number): Promise<void> {
    // Get task and payment details
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId));
    
    if (!task || task.status !== 'completed') {
      throw new Error('Task must be completed before payout');
    }
    
    const [payment] = await db
      .select()
      .from(payments)
      .where(and(
        eq(payments.taskId, taskId),
        eq(payments.status, 'completed')
      ));
    
    if (!payment) {
      throw new Error('No payment found for this task');
    }
    
    const specialistAmount = parseFloat(payment.specialistAmount || '0');
    const commissionAmount = specialistAmount * 0.5; // 50% commission
    
    // Add to specialist balance
    await this.updateUserBalance(task.specialistId!, commissionAmount, 'add');
    
    // Create payout transaction
    const now = new Date();
    await this.createTransaction({
      type: 'payout',
      status: 'completed',
      amount: commissionAmount.toFixed(2),
      userId: task.specialistId!,
      description: `Commission payout for task #${taskId} (50%)`,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      taskId
    });
    
    // Update task to mark payout complete
    await db
      .update(tasks)
      .set({ status: 'paid_out' })
      .where(eq(tasks.id, taskId));
  }
}

// Create storage instance with fallback to mock storage if DB is unavailable
let storageInstance: IStorage | null = null;

export const storage: IStorage = {
  async getUser(id: string): Promise<User | undefined> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getUser(id);
  },

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getUserByUsername(username);
  },

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.upsertUser(userData);
  },

  // Task operations
  async createTask(taskData: InsertTask & { clientId: string }): Promise<Task> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.createTask(taskData);
  },
  async getTask(id: number): Promise<Task | undefined> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getTask(id);
  },
  async getTasksByClient(clientId: string): Promise<Task[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getTasksByClient(clientId);
  },
  async getTasksBySpecialist(specialistId: string): Promise<Task[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getTasksBySpecialist(specialistId);
  },
  async getPendingTasks(): Promise<Task[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getPendingTasks();
  },
  async updateTaskStatus(id: number, status: string, specialistId?: string): Promise<void> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.updateTaskStatus(id, status, specialistId);
  },
  async updateTask(id: number, updates: Partial<Task>): Promise<void> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.updateTask(id, updates);
  },

  // Evaluation operations
  async createEvaluation(evaluation: InsertEvaluation & { taskId: number; specialistId: string }): Promise<TaskEvaluation> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.createEvaluation(evaluation);
  },
  async getEvaluationsByTask(taskId: number): Promise<TaskEvaluation[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getEvaluationsByTask(taskId);
  },
  async getEvaluationsBySpecialist(specialistId: string): Promise<TaskEvaluation[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getEvaluationsBySpecialist(specialistId);
  },
  async acceptEvaluation(taskId: number, evaluationId: number): Promise<void> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.acceptEvaluation(taskId, evaluationId);
  },

  // Payment operations
  async createPayment(payment: { taskId: number; amount: string }): Promise<Payment> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.createPayment(payment);
  },
  async updatePaymentStatus(id: number, status: string, transactionId?: string): Promise<void> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.updatePaymentStatus(id, status, transactionId);
  },
  async getPaymentsByTask(taskId: number): Promise<Payment[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getPaymentsByTask(taskId);
  },

  // Update operations
  async createTaskUpdate(update: InsertUpdate & { taskId: number; userId: string }): Promise<TaskUpdate> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.createTaskUpdate(update);
  },
  async getTaskUpdates(taskId: number): Promise<TaskUpdate[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getTaskUpdates(taskId);
  },

  // User profile operations
  async updateUserProfile(userId: string, profileData: Partial<User>): Promise<User> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.updateUserProfile(userId, profileData);
  },

  // Stats operations
  async getClientStats(clientId: string): Promise<any> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getClientStats(clientId);
  },
  async getSpecialistStats(specialistId: string): Promise<any> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getSpecialistStats(specialistId);
  },

  // Admin operations
  async getAllTasks(): Promise<Task[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getAllTasks();
  },
  async getAllUsers(): Promise<User[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getAllUsers();
  },
  async updateUserRole(userId: string, role: string): Promise<void> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.updateUserRole(userId, role);
  },
  async getTasksWithDetails(): Promise<any[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getTasksWithDetails();
  },
  async getAdminStats(): Promise<any> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getAdminStats();
  },

  // Announcements
  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.createAnnouncement(announcement);
  },
  async getAnnouncements(): Promise<Announcement[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getAnnouncements();
  },
  async updateAnnouncement(id: number, updates: Partial<Announcement>): Promise<void> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.updateAnnouncement(id, updates);
  },
  async deleteAnnouncement(id: number): Promise<void> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.deleteAnnouncement(id);
  },

  // Billing operations
  async getTransactions(userId?: string, year?: number): Promise<Transaction[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getTransactions(userId, year);
  },
  async getBillingStats(userId?: string): Promise<any> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getBillingStats(userId);
  },

  // Knowledge Base
  async createKnowledgeCategory(category: InsertKnowledgeCategory): Promise<KnowledgeCategory> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.createKnowledgeCategory(category);
  },
  async getKnowledgeCategories(): Promise<KnowledgeCategory[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getKnowledgeCategories();
  },
  async createKnowledgeArticle(article: InsertKnowledgeArticle): Promise<KnowledgeArticle> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.createKnowledgeArticle(article);
  },
  async getKnowledgeArticles(categoryId?: number): Promise<KnowledgeArticle[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getKnowledgeArticles(categoryId);
  },
  async getKnowledgeArticle(id: number): Promise<KnowledgeArticle | undefined> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getKnowledgeArticle(id);
  },
  async updateKnowledgeArticle(id: number, updates: Partial<KnowledgeArticle>): Promise<void> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.updateKnowledgeArticle(id, updates);
  },
  async incrementArticleViews(id: number): Promise<void> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.incrementArticleViews(id);
  },

  // Ticket Categories
  async createTicketCategory(category: InsertTicketCategory): Promise<TicketCategory> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.createTicketCategory(category);
  },
  async getTicketCategories(): Promise<TicketCategory[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getTicketCategories();
  },
  async updateTicketCategory(id: number, updates: Partial<TicketCategory>): Promise<void> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.updateTicketCategory(id, updates);
  },

  // Ticket Replies
  async createTicketReply(reply: InsertTicketReply & { userId: string }): Promise<TicketReply> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.createTicketReply(reply);
  },
  async getTicketReplies(ticketId: number): Promise<TicketReply[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getTicketReplies(ticketId);
  },

  // Custom Fields
  async getCustomFields(): Promise<CustomField[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getCustomFields();
  },
  async getUserCustomFields(userId: string): Promise<UserCustomField[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getUserCustomFields(userId);
  },

  // Analytics operations
  async getAnalyticsData(startDate: Date, reportType: string): Promise<any> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getAnalyticsData(startDate, reportType);
  },
  async getTaskAnalytics(startDate: Date): Promise<any> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getTaskAnalytics(startDate);
  },
  async getRevenueAnalytics(startDate: Date): Promise<any> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getRevenueAnalytics(startDate);
  },
  async getUserAnalytics(startDate: Date): Promise<any> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getUserAnalytics(startDate);
  },

  // System Settings operations
  async getSystemSettings(): Promise<SystemSettings | undefined> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getSystemSettings();
  },
  async updateSystemSettings(settings: Partial<InsertSystemSettings>): Promise<SystemSettings> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.updateSystemSettings(settings);
  },

  // Ticket Settings operations
  async getTicketSettings(): Promise<TicketSettings | undefined> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getTicketSettings();
  },
  async updateTicketSettings(settings: Partial<InsertTicketSettings>): Promise<TicketSettings> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.updateTicketSettings(settings);
  },

  // Administrator operations
  async adjustUserBalance(adminId: string, userId: string, amount: string, reason: string, type: 'credit' | 'debit'): Promise<BalanceAdjustment> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.adjustUserBalance(adminId, userId, amount, reason, type);
  },
  async getBalanceAdjustments(userId?: string): Promise<BalanceAdjustment[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getBalanceAdjustments(userId);
  },
  async assignTaskToSpecialist(adminId: string, taskId: number, specialistId: string, notes?: string): Promise<TaskAssignment> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.assignTaskToSpecialist(adminId, taskId, specialistId, notes);
  },
  async getTaskAssignments(taskId?: number): Promise<TaskAssignment[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getTaskAssignments(taskId);
  },
  async updatePlatformSetting(key: string, value: string, description?: string, updatedBy?: string): Promise<PlatformSettings> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.updatePlatformSetting(key, value, description, updatedBy);
  },
  async getPlatformSettings(): Promise<PlatformSettings[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getPlatformSettings();
  },
  async getPlatformSetting(key: string): Promise<PlatformSettings | undefined> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getPlatformSetting(key);
  },
  async getAdminDashboardStats(): Promise<any> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getAdminDashboardStats();
  },

  // Notification operations
  async createNotification(notification: any): Promise<any> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.createNotification(notification);
  },
  async getNotifications(userId: string): Promise<any[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getNotifications(userId);
  },
  async markNotificationAsRead(notificationId: number): Promise<void> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.markNotificationAsRead(notificationId);
  },
  async markAllNotificationsAsRead(userId: string): Promise<void> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.markAllNotificationsAsRead(userId);
  },

  // Activity logging operations
  async logActivity(activity: any): Promise<void> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.logActivity(activity);
  },
  async getActivityLogs(userId?: string, limit?: number): Promise<any[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getActivityLogs(userId, limit);
  },

  // Helpdesk operations
  async getHelpdeskDashboardStats(): Promise<any> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getHelpdeskDashboardStats();
  },
  async getRecentHelpdeskActivity(limit: number): Promise<any[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getRecentHelpdeskActivity(limit);
  },
  async getTicketDetails(ticketId: number): Promise<any> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getTicketDetails(ticketId);
  },
  async getTicketMessages(ticketId: number, userId: string, userRole: string): Promise<any[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getTicketMessages(ticketId, userId, userRole);
  },
  async createTicketMessage(message: any): Promise<any> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.createTicketMessage(message);
  },
  async getTicketChangeLog(ticketId: number): Promise<any[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getTicketChangeLog(ticketId);
  },
  async updateTicketFields(ticketId: number, updates: any): Promise<void> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.updateTicketFields(ticketId, updates);
  },
  async getTicketAttachments(ticketId: number): Promise<any[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getTicketAttachments(ticketId);
  },
  async createTicketAttachment(attachment: any): Promise<any> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.createTicketAttachment(attachment);
  },

  // Billing and Payment operations
  async getUserBalance(userId: string): Promise<string> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getUserBalance(userId);
  },
  async updateUserBalance(userId: string, amount: number, operation: 'add' | 'subtract'): Promise<void> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.updateUserBalance(userId, amount, operation);
  },
  async getPaymentById(paymentId: number): Promise<Payment | undefined> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getPaymentById(paymentId);
  },
  async getUserPayments(userId: string): Promise<Payment[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getUserPayments(userId);
  },
  async getTransactionHistory(userId: string, limit?: number): Promise<Transaction[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getTransactionHistory(userId, limit);
  },
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.createTransaction(transaction);
  },
  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.createInvoice(invoice);
  },
  async getInvoiceById(invoiceId: number): Promise<Invoice | undefined> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getInvoiceById(invoiceId);
  },
  async getUserInvoices(userId: string): Promise<Invoice[]> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.getUserInvoices(userId);
  },
  async updateInvoiceStatus(invoiceId: number, status: string): Promise<void> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.updateInvoiceStatus(invoiceId, status);
  },
  async processTaskPayment(taskId: number, clientId: string, amount: number): Promise<{ paymentId: number; transactionId: string }> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.processTaskPayment(taskId, clientId, amount);
  },
  async processSpecialistPayout(taskId: number): Promise<void> {
    if (!storageInstance) await initializeStorage();
    return storageInstance!.processSpecialistPayout(taskId);
  }
};

// Mock storage for development when database is unavailable
class MockStorage implements IStorage {
  private users = new Map();
  private tasks = new Map();
  private nextId = 1;
private announcements: any[] = [];
private knowledgeCategories: any[] = [];
private knowledgeArticles: any[] = [];
  private settings = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u: any) => u.username === username);
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const existingUser = this.users.get(user.id);
    const newUser = {
      ...existingUser,
      ...user,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, newUser);
    return newUser as User;
  }

  async createTask(task: any): Promise<Task> {
    const newTask = { ...task, id: this.nextId++, status: "created", createdAt: new Date(), updatedAt: new Date() };
    this.tasks.set(newTask.id, newTask);
    return newTask as Task;
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByClient(clientId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter((t: any) => t.clientId === clientId);
  }

  async getTasksBySpecialist(specialistId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter((t: any) => t.specialistId === specialistId);
  }

  async getPendingTasks(): Promise<Task[]> { return []; }
  async updateTaskStatus(): Promise<void> {}
  async updateTask(): Promise<void> {}
  async createEvaluation(): Promise<any> { return {}; }
  async getEvaluationsByTask(): Promise<any[]> { return []; }
  async getEvaluationsBySpecialist(): Promise<any[]> { return []; }
  async acceptEvaluation(): Promise<void> {}
  async createPayment(): Promise<any> { return {}; }
  async updatePaymentStatus(): Promise<void> {}
  async getPaymentsByTask(): Promise<any[]> { return []; }
  async createTaskUpdate(): Promise<any> { return {}; }
  async getTaskUpdates(): Promise<any[]> { return []; }
  async updateUserProfile(userId: string, profileData: Partial<User>): Promise<User> { 
    const user = this.users.get(userId) || {} as User;
    const updatedUser = { ...user, ...profileData, updatedAt: new Date() };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async getClientStats(): Promise<any> {
    return { activeTasks: 0, completedTasks: 0, pendingTasks: 0, totalSpent: "0.00" };
  }

  async getSpecialistStats(): Promise<any> {
    return { assignedTasks: 0, completedTasks: 0, pendingEvaluations: 0, totalEarned: "0.00" };
  }

  async getAllTasks(): Promise<Task[]> { return Array.from(this.tasks.values()); }
  async getAllUsers(): Promise<User[]> { return Array.from(this.users.values()); }
  async updateUserRole(userId: string, role: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.role = role;
      this.users.set(userId, user);
    }
  }
  async getTasksWithDetails(): Promise<any[]> { return Array.from(this.tasks.values()); }
  async getAdminStats(): Promise<any> {
    return { totalTasks: 0, totalUsers: this.users.size, totalSpecialists: 0, totalClients: 1, activeTasks: 0, completedTasks: 0, totalRevenue: "0.00" };
  }

  // Announcements
  async createAnnouncement(announcement: any): Promise<any> {
    const newAnnouncement = { ...announcement, id: this.nextId++, createdAt: new Date() };
    this.announcements.push(newAnnouncement);
    return newAnnouncement;
  }
  async getAnnouncements(): Promise<any[]> { return this.announcements; }
  async updateAnnouncement(): Promise<void> {}
  async deleteAnnouncement(): Promise<void> {}

  // Billing
  async getTransactions(): Promise<any[]> { return []; }
  async getBillingStats(): Promise<any> { 
    return { totalInAccount: "0.00", incomeInOrders: "0.00", expensesInOrders: "0.00", monthlyRevenue: "0.00" }; 
  }

  // Knowledge Base
  async createKnowledgeCategory(category: any): Promise<any> {
    const newCategory = { ...category, id: this.nextId++, createdAt: new Date() };
    this.knowledgeCategories.push(newCategory);
    return newCategory;
  }
  async getKnowledgeCategories(): Promise<any[]> { return this.knowledgeCategories; }
  async createKnowledgeArticle(article: any): Promise<any> {
    const newArticle = { ...article, id: this.nextId++, createdAt: new Date(), views: 0 };
    this.knowledgeArticles.push(newArticle);
    return newArticle;
  }
  async getKnowledgeArticles(): Promise<any[]> { return this.knowledgeArticles; }
  async getKnowledgeArticle(id: number): Promise<any> {
    return this.knowledgeArticles.find(a => a.id === id);
  }
  async updateKnowledgeArticle(): Promise<void> {}
  async incrementArticleViews(): Promise<void> {}

  // Ticket Categories
  async createTicketCategory(): Promise<any> { return {}; }
  async getTicketCategories(): Promise<any[]> { return []; }
  async updateTicketCategory(): Promise<void> {}

  // Ticket Replies
  async createTicketReply(): Promise<any> { return {}; }
  async getTicketReplies(): Promise<any[]> { return []; }

  // Custom Fields
  async getCustomFields(): Promise<any[]> { return []; }
  async getUserCustomFields(): Promise<any[]> { return []; }

  // Analytics
  async getAnalyticsData(): Promise<any> { 
    return { newTasks: 0, completedTasks: 0, activeTasks: 0, activeClients: 0, avgCompletionDays: 0 }; 
  }
  async getTaskAnalytics(): Promise<any> { 
    return { monthlyData: [], statusDistribution: [] }; 
  }
  async getRevenueAnalytics(): Promise<any> { 
    return { monthlyRevenue: [], totalRevenue: "0.00", totalCosts: "0.00", paymentCount: 0 }; 
  }
  async getUserAnalytics(): Promise<any> { 
    return { dailyActivity: [], totalUsers: this.users.size, clients: 1, specialists: 0, newUsers: 0 }; 
  }

  // System Settings
  async getSystemSettings(): Promise<any> {
    return this.settings.get('system') || {
      siteName: "WS24 Dev",
      siteDescription: "Professional Web Development Services",
      siteEmail: "ticket@ws24.pro",
      siteTheme: "Titan",
      logoType: "text",
      defaultUserRole: "client",
      disableRegistration: false,
      allowAvatarUpload: true,
      passwordBruteForceProtection: true,
      emailAccountActivation: false
    };
  }
  async updateSystemSettings(settings: any): Promise<any> {
    const currentSettings = await this.getSystemSettings();
    const updatedSettings = { ...currentSettings, ...settings, updatedAt: new Date() };
    this.settings.set('system', updatedSettings);
    return updatedSettings;
  }

  // Ticket Settings
  async getTicketSettings(): Promise<any> {
    return this.settings.get('tickets') || {
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
      ticketTitle: "Support Ticket",
      defaultCategory: "general",
      defaultStatus: "new",
      imapTicketString: "## Номер заявки:",
      imapReplyString: "##- Введите свой ответ над этой строкой -##"
    };
  }
  async updateTicketSettings(settings: any): Promise<any> {
    const currentSettings = await this.getTicketSettings();
    const updatedSettings = { ...currentSettings, ...settings, updatedAt: new Date() };
    this.settings.set('tickets', updatedSettings);
    return updatedSettings;
  }

  // Administrator operations
  async adjustUserBalance(): Promise<any> { return {}; }
  async getBalanceAdjustments(): Promise<any[]> { return []; }
  async assignTaskToSpecialist(): Promise<any> { return {}; }
  async getTaskAssignments(): Promise<any[]> { return []; }
  async updatePlatformSetting(key: string, value: string): Promise<any> {
    const setting = { key, value, updatedAt: new Date() };
    this.settings.set(key, setting);
    return setting;
  }
  async getPlatformSettings(): Promise<any[]> { return Array.from(this.settings.values()); }
  async getPlatformSetting(key: string): Promise<any> { return this.settings.get(key); }
  async getAdminDashboardStats(): Promise<any> {
    return {
      totalTasks: 0, activeTasks: 0, completedTasks: 0, totalUsers: this.users.size,
      totalSpecialists: 0, totalClients: 1, totalRevenue: "0.00",
      platformMarkupRate: "10", pendingPayments: 0, activeAssignments: 0
    };
  }

  // Notification operations
  async createNotification(): Promise<any> { return {}; }
  async getNotifications(): Promise<any[]> { return []; }
  async markNotificationAsRead(): Promise<void> {}
  async markAllNotificationsAsRead(): Promise<void> {}

  // Activity logging
  async logActivity(): Promise<void> {}
  async getActivityLogs(): Promise<any[]> { return []; }

  // Helpdesk operations
  async getHelpdeskDashboardStats(): Promise<any> {
    return { 
      totalTickets: 0, activeTickets: 0, overdueTickets: 0, totalUsers: this.users.size,
      activeSpecialists: 0, totalRevenue: "0.00", revenueThisMonth: "0.00", newTicketsThisWeek: 0
    };
  }
  async getRecentHelpdeskActivity(): Promise<any[]> { return []; }
  async getTicketDetails(): Promise<any> { return undefined; }
  async getTicketMessages(): Promise<any[]> { return []; }
  async createTicketMessage(): Promise<any> { return {}; }
  async getTicketChangeLog(): Promise<any[]> { return []; }
  async updateTicketFields(): Promise<void> {}
  async getTicketAttachments(): Promise<any[]> { return []; }
  async createTicketAttachment(): Promise<any> { return {}; }

  // Billing and Payment operations
  async getUserBalance(): Promise<string> { return "1000.00"; }
  async updateUserBalance(): Promise<void> {}
  async getPaymentById(): Promise<any> { return undefined; }
  async getUserPayments(): Promise<any[]> { return []; }
  async getTransactionHistory(): Promise<any[]> { return []; }
  async createTransaction(): Promise<any> { return {}; }
  async createInvoice(): Promise<any> { return {}; }
  async getInvoiceById(): Promise<any> { return undefined; }
  async getUserInvoices(): Promise<any[]> { return []; }
  async updateInvoiceStatus(): Promise<void> {}
  async processTaskPayment(): Promise<any> { return { paymentId: 1, transactionId: "TXN123" }; }
  async processSpecialistPayout(): Promise<void> {}
}

// Initialize storage with fallback to mock storage
async function initializeStorage() {
  if (storageInstance) return;
  
  try {
    // Try to initialize database storage
    const dbStorage = new DatabaseStorage();
    // Test the connection by trying to get a user
    await dbStorage.getUser("test");
    storageInstance = dbStorage;
    console.log("Using database storage");
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log("Database not available, using mock storage for development:", msg);
    storageInstance = new MockStorage() as any;
  }
}
