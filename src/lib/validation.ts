import { z } from 'zod';

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Невірний ID');

export const leadStatusSchema = z.enum([
  'Новий',
  'В роботі',
  'Конвертовано',
  'Відмова',
]);

export const createLeadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  contact: z.string().trim().min(4).max(100),
  experience: z.string().trim().max(500).optional(),
  selections: z.array(z.string().trim().max(200)).max(30).optional(),
  type: z.string().trim().max(100).optional(),
  captcha: z.string().min(1, 'Капча обовʼязкова'),
});

export const patchLeadSchema = z.object({
  id: objectIdSchema,
  status: leadStatusSchema,
});

export const createReviewSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  text: z.string().trim().min(3).max(2000),
  source: z.string().trim().max(100).optional(),
});

export const patchReviewSchema = z.object({
  id: objectIdSchema,
  isApproved: z.boolean(),
});

export const createClientSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(4).max(100),
  source: z.string().trim().max(100).optional(),
  date: z.string().trim().max(50).optional(),
  service: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const patchClientSchema = z.object({
  id: objectIdSchema,
  visits: z.array(z.unknown()).optional(),
  nextAppointment: z.string().max(100).optional(),
  generalNotes: z.string().max(5000).optional(),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1).max(200),
});
