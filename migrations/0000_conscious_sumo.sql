CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"body" text NOT NULL,
	"status" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "balance_adjustments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"admin_id" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"previous_balance" numeric(10, 2) NOT NULL,
	"new_balance" numeric(10, 2) NOT NULL,
	"reason" text NOT NULL,
	"type" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "custom_fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"options" text DEFAULT '',
	"required" boolean DEFAULT false,
	"default_value" text DEFAULT '',
	"sort_order" integer DEFAULT 0,
	"status" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"user_id" varchar NOT NULL,
	"payment_id" integer,
	"amount" numeric(10, 2) NOT NULL,
	"tax" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"due_date" timestamp,
	"paid_date" timestamp,
	"company_name" varchar(255),
	"company_address" text,
	"company_tax_id" varchar(100),
	"notes" text,
	"pdf_url" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "knowledge_articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"body" text NOT NULL,
	"category_id" integer NOT NULL,
	"status" integer DEFAULT 1 NOT NULL,
	"views" integer DEFAULT 0,
	"rating" numeric(3, 2) DEFAULT '0.00',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "knowledge_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text DEFAULT '',
	"parent_id" integer DEFAULT 0,
	"icon" varchar(100) DEFAULT '',
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer,
	"amount" numeric(10, 2) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"payment_method" varchar(50),
	"transaction_id" varchar,
	"payment_type" varchar(50) DEFAULT 'task',
	"from_user_id" varchar,
	"to_user_id" varchar,
	"markup_amount" numeric(10, 2),
	"specialist_amount" numeric(10, 2),
	"invoice_id" varchar,
	"reason" text,
	"created_at" timestamp DEFAULT now(),
	"paid_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"updated_by" varchar,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "platform_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_name" varchar(255) DEFAULT 'eCommerce Решения WS24.pro',
	"site_description" text,
	"site_email" varchar(255) DEFAULT 'ticket@ws24.pro',
	"site_theme" varchar(100) DEFAULT 'Titan',
	"logo_type" varchar(10) DEFAULT 'text',
	"logo_width" integer DEFAULT 93,
	"logo_height" integer DEFAULT 32,
	"logo_path" varchar(500),
	"upload_path" varchar(500) DEFAULT '/srv/html/helpdesk/public_html/uploads',
	"relative_upload_path" varchar(500),
	"allowed_file_types" text DEFAULT 'txt|gif|png|jpg|jpeg|pdf|doc|docx|xls|xlsx|txt|csv|ppt|zip|mov|mpeg|mp4|avi|zip|rar|tar|7z|gzip|psd|html|xml|json',
	"max_file_size" integer DEFAULT 1181929,
	"dashboard_notes" text,
	"default_user_role" varchar(50) DEFAULT 'client',
	"disable_registration" boolean DEFAULT false,
	"recaptcha_secret_key" varchar(255),
	"recaptcha_site_key" varchar(255),
	"allow_avatar_upload" boolean DEFAULT true,
	"password_brute_force_protection" boolean DEFAULT true,
	"email_account_activation" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "task_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"specialist_id" varchar NOT NULL,
	"assigned_by" varchar NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"status" varchar DEFAULT 'active' NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "task_evaluations" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"specialist_id" varchar NOT NULL,
	"estimated_hours" integer NOT NULL,
	"hourly_rate" numeric(10, 2) NOT NULL,
	"total_cost" numeric(10, 2) NOT NULL,
	"notes" text,
	"accepted_by_client" boolean,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "task_updates" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"content" text NOT NULL,
	"type" varchar(50) DEFAULT 'update' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"priority" varchar(20) NOT NULL,
	"status" varchar(50) DEFAULT 'created' NOT NULL,
	"client_id" varchar NOT NULL,
	"specialist_id" varchar,
	"estimated_hours" integer,
	"hourly_rate" numeric(10, 2),
	"total_cost" numeric(10, 2),
	"deadline" timestamp,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ticket_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"parent_id" integer DEFAULT 0,
	"image" varchar(1000) DEFAULT '',
	"ticket_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ticket_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"reply_id" integer DEFAULT 0,
	"filename" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"file_size" integer DEFAULT 0,
	"mime_type" varchar(100) DEFAULT '',
	"uploaded_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ticket_replies" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"body" text NOT NULL,
	"timestamp" integer NOT NULL,
	"reply_id" integer DEFAULT 0,
	"files" integer DEFAULT 0,
	"hash" varchar(255) DEFAULT '',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ticket_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"allow_file_upload" boolean DEFAULT true,
	"allow_guest_tickets" boolean DEFAULT false,
	"allow_ticket_edit" boolean DEFAULT true,
	"require_login" boolean DEFAULT false,
	"allow_ticket_rating" boolean DEFAULT true,
	"prevent_replies_after_close" boolean DEFAULT true,
	"staff_reply_action" varchar DEFAULT 'nothing',
	"client_reply_action" varchar DEFAULT 'nothing',
	"imap_protocol" varchar DEFAULT 'imap',
	"imap_host" varchar DEFAULT 'imap.timeweb.ru:993',
	"imap_ssl" boolean DEFAULT true,
	"imap_skip_cert_validation" boolean DEFAULT false,
	"imap_email" varchar DEFAULT 'ticket@ws24.pro',
	"imap_password" varchar,
	"ticket_title" varchar DEFAULT 'Support Ticket',
	"default_category" varchar DEFAULT 'general',
	"default_status" varchar DEFAULT 'new',
	"imap_ticket_string" varchar DEFAULT '## Номер заявки:',
	"imap_reply_string" varchar DEFAULT '##- Введите свой ответ над этой строкой -##',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer,
	"user_id" varchar,
	"type" varchar(50) NOT NULL,
	"status" varchar(50) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"description" text,
	"payment_method" varchar(100),
	"transaction_id" varchar(255),
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"day" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_custom_fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"field_id" integer NOT NULL,
	"value" text DEFAULT '',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"username" varchar,
	"balance" varchar DEFAULT '0.00',
	"bio" text,
	"phone" varchar,
	"role" varchar DEFAULT 'client' NOT NULL,
	"specialization" text,
	"last_login" timestamp,
	"ip_address" varchar,
	"is_active" boolean DEFAULT true,
	"client_notes" text,
	"user_groups" varchar DEFAULT 'Пользователи',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "balance_adjustments" ADD CONSTRAINT "balance_adjustments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_adjustments" ADD CONSTRAINT "balance_adjustments_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD CONSTRAINT "platform_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_specialist_id_users_id_fk" FOREIGN KEY ("specialist_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");