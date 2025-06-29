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
  role: varchar("role").notNull().default("client"), // 'client', 'specialist', or 'admin'
  specialization: text("specialization"), // For specialists
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

// Insert schemas
export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  category: true,
  priority: true,
  deadline: true,
  attachments: true,
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
