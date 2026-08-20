import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { RootState } from '../redux/store';
import { addItem, deleteItem, type ShoppingItem } from '../redux/shoppingListSlice';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  User02Icon, ShoppingBagRemoveIcon, Delete02Icon
} from '@hugeicons/core-free-icons';
import '../index.css';

export const HomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('General');

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const items = useSelector((state: RootState) => state.shoppingList.items);
  const sortBy = searchParams.get('sort') || 'name';

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    dispatch(addItem({ name: itemName.trim(), category: itemCategory.trim() || 'General' }));

    // Reset and close
    setItemName('');
    setItemCategory('General');
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
            {sortedItems.map((item: ShoppingItem) => (
              <div key={item.id} className="item-card">
                <div className="item-left">
                  <input type="checkbox" className="round-checkbox" />
                  <div>
                    <span className="item-text">{item.name}</span>
                    <span className="item-badge">{item.category}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => dispatch(deleteItem(item.id))}
                  title="Delete Item"
                >
                  <HugeiconsIcon icon={Delete02Icon} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Pop-up */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Add New Item</h3>
            <form onSubmit={handleAddItem}>
              <label htmlFor="modal-item-name">Item Name</label>
              <input
                id="modal-item-name"
                type="text"
                placeholder="e.g. Milk, Apples"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />

              <label htmlFor="modal-item-category">Category</label>
              <input
                id="modal-item-category"
                type="text"
                placeholder="e.g. Produce, Dairy, Bakery"
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
              />

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;