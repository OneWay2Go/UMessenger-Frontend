import React from 'react';
import { ChatList } from '../ChatList/ChatList';
import { ConversationView } from '../Conversation/ConversationView';
import './MainLayout.css';

export const MainLayout: React.FC = () => {
  return (
    <div className="main-layout">
      <div className="chat-list-panel">
        <ChatList />
      </div>
      <div className="conversation-panel">
        <ConversationView />
      </div>
    </div>
  );
};

