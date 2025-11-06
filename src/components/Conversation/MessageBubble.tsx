import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../../types/message';
import { useAuth } from '../../contexts/AuthContext';
import { messageService } from '../../services/messageService';
import { formatMessageTime } from '../../utils/dateUtils';
import { extractYouTubeUrl } from '../../utils/urlPreview';
import { FiMoreVertical, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: Message;
  onMessageUpdated?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onMessageUpdated }) => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isOwnMessage = message.userId === user?.id;
  const youtubePreview = extractYouTubeUrl(message.content);

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

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    try {
      await messageService.update({ id: message.id, content: editContent.trim() });
      setIsEditing(false);
      setShowMenu(false);
      onMessageUpdated?.();
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      setIsDeleting(true);
      await messageService.remove(message.id);
      setShowMenu(false);
      onMessageUpdated?.();
    } catch (error) {
      console.error('Error deleting message:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isDeleting) {
    return (
      <div className={`message-bubble ${isOwnMessage ? 'own' : 'other'}`}>
        <div className="message-content deleted">
          <div className="message-text" style={{ fontStyle: 'italic', opacity: 0.6 }}>
            This message was deleted
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`message-bubble ${isOwnMessage ? 'own' : 'other'}`}>
      {!isOwnMessage && message.user && (
        <div className="message-sender">{message.user.displayName || message.user.username || message.user.email}</div>
      )}
      <div className="message-content-wrapper">
        {isOwnMessage && (
          <div className="message-actions" ref={menuRef}>
            <button
              className="message-action-button"
              onClick={() => setShowMenu(!showMenu)}
              title="More options"
            >
              <FiMoreVertical size={16} />
            </button>
            {showMenu && (
              <div className="message-menu">
                <button
                  className="message-menu-item"
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                >
                  <FiEdit2 size={16} />
                  <span>Edit</span>
                </button>
                <button
                  className="message-menu-item"
                  onClick={handleDelete}
                >
                  <FiTrash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
        <div className="message-content">
        {message.isAttachment && message.fileUrl ? (
          <div className="message-attachment">
            {message.fileType?.startsWith('image/') ? (
              <img src={message.fileUrl} alt={message.fileName || 'Attachment'} className="attachment-image" />
            ) : (
              <div className="attachment-file">
                <div className="attachment-icon">📎</div>
                <div className="attachment-info">
                  <div className="attachment-name">{message.fileName || 'File'}</div>
                  {message.fileSize && (
                    <div className="attachment-size">
                      {(message.fileSize / 1024 / 1024).toFixed(2)} MB
                    </div>
                  )}
                </div>
              </div>
            )}
            {message.content && <div className="attachment-caption">{message.content}</div>}
          </div>
        ) : isEditing ? (
          <div className="message-edit">
            <input
              type="text"
              className="message-edit-input"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleEdit();
                } else if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditContent(message.content);
                }
              }}
              autoFocus
            />
            <div className="message-edit-actions">
              <button
                className="message-edit-button"
                onClick={handleEdit}
                title="Save (Enter)"
              >
                Save
              </button>
              <button
                className="message-edit-button"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(message.content);
                }}
                title="Cancel (Esc)"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>
        ) : (
          <>
            {youtubePreview ? (
              <div className="youtube-preview">
                <a
                  href={youtubePreview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="youtube-link"
                >
                  {youtubePreview.url}
                </a>
                <div className="youtube-card">
                  <div className="youtube-header">YouTube</div>
                  <div className="youtube-title">Cs2 Uzbek tilida</div>
                  {youtubePreview.thumbnail && (
                    <img
                      src={youtubePreview.thumbnail}
                      alt="YouTube thumbnail"
                      className="youtube-thumbnail"
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="message-text">{message.content}</div>
            )}
          </>
        )}
        <div className="message-time">{formatMessageTime(message.sentAt)}</div>
        </div>
      </div>
    </div>
  );
};

