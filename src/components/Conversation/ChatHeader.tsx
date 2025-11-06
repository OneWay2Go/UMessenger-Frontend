import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { chatService } from '../../services/chatService';
import { formatLastSeen } from '../../utils/dateUtils';
import { FiSearch, FiPhone, FiMoreVertical, FiEdit2, FiUsers, FiLogOut, FiTrash2, FiX } from 'react-icons/fi';
import './ChatHeader.css';

export const ChatHeader: React.FC = () => {
  const { selectedChat, setSelectedChat } = useChat();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(selectedChat?.name || '');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedChat) {
      setEditName(selectedChat.name);
    }
  }, [selectedChat]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  if (!selectedChat) {
    return (
      <div className="chat-header empty">
        <div className="empty-message">Select a chat to start messaging</div>
      </div>
    );
  }

  const handleUpdateChatName = async () => {
    if (!editName.trim() || !selectedChat.id) return;

    try {
      await chatService.update({ id: selectedChat.id, name: editName.trim() });
      setIsEditingName(false);
      // Reload chat to get updated name
      const updatedChat = await chatService.getById(selectedChat.id);
      setSelectedChat(updatedChat);
    } catch (error) {
      console.error('Error updating chat name:', error);
      setEditName(selectedChat.name);
    }
  };

  const handleLeaveChat = async () => {
    if (!confirm('Are you sure you want to leave this chat?')) return;

    try {
      // Find current user's chatUser entry
      const chatUser = selectedChat.chatUsers?.find((cu) => cu.userId === user?.id);
      if (chatUser?.id) {
        await chatService.removeChatUser(chatUser.id);
        setSelectedChat(null);
      }
    } catch (error) {
      console.error('Error leaving chat:', error);
    }
  };

  const handleDeleteChat = async () => {
    if (!confirm('Are you sure you want to delete this chat? This action cannot be undone.')) return;

    try {
      if (selectedChat.id) {
        await chatService.remove(selectedChat.id);
        setSelectedChat(null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const getOtherUser = () => {
    if (!selectedChat.chatUsers || selectedChat.chatUsers.length === 0) return null;
    const otherUser = selectedChat.chatUsers.find((cu) => cu.user?.id !== user?.id);
    return otherUser?.user;
  };

  const otherUser = getOtherUser();
  const displayName = selectedChat.type === 0 && otherUser
    ? (otherUser.displayName || otherUser.username || otherUser.email)
    : selectedChat.name;
  const avatarUrl = selectedChat.type === 0 && otherUser
    ? otherUser.profileImageUrl
    : selectedChat.chatImageUrl;
  const lastSeen = selectedChat.type === 0 && otherUser
    ? formatLastSeen(otherUser.lastSeen)
    : '';
  const canEdit = selectedChat.type !== 0; // Can only edit group/channel names, not private chats

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="chat-header">
      <div className="chat-header-left">
        <div className="chat-header-avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} />
          ) : (
            <div className="avatar-placeholder">
              {getInitials(displayName)}
            </div>
          )}
        </div>
        <div className="chat-header-info">
          {isEditingName ? (
            <div className="chat-name-edit">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateChatName();
                  } else if (e.key === 'Escape') {
                    setIsEditingName(false);
                    setEditName(selectedChat.name);
                  }
                }}
                className="chat-name-input"
                autoFocus
              />
              <button className="save-button" onClick={handleUpdateChatName}>
                Save
              </button>
              <button
                className="cancel-button"
                onClick={() => {
                  setIsEditingName(false);
                  setEditName(selectedChat.name);
                }}
              >
                <FiX size={16} />
              </button>
            </div>
          ) : (
            <>
              <div className="chat-header-name">{displayName}</div>
              {lastSeen && <div className="chat-header-status">{lastSeen}</div>}
            </>
          )}
        </div>
      </div>
      <div className="chat-header-actions">
        <button className="header-action-button" title="Search in chat">
          <FiSearch size={20} />
        </button>
        <button className="header-action-button" title="Call">
          <FiPhone size={20} />
        </button>
        <div className="more-options" ref={menuRef}>
          <button
            className="header-action-button"
            onClick={() => setShowMenu(!showMenu)}
            title="More options"
          >
            <FiMoreVertical size={20} />
          </button>
          {showMenu && (
            <div className="more-options-menu">
              {canEdit && (
                <button
                  className="menu-option"
                  onClick={() => {
                    setIsEditingName(true);
                    setShowMenu(false);
                  }}
                >
                  <FiEdit2 size={16} />
                  <span>Edit Chat Name</span>
                </button>
              )}
              <button className="menu-option" onClick={() => setShowMenu(false)}>
                <FiUsers size={16} />
                <span>View Members</span>
              </button>
              <button className="menu-option" onClick={handleLeaveChat}>
                <FiLogOut size={16} />
                <span>Leave Chat</span>
              </button>
              <button className="menu-option danger" onClick={handleDeleteChat}>
                <FiTrash2 size={16} />
                <span>Delete Chat</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
