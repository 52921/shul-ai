import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateConversation, useDeleteConversation } from "@/hooks/use-conversations";
import { Settings, Trash2 } from "lucide-react";
import { type Conversation } from "@shared/schema";

interface ConversationSettingsModalProps {
  conversation: Conversation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConversationSettingsModal({ conversation, open, onOpenChange }: ConversationSettingsModalProps) {
  const updateMutation = useUpdateConversation();
  const deleteMutation = useDeleteConversation();
  
  const [title, setTitle] = useState(conversation.title);
  const [characterName, setCharacterName] = useState(conversation.characterName);
  const [systemPrompt, setSystemPrompt] = useState(conversation.systemPrompt);

  useEffect(() => {
    if (open) {
      setTitle(conversation.title);
      setCharacterName(conversation.characterName);
      setSystemPrompt(conversation.systemPrompt);
    }
  }, [open, conversation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(
      { id: conversation.id, title, characterName, systemPrompt },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this conversation? This action cannot be undone.")) {
      deleteMutation.mutate(conversation.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-5 h-5 text-muted-foreground" />
            Chat Settings
          </DialogTitle>
          <DialogDescription>
            Adjust the AI's identity and prompt for this chat.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title" className="text-sm font-semibold">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-muted/30 focus-visible:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-characterName" className="text-sm font-semibold">AI Name</Label>
            <Input
              id="edit-characterName"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              required
              className="bg-muted/30 focus-visible:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-systemPrompt" className="text-sm font-semibold">System Prompt</Label>
            <Textarea
              id="edit-systemPrompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              required
              rows={4}
              className="bg-muted/30 focus-visible:ring-primary/50 resize-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-border/50">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Chat
            </Button>
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
                className="rounded-xl bg-primary hover:bg-primary/90"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
