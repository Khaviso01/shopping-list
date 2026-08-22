import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { RootState } from '../redux/store';
import { addItem, deleteItem, type ShoppingItem } from '../redux/shoppingListSlice';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  User02Icon, ShoppingBagRemoveIcon, Delete02Icon, ShoppingBag01Icon
} from '@hugeicons/core-free-icons';
import AddListModal from '../components/AddListModal';
import '../index.css';

export const HomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const items = useSelector((state: RootState) => state.shoppingList.items);
  const sortBy = searchParams.get('sort') || 'name';

  const handleAddItem = (newItem: { name: string; category?: string; quantity?: string; notes?: string; imageUrl?: string }) => {
    dispatch(addItem(newItem as any));
    setIsModalOpen(false);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchParams({ sort: e.target.value });
  };

  const sortedItems = [...items].sort((a: ShoppingItem, b: ShoppingItem) => {
    if (sortBy === 'category') {
      return (a.category || '').localeCompare(b.category || '');
    }
    if (sortBy === 'date') {
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="app-viewport">
      {/* Header */}
      <header className="header">
        <div className="header-title-row">
          <button className="title">Listly</button>
          <div className="header-actions">
            <button type="button" className="icon-btn" aria-label="Profile" onClick={() => navigate('/profile')}>
              <HugeiconsIcon icon={User02Icon} size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Trigger Add Modal Button */}
      <div className="add-trigger-bar">
        <button type="button" className="open-modal-btn" onClick={() => setIsModalOpen(true)}>
          + Add New Item
        </button>
      </div>

      {/* Sorting Controls */}
      {items.length > 0 && (
        <div className="sort-bar">
          <label htmlFor="sort-select">Sort by: </label>
          <select id="sort-select" value={sortBy} onChange={handleSortChange}>
            <option value="name">Name</option>
            <option value="category">Category</option>
            <option value="date">Date Added</option>
          </select>
        </div>
      )}

      {/* List / Empty State Body */}
      <main className="content-body">
        {items.length === 0 ? (
          <div className="empty-state">
            <div className="cart-icon"><HugeiconsIcon icon={ShoppingBagRemoveIcon} size={82} /></div>
            <h3>Your shopping list is empty!</h3>
            <p>Start adding items to your list</p>
          </div>
        ) : (
          <div className="item-list">
            {sortedItems.map((item: any) => (
              <div key={item.id} className="item-card">
                <div className="item-left">
                  {/* Restored Checkbox */}
                  <input type="checkbox" className="round-checkbox" />

                  {/* Square Product Image Container */}
                  <div className="item-image-square">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} />
                    ) : (
                      <HugeiconsIcon icon={ShoppingBag01Icon} size={24} className="image-fallback-icon" />
                    )}
                  </div>

                  <div>
                    <span className="item-text">{item.name}</span>
                    <span className="item-badge">{item.category}</span>
                    {item.notes && <span className="item-notes">{item.notes}</span>}
                  </div>
                </div>

                <div className="item-right">
                  <span className="item-qty">x{item.quantity || 1}</span>
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => dispatch(deleteItem(item.id))}
                    title="Delete Item"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Render AddListModal Component */}
      <AddListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddItem={handleAddItem}
      />
    </div>
  );
};

export default HomePage;