import { useState } from 'react';
import ChatSidebar from '@/components/ChatSidebar';
import ChatWindow from '@/components/ChatWindow';
import { MessageCircle } from 'lucide-react';

const Chat = () => {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar selectedChatId={selectedChatId} onSelectChat={setSelectedChatId} />
      {selectedChatId ? (
        <ChatWindow chatId={selectedChatId} />
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
