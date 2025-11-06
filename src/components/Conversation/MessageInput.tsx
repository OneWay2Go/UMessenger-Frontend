import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { signalRService } from '../../services/signalRService';
import { messageService } from '../../services/messageService';
import type { AddMessageDto } from '../../types/message';
import * as signalR from '@microsoft/signalr';
import { FiSmile, FiPaperclip, FiMic, FiSend } from 'react-icons/fi';
import './MessageInput.css';

export const MessageInput: React.FC = () => {
  const { user } = useAuth();
  const { selectedChat } = useChat();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check SignalR connection status
  useEffect(() => {
    const checkConnection = () => {
      const state = signalRService.getConnectionState();
      if (state === signalR.HubConnectionState.Connected) {
        setConnectionStatus('');
      } else if (state === signalR.HubConnectionState.Connecting) {
        setConnectionStatus('Connecting...');
      } else if (state === signalR.HubConnectionState.Disconnected) {
        setConnectionStatus('Disconnected');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 2000);
    return () => clearInterval(interval);
  }, []);

  // Always show the input, but disable it if no chat is selected
  const isDisabled = !selectedChat || !selectedChat.id || !user;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageContent = message.trim();
    
    if (!messageContent || !user || !selectedChat?.id || isSending) {
      return;
    }

    setIsSending(true);
    setError(null);
    
    const messageDto: AddMessageDto = {
      content: messageContent,
      senderId: user.id,
      chatId: selectedChat.id,
      isAttachment: false,
    };

    // Clear input immediately for better UX
    setMessage('');

    let messageRestored = false;

    try {
      // Ensure SignalR connection is established
      const connectionState = signalRService.getConnectionState();
      if (connectionState !== signalR.HubConnectionState.Connected) {
        try {
          await signalRService.start();
        } catch (startError) {
          console.warn('Failed to start SignalR, using REST API:', startError);
          // Fallback to REST API if SignalR fails
          await messageService.add(messageDto);
          setIsSending(false);
          return;
        }
      }

      // Try SignalR first for real-time delivery
      try {
        await signalRService.sendMessage(messageDto);
        // Message sent successfully via SignalR
      } catch (signalRError) {
        console.warn('SignalR send failed, falling back to REST API:', signalRError);
        // Fallback to REST API
        try {
          await messageService.add(messageDto);
        } catch (restError) {
          // If both fail, restore message and show error
          setMessage(messageContent);
          messageRestored = true;
          setError('Failed to send message. Please check your connection and try again.');
          throw restError;
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Error message is already set in the catch block above if REST API fails
      // This catch is for any other unexpected errors
      if (!messageRestored) {
        // Only show error if message wasn't already restored
        setMessage(messageContent);
        setError('Failed to send message. Please try again.');
      }
    } finally {
      setIsSending(false);
      // Refocus input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedChat?.id) return;

    // For now, we'll just show a placeholder
    // File upload would need backend support
    console.log('File selected:', file);
    // TODO: Implement file upload functionality
    alert('File upload functionality will be implemented soon');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !isSending) {
        handleSubmit(e);
      }
    }
  };

  const canSend = message.trim().length > 0 && !isSending;

  return (
    <div className="message-input-container">
      {error && (
        <div className="message-error">
          <span>{error}</span>
          <button
            className="error-close"
            onClick={() => setError(null)}
            aria-label="Close error"
          >
            ×
          </button>
        </div>
      )}
      {connectionStatus && (
        <div className="connection-status">
          {connectionStatus}
        </div>
      )}
      <form onSubmit={handleSubmit} className="message-input-form">
        <button
          type="button"
          className="input-icon-button"
          onClick={() => fileInputRef.current?.click()}
          title="Attach file"
          disabled={isSending || isDisabled}
        >
          <FiPaperclip size={20} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileSelect}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        />
        <input
          ref={inputRef}
          type="text"
          className="message-input"
          placeholder={isDisabled ? "Select a chat to start messaging..." : "Type a message..."}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setError(null);
          }}
          disabled={isSending || isDisabled}
          onKeyDown={handleKeyDown}
          maxLength={5000}
        />
        <button
          type="button"
          className="input-icon-button"
          title="Emoji picker (coming soon)"
          disabled={isSending || isDisabled}
        >
          <FiSmile size={20} />
        </button>
        {canSend && !isDisabled ? (
          <button
            type="submit"
            className="input-icon-button send-button"
            title="Send message"
            disabled={isSending}
          >
            <FiSend size={20} />
          </button>
        ) : (
          <button
            type="button"
            className="input-icon-button"
            title={isDisabled ? "Select a chat to send messages" : "Voice message (coming soon)"}
            disabled={isSending || isDisabled || !message.trim()}
          >
            <FiMic size={20} />
          </button>
        )}
        {isSending && (
          <div className="sending-indicator">
            <span className="sending-dot"></span>
            <span className="sending-dot"></span>
            <span className="sending-dot"></span>
          </div>
        )}
      </form>
    </div>
  );
};

