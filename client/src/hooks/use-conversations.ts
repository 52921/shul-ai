import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertConversation } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { getSessionId } from "@/lib/session";

function sessionHeader() {
  return { "X-Session-Id": getSessionId() };
}

export function useConversations() {
  return useQuery({
    queryKey: [api.conversations.list.path],
    queryFn: async () => {
      const res = await fetch(api.conversations.list.path, { headers: sessionHeader() });
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return api.conversations.list.responses[200].parse(await res.json());
    },
  });
}

export function useConversation(id: number) {
  return useQuery({
    queryKey: [api.conversations.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.conversations.get.path, { id });
      const res = await fetch(url, { headers: sessionHeader() });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return api.conversations.get.responses[200].parse(await res.json());
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (data: InsertConversation) => {
      const res = await fetch(api.conversations.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...sessionHeader() },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      return api.conversations.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.conversations.list.path] });
      setLocation(`/c/${data.id}`);
      toast({ title: "Conversation created" });
    },
    onError: () => {
      toast({ title: "Error creating conversation", variant: "destructive" });
    },
  });
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertConversation>) => {
      const url = buildUrl(api.conversations.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...sessionHeader() },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update conversation");
      return api.conversations.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.conversations.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.conversations.get.path, data.id] });
      toast({ title: "Settings updated" });
    },
    onError: () => {
      toast({ title: "Failed to update settings", variant: "destructive" });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.conversations.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", headers: sessionHeader() });
      if (!res.ok) throw new Error("Failed to delete conversation");
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [api.conversations.list.path] });
      queryClient.removeQueries({ queryKey: [api.conversations.get.path, id] });
      setLocation("/");
      toast({ title: "Conversation deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete", variant: "destructive" });
    },
  });
}
