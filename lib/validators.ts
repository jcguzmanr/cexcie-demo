import { ZodTypeAny, z } from "zod";

export function safeParseArray<T>(schema: ZodTypeAny, data: unknown) {
  const arraySchema = z.array(schema);
  const parsed = arraySchema.safeParse(data);
  if (parsed.success) return { items: parsed.data as T[], warnings: [] as string[] };
  return { items: [] as T[], warnings: [parsed.error.message] };
}

export function safeParse<T>(schema: ZodTypeAny, data: unknown) {
  const parsed = schema.safeParse(data);
  if (parsed.success) return { item: parsed.data as T, warnings: [] as string[] };
  return { item: undefined, warnings: [parsed.error.message] };
}

