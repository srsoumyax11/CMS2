import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MessageSquare, Send } from 'lucide-react';

export interface CommentItem {
  id: string;
  authorName: string;
  authorRole: string;
  comment: string;
  createdAt: string;
}

interface CommentThreadProps {
  comments: CommentItem[];
  onAddComment?: (comment: string) => Promise<void>;
}

export const CommentThread: React.FC<CommentThreadProps> = ({ comments, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !onAddComment) return;

    try {
      setIsSubmitting(true);
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground italic space-y-1">
            <MessageSquare className="h-6 w-6 mx-auto text-muted-foreground/50" />
            <p>No discussion comments yet.</p>
          </div>
        ) : (
          comments.map((cm) => (
            <div key={cm.id} className="border rounded-lg p-3 bg-card space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-foreground">
                  {cm.authorName} ({cm.authorRole})
                </span>
                <span className="text-muted-foreground">{cm.createdAt}</span>
              </div>
              <p className="text-muted-foreground">{cm.comment}</p>
            </div>
          ))
        )}
      </div>

      {onAddComment && (
        <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Post a comment..."
            className="text-xs flex-1"
          />
          <Button type="submit" size="sm" disabled={isSubmitting || !newComment.trim()} className="gap-1">
            <Send className="h-3.5 w-3.5" />
            <span>Send</span>
          </Button>
        </form>
      )}
    </div>
  );
};
