import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
});

export const sessions = sqliteTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

export const verificationTokens = sqliteTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

// --- Forge domain tables ---

export const skills = sqliteTable('skills', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  icon: text('icon').notNull().default('🎯'),
  type: text('type', { enum: ['reps', 'duration', 'boolean', 'numeric'] }).notNull(),
  unit: text('unit'),
  category: text('category', { enum: ['bodyweight', 'cardio', 'mental', 'recovery', 'custom'] }).notNull().default('custom'),
  currentLevel: real('current_level').notNull().default(0),
  goal: real('goal').notNull().default(0),
  assisted: integer('assisted', { mode: 'boolean' }).default(false),
  testType: text('test_type'),
  testValue: text('test_value'),
  estimatedVMA: real('estimated_vma'),
  sortOrder: integer('sort_order').notNull().default(0),
  archived: integer('archived', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const questTemplates = sqliteTable('quest_templates', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  skillId: text('skill_id').references(() => skills.id, { onDelete: 'set null' }),
  label: text('label').notNull(),
  type: text('type', { enum: ['main', 'side', 'clean'] }).notNull(),
  category: text('category', { enum: ['body', 'mind', 'recovery', 'identity', 'custom'] }),
  xp: integer('xp').notNull().default(0),
  targetType: text('target_type', { enum: ['reps', 'duration', 'boolean', 'numeric'] }).notNull().default('boolean'),
  defaultTarget: real('default_target'),
  unit: text('unit'),
  icon: text('icon'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const dayLogs = sqliteTable('day_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  monkScore: integer('monk_score').notNull().default(0),
  xpEarned: integer('xp_earned').notNull().default(0),
  cleanMultiplier: real('clean_multiplier').notNull().default(1),
  bodyIntegrity: integer('body_integrity').notNull().default(100),
  focusIntegrity: integer('focus_integrity').notNull().default(100),
  recoveryScore: integer('recovery_score').notNull().default(100),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const questEntries = sqliteTable('quest_entries', {
  id: text('id').primaryKey(),
  dayLogId: text('day_log_id').notNull().references(() => dayLogs.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  templateId: text('template_id').references(() => questTemplates.id, { onDelete: 'set null' }),
  label: text('label').notNull(),
  type: text('type', { enum: ['main', 'side', 'clean'] }).notNull(),
  category: text('category'),
  xp: integer('xp').notNull().default(0),
  done: integer('done', { mode: 'boolean' }).notNull().default(false),
  target: real('target'),
  progress: real('progress').default(0),
  unit: text('unit'),
});

export const userProfiles = sqliteTable('user_profiles', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  archetype: text('archetype'),
  intensity: text('intensity'),
  poisons: text('poisons'),
  name: text('name').notNull().default(''),
  currentDay: integer('current_day').notNull().default(1),
  currentStreak: integer('current_streak').notNull().default(0),
  bestStreak: integer('best_streak').notNull().default(0),
  overallLevel: integer('overall_level').notNull().default(1),
  totalXp: integer('total_xp').notNull().default(0),
  focusLockActive: integer('focus_lock_active', { mode: 'boolean' }).notNull().default(true),
  unlockedApps: text('unlocked_apps'),
  attributes: text('attributes'),
  dailyTimeBudget: integer('daily_time_budget').default(120),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
