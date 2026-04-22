import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
  name: z.string().min(2, "Минимум 2 символа").optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export const publicationSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа").max(60, "Максимум 60 символов"),
  slug: z
    .string()
    .min(2, "Минимум 2 символа")
    .max(40, "Максимум 40 символов")
    .regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  description: z.string().max(300, "Максимум 300 символов").optional(),
});

export const postSchema = z.object({
  title: z.string().min(1, "Введите заголовок").max(200, "Максимум 200 символов"),
  subtitle: z.string().max(300).optional(),
  content: z.any().optional(),
  accessLevel: z.enum(["FREE", "PAID"]).default("FREE"),
});

export const subscribeSchema = z.object({
  email: z.string().email("Введите корректный email"),
  publicationId: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PublicationInput = z.infer<typeof publicationSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type SubscribeInput = z.infer<typeof subscribeSchema>;
