/**
 * Environment Variables Validation Module
 * 
 * This module provides comprehensive validation for all environment variables
 * required by the WS24 Dev application using Zod schemas. It ensures proper
 * configuration before server startup and provides clear error messages
 * for missing or invalid environment variables.
 * 
 * @module EnvValidation
 * @requires zod - Runtime validation library
 */

import { z } from 'zod';
import crypto from 'crypto';

/**
 * Environment validation schema using Zod
 * Validates all required environment variables with appropriate constraints
 */
const envSchema = z.object({
  // Node.js Environment
  NODE_ENV: z.enum(['development', 'production', 'test'])
    .default('development')
    .describe('Application environment mode'),

  // Database Configuration
  DATABASE_URL: z.string()
    .url('DATABASE_URL must be a valid PostgreSQL connection URL')
    .startsWith('postgresql://', 'DATABASE_URL must be a PostgreSQL URL')
    .describe('PostgreSQL database connection URL'),

  // Session Security
  SESSION_SECRET: z.string()
    .min(32, 'SESSION_SECRET must be at least 32 characters long for security')
    .describe('Secret key for session encryption and signing'),

  // Replit Authentication (Production only)
  ISSUER_URL: z.string()
    .url('ISSUER_URL must be a valid URL')
    .optional()
    .default('https://replit.com/oidc')
    .describe('OpenID Connect issuer URL for Replit authentication'),

  REPL_ID: z.string()
    .min(1, 'REPL_ID is required for Replit authentication')
    .optional()
    .describe('Replit application ID for OAuth'),

  REPLIT_DOMAINS: z.string()
    .min(1, 'REPLIT_DOMAINS is required for production CORS configuration')
    .optional()
    .transform((val) => val?.split(',').map(domain => domain.trim()).filter(Boolean))
    .describe('Comma-separated list of allowed Replit domains for CORS'),

  // Server Configuration
  PORT: z.string()
    .regex(/^\d+$/, 'PORT must be a valid number')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(65535, 'PORT must be between 1-65535'))
    .optional()
    .default('3000')
    .describe('Server port number'),
});

/**
 * Environment-specific validation schema
 * Enforces different requirements based on NODE_ENV
 */
const envSchemaWithConditionals = envSchema.superRefine((data, ctx) => {
  // Production-specific validations
  if (data.NODE_ENV === 'production') {
    if (!data.REPL_ID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['REPL_ID'],
        message: 'REPL_ID is required in production environment for Replit authentication',
      });
    }

    if (!data.REPLIT_DOMAINS || data.REPLIT_DOMAINS.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['REPLIT_DOMAINS'],
        message: 'REPLIT_DOMAINS is required in production environment for CORS configuration',
      });
    }

    // Validate REPLIT_DOMAINS format
    if (data.REPLIT_DOMAINS) {
      for (const domain of data.REPLIT_DOMAINS) {
        // Check for valid domain format (allows hostname:port)
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*(:\d+)?$/;
        if (!domainRegex.test(domain)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['REPLIT_DOMAINS'],
            message: `Invalid domain format: ${domain}. Expected format: 'domain.com' or 'domain.com:port'`,
          });
        }
      }
    }
  }

  // Development-specific validations
  if (data.NODE_ENV === 'development') {
    // In development, REPL_ID and REPLIT_DOMAINS are optional
    // but SESSION_SECRET should still be strong
    if (data.SESSION_SECRET.length < 16) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SESSION_SECRET'],
        message: 'SESSION_SECRET should be at least 16 characters even in development',
      });
    }
  }
});

/**
 * Parsed and validated environment variables type
 */
export type ValidatedEnv = z.infer<typeof envSchema>;

/**
 * Validates environment variables against the schema
 * 
 * @param env - Environment variables object (defaults to process.env)
 * @returns Validated and transformed environment variables
 * @throws {Error} If validation fails with detailed error messages
 */
export function validateEnvironment(env: Record<string, string | undefined> = process.env): ValidatedEnv {
  console.log('🔍 Validating environment variables...');
  
  try {
    const validatedEnv = envSchemaWithConditionals.parse(env);
    
    console.log('✅ Environment validation successful!');
    console.log(`📝 Configuration summary:`);
    console.log(`   - Environment: ${validatedEnv.NODE_ENV}`);
    console.log(`   - Database: ${validatedEnv.DATABASE_URL ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   - Session Secret: ${validatedEnv.SESSION_SECRET ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   - Port: ${validatedEnv.PORT}`);
    
    if (validatedEnv.NODE_ENV === 'production') {
      console.log(`   - Replit ID: ${validatedEnv.REPL_ID ? '✅ Configured' : '❌ Missing'}`);
      console.log(`   - Allowed Domains: ${validatedEnv.REPLIT_DOMAINS ? validatedEnv.REPLIT_DOMAINS.join(', ') : '❌ Missing'}`);
    }
    
    return validatedEnv;
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      console.error('');
      
      // Group errors by field for better readability
      const errorsByField: Record<string, string[]> = {};
      
      for (const issue of error.issues) {
        const field = issue.path.join('.');
        if (!errorsByField[field]) {
          errorsByField[field] = [];
        }
        errorsByField[field].push(issue.message);
      }
      
      // Print formatted errors
      for (const [field, messages] of Object.entries(errorsByField)) {
        console.error(`🔸 ${field.toUpperCase()}:`);
        for (const message of messages) {
          console.error(`   - ${message}`);
        }
        console.error('');
      }
      
      console.error('💡 Please check your environment variables and try again.');
      console.error('💡 You can use the .env.example file as a reference.');
      
      // Create a detailed error message
      const errorMessage = `Environment validation failed:\n${Object.entries(errorsByField)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join('\n')}`;
      
      throw new Error(errorMessage);
    }
    
    // Re-throw non-Zod errors
    throw error;
  }
}

/**
 * Validates environment and exits process if validation fails
 * This function should be called early in the application lifecycle
 * 
 * @param env - Environment variables object (defaults to process.env)
 * @returns Validated environment variables
 */
export function validateEnvironmentOrExit(env?: Record<string, string | undefined>): ValidatedEnv {
  try {
    return validateEnvironment(env);
  } catch (error) {
    console.error('');
    console.error('🚨 CRITICAL: Environment validation failed');
    console.error('🚨 Application cannot start safely with invalid configuration');
    console.error('');
    
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error('Unknown validation error:', error);
    }
    
    console.error('');
    console.error('Process will exit with code 1');
    process.exit(1);
  }
}

/**
 * Development helper: Generate a secure random SESSION_SECRET
 * 
 * @returns A cryptographically secure random string suitable for SESSION_SECRET
 */
export function generateSessionSecret(): string {
  if (typeof crypto !== 'undefined' && crypto.randomBytes) {
    // Node.js crypto module
    return crypto.randomBytes(32).toString('hex');
  } else {
    // Fallback for environments without crypto
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

/**
 * Export the validated environment variables for use throughout the application
 * This should be imported and used instead of accessing process.env directly
 * Only run validation when explicitly called, not during module import
 */
export let env: ValidatedEnv | undefined = undefined;
