import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

export const Searchbar: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    
    if (value) {
      newParams.set('search', value);
    } else {
      newParams.delete('search');
    }
    
    setSearchParams(newParams);
  };

  const handleClear = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    setSearchParams(newParams);
  };

  return (
    <div className="searchbar-container">
      <HugeiconsIcon icon={Search01Icon} size={20} className="search-icon" />
      <input
        type="text"
        className="search-input"
        placeholder="Search list by name or gategory"
        value={searchQuery}
        onChange={handleSearchChange}
      />
      {searchQuery && (
        <button type="button" className="clear-search-btn" onClick={handleClear} aria-label="Clear search">
          <HugeiconsIcon icon={Cancel01Icon} size={16} />
        </button>
      )}
    </div>
  );
};

export default Searchbar;