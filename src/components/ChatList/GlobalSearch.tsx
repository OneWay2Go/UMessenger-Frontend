import React, { useState, useEffect } from 'react';
import { chatService } from '../../services/chatService';
import { userService } from '../../services/userService';
import type { GlobalSearchResponseDto } from '../../types/chat';
import type { User } from '../../types/user';
import { FiX, FiUser, FiMessageCircle } from 'react-icons/fi';
import './GlobalSearch.css';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
  onSelectChat: (chatId: number) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  onSelectChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GlobalSearchResponseDto | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const search = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults(null);
        return;
      }

      setIsSearching(true);
      try {
        const [globalResults, userResults] = await Promise.all([
          chatService.globalSearch(searchQuery),
          userService.search(searchQuery),
        ]);

        setSearchResults({
          ...globalResults,
          users: userResults,
        });
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(search, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="global-search-overlay" onClick={onClose}>
      <div className="global-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="global-search-header">
          <h3>Search</h3>
          <button className="close-button" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>
        <div className="global-search-input-container">
          <input
            type="text"
            className="global-search-input"
            placeholder="Search users and chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>
        <div className="global-search-results">
          {isSearching ? (
            <div className="search-loading">Searching...</div>
          ) : searchResults ? (
            <>
              {searchResults.users && searchResults.users.length > 0 && (
                <div className="search-section">
                  <div className="search-section-title">Users</div>
                  {searchResults.users.map((user) => (
                    <div
                      key={user.id}
                      className="search-result-item"
                      onClick={() => {
                        onSelectUser(user);
                        onClose();
                      }}
                    >
                      <FiUser className="search-result-icon" />
                      <div className="search-result-info">
                        <div className="search-result-name">
                          {user.displayName || user.username || user.email}
                        </div>
                        <div className="search-result-subtitle">{user.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {searchResults.chats && searchResults.chats.length > 0 && (
                <div className="search-section">
                  <div className="search-section-title">Public Chats</div>
                  {searchResults.chats.map((chat) => (
                    <div
                      key={chat.id}
                      className="search-result-item"
                      onClick={() => {
                        onSelectChat(chat.id);
                        onClose();
                      }}
                    >
                      <FiMessageCircle className="search-result-icon" />
                      <div className="search-result-info">
                        <div className="search-result-name">{chat.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {searchResults.userExistingChats && searchResults.userExistingChats.length > 0 && (
                <div className="search-section">
                  <div className="search-section-title">Your Chats</div>
                  {searchResults.userExistingChats.map((chat) => (
                    <div
                      key={chat.id}
                      className="search-result-item"
                      onClick={() => {
                        onSelectChat(chat.id);
                        onClose();
                      }}
                    >
                      <FiMessageCircle className="search-result-icon" />
                      <div className="search-result-info">
                        <div className="search-result-name">{chat.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {(!searchResults.users || searchResults.users.length === 0) &&
                (!searchResults.chats || searchResults.chats.length === 0) &&
                (!searchResults.userExistingChats || searchResults.userExistingChats.length === 0) && (
                  <div className="search-empty">No results found</div>
                )}
            </>
          ) : searchQuery.length >= 2 ? (
            <div className="search-empty">Start typing to search...</div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

