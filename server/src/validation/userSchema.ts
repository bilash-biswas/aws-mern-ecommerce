import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less'),
  email: z.string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
  isAdmin: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z.string()
    .min(1, 'Password is required'),
});

export const profileUpdateSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less')
    .optional(),
  email: z.string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .optional(),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .optional(),
  isAdmin: z.boolean().optional(),
});
