import { useEffect, useState, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { signalRService } from '@/lib/signalr';
import { Chat, Message, AddMessageDto, UpdateMessageDto, ChatType } from '@/types/api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, MoreVertical, Trash2, Pencil, X, Check, ShieldBan } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface ChatWindowProps {
  chatId: number;
}

const ChatWindow = ({ chatId }: ChatWindowProps) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const loadDataAndConnect = async () => {
      setIsLoading(true);
      try {
        const chatResponse = await apiClient.getChatById(chatId);
        const messagesResponse = await apiClient.getMessagesByChatId(chatId);
        
        if (isMounted) {
          setChat(chatResponse.data);
          setMessages(messagesResponse.data);
        }
      } catch (error) {
        console.error('Failed to load chat data:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load chat data.' });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDataAndConnect();
    console.log('ChatWindow props:', { chatId });

    const setupSignalR = () => {
      signalRService.addToGroup(chatId.toString());

      const onNewMessage = (message: Message) => {
        if (message.chatId === chatId) {
          setMessages((prev) => [...prev, message]);
        }
      };

      const onEditMessage = (messageId: number, newContent: string) => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: newContent } : m));
      };

      const onDeleteMessage = (deletedChatId: number, messageId: number) => {
        if (deletedChatId === chatId) {
          setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: '[This message was deleted]', isDeleted: true } : m));
        }
      };

      const unsubscribeNew = signalRService.onMessage(onNewMessage);
      const unsubscribeEdit = signalRService.onMessageEdited(onEditMessage);
      const unsubscribeDelete = signalRService.onMessageDeleted(onDeleteMessage);

      return () => {
        unsubscribeNew();
        unsubscribeEdit();
        unsubscribeDelete();
        signalRService.removeFromGroup(chatId.toString());
      };
    };

    const signalRCleanup = setupSignalR();

    return () => {
      isMounted = false;
      signalRCleanup();
    };
  }, [chatId, toast]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    const messageDto: AddMessageDto = { content: newMessage, isAttachment: false, senderId: user.id, chatId };
    await signalRService.sendMessage(messageDto);
    setNewMessage('');
  };

  const handleEdit = (message: Message) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId || !editingContent.trim()) return;
    const messageToUpdate: UpdateMessageDto = { id: editingMessageId, content: editingContent };
    try {
      await apiClient.updateMessage(messageToUpdate);
      handleCancelEdit();
    } catch (error) {
      console.error("Failed to update message:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save message.' });
    }
  };

  const handleDelete = async (messageId: number) => {
    try {
      await apiClient.removeMessage(messageId);
    } catch (error) {
      console.error("Failed to delete message:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete message.' });
    }
  };

  const getInitials = (name: string) => name.split(' ').map((word) => word[0]).join('').toUpperCase().slice(0, 2);

  if (isLoading || !chat) {
    return <div className="flex-1 flex items-center justify-center bg-chat-bg"><p className="text-muted-foreground">Loading chat...</p></div>;
  }

  const isChannel = chat.type === ChatType.PublicChannel || chat.type === ChatType.PrivateChannel;
  const canSendMessage = !isChannel || chat.currentUserRole === 'Admin';

  return (
    <div className="flex-1 flex flex-col bg-chat-bg">
      <div className="bg-background border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10"><AvatarFallback className="bg-primary/10 text-primary font-semibold">{getInitials(chat.name)}</AvatarFallback></Avatar>
          <div><h2 className="font-semibold">{chat.name}</h2><p className="text-xs text-muted-foreground">Online</p></div>
        </div>
        <Button variant="ghost" size="icon"><MoreVertical className="w-5 h-5" /></Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map((message) => (
          <MessageItem 
            key={message.id} 
            message={message} 
            isOwnMessage={message.senderId === user?.id}
            isEditing={editingMessageId === message.id}
            onEdit={() => handleEdit(message)}
            onCancelEdit={handleCancelEdit}
            onSaveEdit={handleSaveEdit}
            onDelete={handleDelete}
            editingContent={editingContent}
            setEditingContent={setEditingContent}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-background border-t border-border p-4">
        {canSendMessage ? (
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="icon"><Paperclip className="w-5 h-5" /></Button>
            <Input placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} disabled={isLoading} className="flex-1" />
            <Button type="submit" disabled={isLoading || !newMessage.trim()} size="icon"><Send className="w-5 h-5" /></Button>
          </form>
        ) : (
          <div className="flex items-center justify-center text-sm text-muted-foreground p-2 bg-muted rounded-md">
            <ShieldBan className="w-4 h-4 mr-2" />
            Only admins can send messages in this channel.
          </div>
        )}
      </div>
    </div>
  );
};

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
  isEditing: boolean;
  editingContent: string;
  setEditingContent: (content: string) => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: (messageId: number) => void;
}

const MessageItem = ({ message, isOwnMessage, isEditing, editingContent, setEditingContent, onEdit, onCancelEdit, onSaveEdit, onDelete }: MessageItemProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const renderContent = () => {
    if (isEditing) {
      return (
        <div className="flex-1">
          <Textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} className="text-sm" />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" size="icon" onClick={onCancelEdit}><X className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={onSaveEdit}><Check className="h-4 w-4" /></Button>
          </div>
        </div>
      );
    }
    return (
      <p className={`text-sm break-words ${message.isDeleted ? 'italic text-muted-foreground' : ''}`}>
        {message.content}
      </p>
    );
  }

  return (
    <div className={`group flex items-start gap-3 my-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-1 flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwnMessage ? 'bg-message-sent text-foreground' : 'bg-message-received text-foreground'}`}>
          {renderContent()}
          {!isEditing && (
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {format(new Date(message.sentAt), 'HH:mm')}
            </p>
          )}
        </div>
      </div>
      {isOwnMessage && !isEditing && !message.isDeleted && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onEdit}><Pencil className="w-4 h-4 mr-2"/>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2"/>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete your message.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(message.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ChatWindow;
