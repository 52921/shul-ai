import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateConversation } from "@/hooks/use-conversations";
import { Sparkles, Bot, MessageSquare } from "lucide-react";

interface CreateConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateConversationModal({ open, onOpenChange }: CreateConversationModalProps) {
  const createMutation = useCreateConversation();
  const [title, setTitle] = useState("");
  const [characterName, setCharacterName] = useState("Shul");
  const [systemPrompt, setSystemPrompt] = useState("You are Shul, an AI assistant.");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { title: title || "New Chat", characterName, systemPrompt },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl glass-card border-none">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            New Persona
          </DialogTitle>
          <DialogDescription>
            Create a new chat and define the AI's personality.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              Chat Title
            </Label>
            <Input
              id="title"
              placeholder="e.g. Brainstorming"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-muted/50 border-transparent focus-visible:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="characterName" className="text-sm font-semibold flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-muted-foreground" />
              AI Name
            </Label>
            <Input
              id="characterName"
              placeholder="Shul"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              required
              className="bg-muted/50 border-transparent focus-visible:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="systemPrompt" className="text-sm font-semibold">System Prompt</Label>
            <Textarea
              id="systemPrompt"
              placeholder="Describe how the AI should behave..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              required
              rows={4}
              className="bg-muted/50 border-transparent focus-visible:ring-primary/50 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="rounded-xl hover:bg-muted"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending}
              className="rounded-xl shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-blue-500 hover:opacity-90"
            >
              {createMutation.isPending ? "Creating..." : "Start Chatting"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
