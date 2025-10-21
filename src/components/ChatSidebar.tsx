import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { signalRService } from '@/lib/signalr';
import type { Chat, Message } from '@/types/api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Plus, Search, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface ChatSidebarProps {
  selectedChatId: number | null;
  onSelectChat: (chatId: number) => void;
}

const ChatSidebar = ({ selectedChatId, onSelectChat }: ChatSidebarProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();

  const loadChats = async () => {
    try {
      const { data } = await apiClient.getAllChats();
      setChats(data);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    loadChats();

    const handleNewMessage = (message: Message) => {
      setChats((prevChats) => {
        const chatIndex = prevChats.findIndex((c) => c.id === message.chatId);
        if (chatIndex === -1) {
          return prevChats;
        }

        const updatedChat = {
          ...prevChats[chatIndex],
          lastMessage: message,
          unreadCount:
            prevChats[chatIndex].id === selectedChatId
              ? 0
              : (prevChats[chatIndex].unreadCount || 0) + 1,
        };

        const otherChats = prevChats.filter((c) => c.id !== message.chatId);
        return [updatedChat, ...otherChats];
      });
    };

    const unsubscribe = signalRService.onMessage(handleNewMessage);

    return () => {
      unsubscribe();
    };
  }, [selectedChatId]);

  return (
    <div className="w-80 bg-chat-sidebar border-r border-border flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">Messages</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} className="hover:bg-muted">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <MessageCircle className="w-12 h-12 text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground">No chats yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start a conversation</p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-chat-item-hover transition-colors border-b border-border/50 ${
                selectedChatId === chat.id ? 'bg-chat-item-active' : ''
              }`}
            >
              <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(chat.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm truncate">{chat.name}</h3>
                  {chat.lastMessage && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(chat.lastMessage.sentAt), 'HH:mm')}
                    </span>
                  )}
                </div>
                {chat.lastMessage && (
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage.content}
                  </p>
                )}
                {chat.unreadCount && chat.unreadCount > 0 && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full font-medium">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-t border-border">
        <Button className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>
    </div>
  );
};

export default ChatSidebar;
