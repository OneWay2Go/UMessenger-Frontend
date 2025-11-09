import React, { useState } from 'react';
import { chatService } from '../../services/chatService';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import type { User } from '../../types/user';
import { ChatType } from '../../types/enums';
import { FiX, FiUser } from 'react-icons/fi';
import './CreateChatModal.css';

interface CreateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: () => void;
}

export const CreateChatModal: React.FC<CreateChatModalProps> = ({
  isOpen,
  onClose,
  onChatCreated,
}) => {
  const { user } = useAuth();
  const [chatName, setChatName] = useState('');
  const [chatType, setChatType] = useState<ChatType>(ChatType.PrivateGroup);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const users = await userService.getAll();
      // Filter out current user
      const filtered = users.filter((u) => u.id !== user?.id);
      setAvailableUsers(filtered);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }, [user?.id]);

  React.useEffect(() => {
    if (isOpen) {
      loadUsers();
    } else {
      setChatName('');
      setChatType(ChatType.PrivateGroup);
      setSelectedUsers([]);
      setSearchQuery('');
    }
  }, [isOpen, loadUsers]);

  const handleUserToggle = (user: User) => {
    setSelectedUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      if (exists) {
        return prev.filter((u) => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleCreate = async () => {
    if (!chatName.trim() || selectedUsers.length === 0) {
      alert('Please enter a chat name and select at least one user');
      return;
    }

    setIsCreating(true);
    try {
      const chatId = await chatService.add({
        name: chatName.trim(),
        chatType: chatType,
      });

      // Add current user to chat
      await chatService.addChatUser({ chatId, userId: user!.id });

      // Add selected users to chat
      for (const selectedUser of selectedUsers) {
        await chatService.addChatUser({ chatId, userId: selectedUser.id });
      }

      onChatCreated();
      onClose();
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Failed to create chat. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  const filteredUsers = availableUsers.filter((u) =>
    (u.displayName || u.username || u.email)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="create-chat-overlay" onClick={onClose}>
      <div className="create-chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-chat-header">
          <h3>Create New Chat</h3>
          <button className="close-button" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>
        <div className="create-chat-content">
          <div className="create-chat-field">
            <label>Chat Name</label>
            <input
              type="text"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              placeholder="Enter chat name"
              className="create-chat-input"
            />
          </div>
          <div className="create-chat-field">
            <label>Chat Type</label>
            <select
              value={chatType}
              onChange={(e) => setChatType(Number(e.target.value) as ChatType)}
              className="create-chat-select"
            >
              <option value={ChatType.PrivateGroup}>Private Group</option>
              <option value={ChatType.PrivateChannel}>Private Channel</option>
              <option value={ChatType.PublicGroup}>Public Group</option>
              <option value={ChatType.PublicChannel}>Public Channel</option>
            </select>
          </div>
          <div className="create-chat-field">
            <label>Add Users</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="create-chat-input"
            />
            <div className="selected-users">
              {selectedUsers.map((u) => (
                <div key={u.id} className="selected-user-tag">
                  {u.displayName || u.username || u.email}
                  <button
                    className="remove-user-button"
                    onClick={() => handleUserToggle(u)}
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="users-list">
              {filteredUsers.map((u) => {
                const isSelected = selectedUsers.some((su) => su.id === u.id);
                return (
                  <div
                    key={u.id}
                    className={`user-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleUserToggle(u)}
                  >
                    <FiUser size={16} />
                    <span>{u.displayName || u.username || u.email}</span>
                    {isSelected && <span className="check-mark">✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="create-chat-actions">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="create-button"
            onClick={handleCreate}
            disabled={isCreating || !chatName.trim() || selectedUsers.length === 0}
          >
            {isCreating ? 'Creating...' : 'Create Chat'}
          </button>
        </div>
      </div>
    </div>
  );
};

