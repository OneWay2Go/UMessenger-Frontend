import React, { useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiSettings, FiLogOut, FiX } from 'react-icons/fi';
import './HamburgerMenu.css';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="hamburger-menu-overlay" onClick={onClose}>
      <div className="hamburger-menu" ref={menuRef} onClick={(e) => e.stopPropagation()}>
        <div className="hamburger-menu-header">
          <h3>Menu</h3>
          <button className="close-button" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>
        <div className="hamburger-menu-user">
          <div className="user-avatar">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt={user.displayName || user.email} />
            ) : (
              <div className="avatar-placeholder">
                {(user?.displayName || user?.username || user?.email || 'U')
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.displayName || user?.username || user?.email}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>
        <div className="hamburger-menu-items">
          <button className="menu-item" onClick={onClose}>
            <FiUser size={20} />
            <span>Profile</span>
          </button>
          <button className="menu-item" onClick={onClose}>
            <FiSettings size={20} />
            <span>Settings</span>
          </button>
          <button className="menu-item logout" onClick={handleLogout}>
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

