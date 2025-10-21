import { useEffect, useState, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { signalRService } from '@/lib/signalr';
import type { Chat, Message, AddMessageDto } from '@/types/api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, MoreVertical } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ChatWindowProps {
  chatId: number;
}

const ChatWindow = ({ chatId }: ChatWindowProps) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadChat();
    loadMessages();

    let unsubscribe: () => void;
    const connectToChatGroup = async () => {
      try {
        await signalRService.addToGroup(chatId.toString());
        unsubscribe = signalRService.onMessage((message) => {
          if (message.chatId === chatId) {
            setMessages((prev) => [...prev, message]);
          }
        });
      } catch (error) {
        console.error("Failed to join chat group:", error);
        toast({
          variant: 'destructive',
          title: 'Chat Connection Error',
          description: 'Could not connect to chat. Please try again.',
        });
      }
    };

    connectToChatGroup();

    return () => {
      const leaveGroup = async () => {
        try {
          await signalRService.removeFromGroup(chatId.toString());
        } catch (error) {
          console.error("Failed to leave chat group:", error);
        }
      };
      leaveGroup();
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [chatId, toast]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChat = async () => {
    try {
      const { data } = await apiClient.getChatById(chatId);
      setChat(data);
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const { data } = await apiClient.getMessagesByChatId(chatId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageDto: AddMessageDto = {
      content: newMessage,
      isAttachment: false,
      senderId: user.id,
      chatId,
    };

    await signalRService.sendMessage(messageDto);
    setNewMessage('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-chat-bg">
        <div className="text-center">
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-chat-bg">
      {/* Header */}
      <div className="bg-background border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(chat.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{chat.name}</h2>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            // console.log(message); // Removed
            const isOwnMessage = message.senderId === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-message-sent text-foreground'
                      : 'bg-message-received text-foreground'
                  }`}
                >
                  <p className="text-sm break-words">{message.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(message.sentAt), 'HH:mm')}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-background border-t border-border p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon">
            <Paperclip className="w-5 h-5" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
            }}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !newMessage.trim()} size="icon">
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
