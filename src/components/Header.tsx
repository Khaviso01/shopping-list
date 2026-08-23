import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { User02Icon } from '@hugeicons/core-free-icons';

export const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-title-row">
        <button className="title" onClick={() => navigate('/home')}>
          Listly
        </button>
        <div className="header-actions">
          <button
            type="button"
            className="icon-btn"
            aria-label="Profile"
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