import React from 'react';
import type { ChatDto } from '../../types/chat';
import './ChatItem.css';

interface ChatItemProps {
  chat: ChatDto;
  displayName: string;
  avatarUrl?: string;
  lastMessage: string;
  isActive: boolean;
  onClick: (chatId: number) => void;
}

export const ChatItem: React.FC<ChatItemProps> = ({
  chat,
  displayName,
  avatarUrl,
  lastMessage,
  isActive,
  onClick,
}) => {
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={`chat-item ${isActive ? 'active' : ''}`}
      onClick={() => onClick(chat.id)}
    >
      <div className="chat-item-avatar">
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} />
        ) : (
          <div className="avatar-placeholder">
            {getInitials(displayName)}
          </div>
        )}
      </div>
      <div className="chat-item-content">
        <div className="chat-item-header">
          <span className="chat-item-name">{displayName}</span>
          <span className="chat-item-time">Now</span>
        </div>
        <div className="chat-item-preview">{lastMessage}</div>
      </div>
    </div>
  );
};

