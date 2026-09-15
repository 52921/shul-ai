import { z } from "zod";
import { insertConversationSchema, conversations, messages } from "./schema";

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  conversations: {
    list: {
      method: "GET" as const,
      path: "/api/conversations" as const,
      responses: { 200: z.array(z.custom<typeof conversations.$inferSelect>()) },
    },
    get: {
      method: "GET" as const,
      path: "/api/conversations/:id" as const,
      responses: {
        200: z.custom<typeof conversations.$inferSelect & { messages: typeof messages.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/conversations" as const,
      input: insertConversationSchema,
      responses: {
        201: z.custom<typeof conversations.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/conversations/:id" as const,
      input: insertConversationSchema.partial(),
      responses: {
        200: z.custom<typeof conversations.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/conversations/:id" as const,
      responses: { 204: z.void(), 404: errorSchemas.notFound },
    },
    chat: {
      method: "POST" as const,
      path: "/api/conversations/:id/chat" as const,
      input: z.object({ 
        content: z.string(),
        imageUrl: z.string().optional()
      }),
      responses: {
        200: z.any(), // SSE stream
        404: errorSchemas.notFound,
      }
    },
    upload: {
      method: "POST" as const,
      path: "/api/upload" as const,
      responses: {
        200: z.object({ url: z.string() }),
        400: errorSchemas.validation,
      }
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
