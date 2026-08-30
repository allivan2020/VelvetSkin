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
  nextAppointment: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal('')),
  nextAppointmentTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .optional()
    .or(z.literal('')),
  nextAppointmentService: z.string().trim().max(500).optional(),
});

export const patchClientSchema = z.object({
  id: objectIdSchema,
  visits: z.array(z.unknown()).optional(),
  nextAppointment: z
    .string()
    .max(100)
    .optional(),
  nextAppointmentTime: z.string().max(10).optional(),
  nextAppointmentService: z.string().max(500).optional(),
  generalNotes: z.string().max(5000).optional(),
});

export const agentProposedActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('set_appointment'),
    clientId: objectIdSchema,
    clientName: z.string().min(1).max(100),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    service: z.string().max(500).optional(),
  }),
  z.object({
    type: z.literal('clear_appointment'),
    clientId: objectIdSchema,
    clientName: z.string().min(1).max(100),
  }),
]);

export const agentChatSchema = z
  .object({
    message: z.string().trim().max(2000).optional(),
    history: z
      .array(
        z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string().max(4000),
        }),
      )
      .max(20)
      .optional(),
    confirm: agentProposedActionSchema.optional(),
  })
  .refine((data) => Boolean(data.confirm) || Boolean(data.message?.trim()), {
    message: 'Потрібне повідомлення або підтвердження',
  });

export const adminLoginSchema = z.object({
  password: z.string().min(1).max(200),
});