import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { messageService } from '../../services/messageService';
import { signalRService } from '../../services/signalRService';
import type { Message } from '../../types/message';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import './ConversationView.css';

export const ConversationView: React.FC = () => {
  const { selectedChat } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChat?.id) return;

      try {
        setIsLoading(true);
        const chatMessages = await messageService.getByChatId(selectedChat.id);
        // Ensure messages are sorted by sentAt and filter out deleted ones
        const sortedMessages = Array.isArray(chatMessages) 
          ? chatMessages
              .filter((msg) => !msg.isDeleted)
              .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
          : [];
        setMessages(sortedMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedChat?.id) {
      loadMessages();
      // Join SignalR group for this chat
      signalRService.addToGroup(selectedChat.id.toString()).catch((err) => {
        console.error('Failed to join SignalR group:', err);
      });
    } else {
      setMessages([]);
    }

    // Cleanup: Remove from group when chat changes
    return () => {
      if (selectedChat?.id) {
        signalRService.removeFromGroup(selectedChat.id.toString()).catch(console.error);
      }
    };
  }, [selectedChat?.id]);

  useEffect(() => {
    if (!selectedChat?.id) return;

    // Set up SignalR listeners
    const handleReceiveMessage = (message: Message) => {
      if (message.chatId === selectedChat?.id && !message.isDeleted) {
        setMessages((prev) => {
          // Check if message already exists (avoid duplicates)
          const exists = prev.some((msg) => msg.id === message.id);
          if (exists) return prev;
          // Add new message and sort by sentAt
          return [...prev, message].sort(
            (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
          );
        });
      }
    };

    const handleMessageEdited = (messageId: number, content: string) => {
      if (selectedChat?.id) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...msg, content } : msg))
        );
      }
    };

    const handleMessageDeleted = (chatId: number, messageId: number) => {
      if (chatId === selectedChat?.id) {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      }
    };

    signalRService.onReceiveMessage(handleReceiveMessage);
    signalRService.onMessageEdited(handleMessageEdited);
    signalRService.onMessageDeleted(handleMessageDeleted);

    return () => {
      signalRService.offReceiveMessage();
      signalRService.offMessageEdited();
      signalRService.offMessageDeleted();
    };
  }, [selectedChat?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!selectedChat) {
    return (
      <div className="conversation-view empty">
        <div className="empty-conversation">
          <div className="empty-icon">💬</div>
          <div className="empty-text">Select a chat to start messaging</div>
        </div>
      </div>
    );
  }

  return (
    <div className="conversation-view">
      <ChatHeader />
      <div className="messages-container">
        {isLoading ? (
          <div className="loading-messages">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="empty-messages">No messages yet. Start the conversation!</div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onMessageUpdated={() => {
                  // Reload messages after update/delete
                  const loadMessages = async () => {
                    if (!selectedChat?.id) return;
                    try {
                      const chatMessages = await messageService.getByChatId(selectedChat.id);
                      const sortedMessages = Array.isArray(chatMessages)
                        ? chatMessages
                            .filter((msg) => !msg.isDeleted)
                            .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
                        : [];
                      setMessages(sortedMessages);
                    } catch (error) {
                      console.error('Error reloading messages:', error);
                    }
                  };
                  loadMessages();
                }}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <MessageInput />
    </div>
  );
};

