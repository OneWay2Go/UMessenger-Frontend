import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { chatService } from '../../services/chatService';
import { messageService } from '../../services/messageService';
import { signalRService } from '../../services/signalRService';
import type { ChatDto } from '../../types/chat';
import type { Message } from '../../types/message';
import type { User } from '../../types/user';
import { ChatItem } from './ChatItem';
import { GlobalSearch } from './GlobalSearch';
import { HamburgerMenu } from './HamburgerMenu';
import { CreateChatModal } from './CreateChatModal';
import { FiMenu, FiSearch, FiPlus } from 'react-icons/fi';
import './ChatList.css';

export const ChatList: React.FC = () => {
  const { user } = useAuth();
  const { selectedChat, setSelectedChat } = useChat();
  const [chats, setChats] = useState<ChatDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastMessages, setLastMessages] = useState<Record<number, { content: string; timestamp: string }>>({});
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);
  const [isCreateChatOpen, setIsCreateChatOpen] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    // Load last messages for all chats
    const loadLastMessages = async () => {
      for (const chat of chats) {
        if (chat.id) {
          try {
            const messages = await messageService.getByChatId(chat.id);
            if (messages.length > 0) {
              const lastMsg = messages[messages.length - 1];
              setLastMessages((prev) => ({
                ...prev,
                [chat.id]: {
                  content: lastMsg.content,
                  timestamp: lastMsg.sentAt,
                },
              }));
            }
          } catch (error) {
            console.error(`Error loading last message for chat ${chat.id}:`, error);
          }
        }
      }
    };

    if (chats.length > 0) {
      loadLastMessages();
    }
  }, [chats]);

  useEffect(() => {
    // Listen for new messages to update chat list
    const handleReceiveMessage = (message: Message) => {
      setLastMessages((prev) => ({
        ...prev,
        [message.chatId]: {
          content: message.content,
          timestamp: message.sentAt,
        },
      }));
      // Refresh chats to update order
      loadChats();
    };

    signalRService.onReceiveMessage(handleReceiveMessage);

    return () => {
      signalRService.offReceiveMessage();
    };
  }, []);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const allChats = await chatService.getAll();
      // Workaround: Backend ChatDto doesn't include Id, so we get it from chatUsers
      const chatsWithId = allChats.map((chat) => {
        if (!chat.id && chat.chatUsers && chat.chatUsers.length > 0) {
          return { ...chat, id: chat.chatUsers[0].chatId };
        }
        return chat;
      });
      setChats(chatsWithId);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLastMessage = (chat: ChatDto): string => {
    if (chat.id && lastMessages[chat.id]) {
      return lastMessages[chat.id].content;
    }
    return 'No messages yet';
  };

  const getOtherUser = (chat: ChatDto) => {
    if (!chat.chatUsers || chat.chatUsers.length === 0) return null;
    const otherUser = chat.chatUsers.find((cu) => cu.user?.id !== user?.id);
    return otherUser?.user;
  };

  const handleSelectUser = async (selectedUser: User) => {
    try {
      // Check if one-on-one chat exists
      const existingChat = await chatService.oneOnOne(selectedUser.id);
      if (existingChat && existingChat.id) {
        // Get full chat details
        const chatDetails = await chatService.getById(existingChat.id);
        setSelectedChat(chatDetails);
      } else {
        // Create new chat
        const newChatId = await chatService.add({
          name: 'New private chat',
          chatType: 0, // Private
        });
        // Add both users to chat
        await chatService.addChatUser({ chatId: newChatId, userId: user!.id });
        await chatService.addChatUser({ chatId: newChatId, userId: selectedUser.id });
        // Reload chats
        await loadChats();
        // Select the new chat
        const chatDetails = await chatService.getById(newChatId);
        setSelectedChat(chatDetails);
      }
    } catch (error) {
      console.error('Error creating/selecting chat:', error);
    }
  };

  const handleSelectChat = async (chatId: number) => {
    try {
      const chatDetails = await chatService.getById(chatId);
      setSelectedChat(chatDetails);
    } catch (error) {
      console.error('Error selecting chat:', error);
    }
  };

  return (
    <div className="chat-list">
      <GlobalSearch
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onSelectUser={handleSelectUser}
        onSelectChat={handleSelectChat}
      />
      <HamburgerMenu
        isOpen={isHamburgerMenuOpen}
        onClose={() => setIsHamburgerMenuOpen(false)}
      />
      <CreateChatModal
        isOpen={isCreateChatOpen}
        onClose={() => setIsCreateChatOpen(false)}
        onChatCreated={loadChats}
      />
      <div className="chat-list-header">
        <button
          className="menu-button"
          title="Menu"
          onClick={() => setIsHamburgerMenuOpen(true)}
        >
          <FiMenu size={20} />
        </button>
        <div className="search-container">
          <FiSearch className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsGlobalSearchOpen(true)}
            className="search-input"
          />
        </div>
        <button
          className="create-chat-button"
          title="Create new chat"
          onClick={() => setIsCreateChatOpen(true)}
        >
          <FiPlus size={20} />
        </button>
      </div>
      <div className="chat-list-content">
        {isLoading ? (
          <div className="loading">Loading chats...</div>
        ) : filteredChats.length === 0 ? (
          <div className="empty-state">No chats found</div>
        ) : (
          filteredChats.map((chat) => {
            const otherUser = getOtherUser(chat);
            const displayName = chat.type === 0 && otherUser 
              ? (otherUser.displayName || otherUser.username || otherUser.email)
              : chat.name;
            const avatarUrl = chat.type === 0 && otherUser
              ? otherUser.profileImageUrl
              : chat.chatImageUrl;

            return (
              <ChatItem
                key={chat.id}
                chat={chat}
                displayName={displayName}
                avatarUrl={avatarUrl}
                lastMessage={getLastMessage(chat)}
                isActive={selectedChat?.id === chat.id}
                onClick={() => setSelectedChat(chat)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

