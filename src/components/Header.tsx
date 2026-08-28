import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HugeiconsIcon } from '@hugeicons/react';
import { User02Icon, ShopifyIcon } from '@hugeicons/core-free-icons';
import type { RootState } from '../redux/store';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <header className="header">
      <div className="header-title-row">
        <button className="title" onClick={() => navigate('/home')}>
          <HugeiconsIcon icon={ShopifyIcon} />
          ShopBuddy
        </button>
        <div className="header-actions">
          {user && <span className="greeting-text">Hello!, {user.name}</span>}
          <button
            type="button"
            className="icon-btn"
            aria-label="Profile"
            title="Profile"
            onClick={() => navigate('/profile')}
          >
            <HugeiconsIcon icon={User02Icon} size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;