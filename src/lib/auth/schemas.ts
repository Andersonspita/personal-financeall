import { z } from "zod";

export const registerInputSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome").max(80, "Nome muito longo"),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres").max(200, "Senha muito longa"),
});

export const loginInputSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z.string().min(1, "Informe sua senha"),
});
