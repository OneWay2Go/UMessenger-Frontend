import { useState } from 'react';
import ChatSidebar from '@/components/ChatSidebar';
import ChatWindow from '@/components/ChatWindow';
import { MessageCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

const Chat = () => {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

  const handleSelectChat = async (chatId: number, type: 'user' | 'chat' = 'chat', secondUserId?: number) => {
    console.log('Selected chat ID:', chatId);
    if (type === 'user' && secondUserId) {
      try {
        const { data: newChat } = await apiClient.getOrCreateOneOnOneChat(secondUserId);
        setSelectedChatId(newChat.id);
      } catch (error) {
        console.error('Failed to create or get one-on-one chat:', error);
      }
    } else {
      setSelectedChatId(chatId);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar selectedChatId={selectedChatId} onSelectChat={handleSelectChat} />
      {selectedChatId ? (
        <ChatWindow key={selectedChatId} chatId={selectedChatId} />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-chat-bg">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2">Select a chat</h2>
            <p className="text-muted-foreground">Choose a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
