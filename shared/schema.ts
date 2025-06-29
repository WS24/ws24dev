import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  balance: varchar("balance").default("0.00"),
  bio: text("bio"),
  phone: varchar("phone"),
  role: varchar("role").notNull().default("client"), // 'client', 'specialist', or 'admin'
  specialization: text("specialization"), // For specialists
  lastLogin: timestamp("last_login"),
  ipAddress: varchar("ip_address"),
  isActive: boolean("is_active").default(true),
  clientNotes: text("client_notes"),
  userGroups: varchar("user_groups").default("Пользователи"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  priority: varchar("priority", { length: 20 }).notNull(), // 'low', 'medium', 'high'
  status: varchar("status", { length: 50 }).notNull().default("created"), // 'created', 'evaluating', 'evaluated', 'paid', 'in_progress', 'completed', 'cancelled'
  clientId: varchar("client_id").notNull(),
  specialistId: varchar("specialist_id"),
  estimatedHours: integer("estimated_hours"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  deadline: timestamp("deadline"),
  attachments: jsonb("attachments").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const taskEvaluations = pgTable("task_evaluations", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  specialistId: varchar("specialist_id").notNull(),
  estimatedHours: integer("estimated_hours").notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  acceptedByClient: boolean("accepted_by_client"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending', 'paid', 'failed'
  paymentMethod: varchar("payment_method", { length: 50 }),
  transactionId: varchar("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
  paidAt: timestamp("paid_at"),
});

export const taskUpdates = pgTable("task_updates", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  userId: varchar("user_id").notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull().default("update"), // 'update', 'comment', 'status_change'
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  clientTasks: many(tasks, { relationName: "client_tasks" }),
  specialistTasks: many(tasks, { relationName: "specialist_tasks" }),
  evaluations: many(taskEvaluations),
  updates: many(taskUpdates),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  client: one(users, {
    fields: [tasks.clientId],
    references: [users.id],
    relationName: "client_tasks",
  }),
  specialist: one(users, {
    fields: [tasks.specialistId],
    references: [users.id],
    relationName: "specialist_tasks",
  }),
  evaluations: many(taskEvaluations),
  payments: many(payments),
  updates: many(taskUpdates),
}));

export const taskEvaluationsRelations = relations(taskEvaluations, ({ one }) => ({
  task: one(tasks, {
    fields: [taskEvaluations.taskId],
    references: [tasks.id],
  }),
  specialist: one(users, {
    fields: [taskEvaluations.specialistId],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  task: one(tasks, {
    fields: [payments.taskId],
    references: [tasks.id],
  }),
}));

export const taskUpdatesRelations = relations(taskUpdates, ({ one }) => ({
  task: one(tasks, {
    fields: [taskUpdates.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskUpdates.userId],
    references: [users.id],
  }),
}));

// Ticket Categories (from MySQL backup)
export const ticketCategories = pgTable("ticket_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull().default(""),
  parentId: integer("parent_id").default(0),
  image: varchar("image", { length: 1000 }).default(""),
  ticketCount: integer("ticket_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ticket Replies (from MySQL backup)
export const ticketReplies = pgTable("ticket_replies", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull(),
  userId: varchar("user_id").notNull(),
  body: text("body").notNull(),
  timestamp: integer("timestamp").notNull(),
  replyId: integer("reply_id").default(0),
  files: integer("files").default(0),
  hash: varchar("hash", { length: 255 }).default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

// Announcements (from MySQL backup)
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  body: text("body").notNull(),
  status: integer("status").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Knowledge Base Articles (from MySQL backup)
export const knowledgeArticles = pgTable("knowledge_articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  body: text("body").notNull(),
  categoryId: integer("category_id").notNull(),
  status: integer("status").notNull().default(1),
  views: integer("views").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Knowledge Categories (from MySQL backup)
export const knowledgeCategories = pgTable("knowledge_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").default(""),
  parentId: integer("parent_id").default(0),
  icon: varchar("icon", { length: 100 }).default(""),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Custom Fields (from MySQL backup)
export const customFields = pgTable("custom_fields", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  options: text("options").default(""),
  required: boolean("required").default(false),
  defaultValue: text("default_value").default(""),
  sortOrder: integer("sort_order").default(0),
  status: integer("status").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Custom Field Values
export const userCustomFields = pgTable("user_custom_fields", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  fieldId: integer("field_id").notNull(),
  value: text("value").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

// Ticket Files (from MySQL backup)
export const ticketFiles = pgTable("ticket_files", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull(),
  replyId: integer("reply_id").default(0),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  fileSize: integer("file_size").default(0),
  mimeType: varchar("mime_type", { length: 100 }).default(""),
  uploadedBy: varchar("uploaded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Financial transactions for billing dashboard
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // 'payment', 'refund', 'credit', 'debit'
  status: varchar("status", { length: 50 }).notNull(), // 'pending', 'completed', 'cancelled', 'refunded'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  description: text("description"),
  paymentMethod: varchar("payment_method", { length: 100 }),
  transactionId: varchar("transaction_id", { length: 255 }),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  day: integer("day").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations for new entities
export const ticketCategoriesRelations = relations(ticketCategories, ({ many, one }) => ({
  tickets: many(tasks),
  parent: one(ticketCategories, { fields: [ticketCategories.parentId], references: [ticketCategories.id] }),
  children: many(ticketCategories),
}));

export const ticketRepliesRelations = relations(ticketReplies, ({ one }) => ({
  ticket: one(tasks, { fields: [ticketReplies.ticketId], references: [tasks.id] }),
  user: one(users, { fields: [ticketReplies.userId], references: [users.id] }),
}));

export const knowledgeArticlesRelations = relations(knowledgeArticles, ({ one }) => ({
  category: one(knowledgeCategories, { fields: [knowledgeArticles.categoryId], references: [knowledgeCategories.id] }),
}));

export const knowledgeCategoriesRelations = relations(knowledgeCategories, ({ many, one }) => ({
  articles: many(knowledgeArticles),
  parent: one(knowledgeCategories, { fields: [knowledgeCategories.parentId], references: [knowledgeCategories.id] }),
  children: many(knowledgeCategories),
}));

export const userCustomFieldsRelations = relations(userCustomFields, ({ one }) => ({
  user: one(users, { fields: [userCustomFields.userId], references: [users.id] }),
  field: one(customFields, { fields: [userCustomFields.fieldId], references: [customFields.id] }),
}));

export const ticketFilesRelations = relations(ticketFiles, ({ one }) => ({
  ticket: one(tasks, { fields: [ticketFiles.ticketId], references: [tasks.id] }),
  user: one(users, { fields: [ticketFiles.uploadedBy], references: [users.id] }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  task: one(tasks, { fields: [transactions.taskId], references: [tasks.id] }),
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
}));

// Insert schemas
export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  category: true,
  priority: true,
  deadline: true,
  attachments: true,
}).extend({
  budget: z.string().optional(),
});

export const insertEvaluationSchema = createInsertSchema(taskEvaluations).pick({
  estimatedHours: true,
  hourlyRate: true,
  totalCost: true,
  notes: true,
});

export const insertUpdateSchema = createInsertSchema(taskUpdates).pick({
  message: true,
  type: true,
});

// Insert schemas for new entities
export const insertAnnouncementSchema = createInsertSchema(announcements).pick({
  title: true,
  body: true,
  status: true,
});

export const insertKnowledgeArticleSchema = createInsertSchema(knowledgeArticles).pick({
  title: true,
  body: true,
  categoryId: true,
  status: true,
});

export const insertKnowledgeCategorySchema = createInsertSchema(knowledgeCategories).pick({
  name: true,
  description: true,
  parentId: true,
  icon: true,
  sortOrder: true,
});

export const insertTicketReplySchema = createInsertSchema(ticketReplies).pick({
  ticketId: true,
  body: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type TaskEvaluation = typeof taskEvaluations.$inferSelect;
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;
export type Payment = typeof payments.$inferSelect;
export type TaskUpdate = typeof taskUpdates.$inferSelect;
export type InsertUpdate = z.infer<typeof insertUpdateSchema>;

// New entity types
export type TicketCategory = typeof ticketCategories.$inferSelect;
export type InsertTicketCategory = typeof ticketCategories.$inferInsert;
export type TicketReply = typeof ticketReplies.$inferSelect;
export type InsertTicketReply = z.infer<typeof insertTicketReplySchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type KnowledgeArticle = typeof knowledgeArticles.$inferSelect;
export type InsertKnowledgeArticle = z.infer<typeof insertKnowledgeArticleSchema>;
export type KnowledgeCategory = typeof knowledgeCategories.$inferSelect;
export type InsertKnowledgeCategory = z.infer<typeof insertKnowledgeCategorySchema>;
export type CustomField = typeof customFields.$inferSelect;
export type UserCustomField = typeof userCustomFields.$inferSelect;
export type TicketFile = typeof ticketFiles.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// System Settings table
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  siteName: varchar("site_name", { length: 255 }).default("eCommerce Решения WS24.pro"),
  siteDescription: text("site_description"),
  siteEmail: varchar("site_email", { length: 255 }).default("ticket@ws24.pro"),
  siteTheme: varchar("site_theme", { length: 100 }).default("Titan"),
  logoType: varchar("logo_type", { length: 10 }).default("text"),
  logoWidth: integer("logo_width").default(93),
  logoHeight: integer("logo_height").default(32),
  logoPath: varchar("logo_path", { length: 500 }),
  uploadPath: varchar("upload_path", { length: 500 }).default("/srv/html/helpdesk/public_html/uploads"),
  relativeUploadPath: varchar("relative_upload_path", { length: 500 }),
  allowedFileTypes: text("allowed_file_types").default("txt|gif|png|jpg|jpeg|pdf|doc|docx|xls|xlsx|txt|csv|ppt|zip|mov|mpeg|mp4|avi|zip|rar|tar|7z|gzip|psd|html|xml|json"),
  maxFileSize: integer("max_file_size").default(1181929),
  dashboardNotes: text("dashboard_notes"),
  defaultUserRole: varchar("default_user_role", { length: 50 }).default("client"),
  disableRegistration: boolean("disable_registration").default(false),
  recaptchaSecretKey: varchar("recaptcha_secret_key", { length: 255 }),
  recaptchaSiteKey: varchar("recaptcha_site_key", { length: 255 }),
  allowAvatarUpload: boolean("allow_avatar_upload").default(true),
  passwordBruteForceProtection: boolean("password_brute_force_protection").default(true),
  emailAccountActivation: boolean("email_account_activation").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettings).pick({
  siteName: true,
  siteDescription: true,
  siteEmail: true,
  siteTheme: true,
  logoType: true,
  logoWidth: true,
  logoHeight: true,
  logoPath: true,
  uploadPath: true,
  relativeUploadPath: true,
  allowedFileTypes: true,
  maxFileSize: true,
  dashboardNotes: true,
  defaultUserRole: true,
  disableRegistration: true,
  recaptchaSecretKey: true,
  recaptchaSiteKey: true,
  allowAvatarUpload: true,
  passwordBruteForceProtection: true,
  emailAccountActivation: true,
});

export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;

// Ticket Settings Schema
export const ticketSettings = pgTable("ticket_settings", {
  id: serial("id").primaryKey(),
  // General Ticket Settings
  allowFileUpload: boolean("allow_file_upload").default(true),
  allowGuestTickets: boolean("allow_guest_tickets").default(false),
  allowTicketEdit: boolean("allow_ticket_edit").default(true),
  requireLogin: boolean("require_login").default(false),
  allowTicketRating: boolean("allow_ticket_rating").default(true),
  preventRepliesAfterClose: boolean("prevent_replies_after_close").default(true),
  
  // Auto Status Settings
  staffReplyAction: varchar("staff_reply_action").default("nothing"),
  clientReplyAction: varchar("client_reply_action").default("nothing"),
  
  // IMAP Settings
  imapProtocol: varchar("imap_protocol").default("imap"),
  imapHost: varchar("imap_host").default("imap.timeweb.ru:993"),
  imapSsl: boolean("imap_ssl").default(true),
  imapSkipCertValidation: boolean("imap_skip_cert_validation").default(false),
  imapEmail: varchar("imap_email").default("ticket@ws24.pro"),
  imapPassword: varchar("imap_password"),
  
  // Default Settings
  ticketTitle: varchar("ticket_title").default("Support Ticket"),
  defaultCategory: varchar("default_category").default("general"),
  defaultStatus: varchar("default_status").default("new"),
  
  // IMAP String Settings
  imapTicketString: varchar("imap_ticket_string").default("## Номер заявки:"),
  imapReplyString: varchar("imap_reply_string").default("##- Введите свой ответ над этой строкой -##"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTicketSettingsSchema = createInsertSchema(ticketSettings).pick({
  allowFileUpload: true,
  allowGuestTickets: true,
  allowTicketEdit: true,
  requireLogin: true,
  allowTicketRating: true,
  preventRepliesAfterClose: true,
  staffReplyAction: true,
  clientReplyAction: true,
  imapProtocol: true,
  imapHost: true,
  imapSsl: true,
  imapSkipCertValidation: true,
  imapEmail: true,
  imapPassword: true,
  ticketTitle: true,
  defaultCategory: true,
  defaultStatus: true,
  imapTicketString: true,
  imapReplyString: true,
});

export type TicketSettings = typeof ticketSettings.$inferSelect;
export type InsertTicketSettings = z.infer<typeof insertTicketSettingsSchema>;
