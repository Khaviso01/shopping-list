import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { RootState } from '../redux/store';
import { addItem, editItem, deleteItem, type ShoppingItem } from '../redux/shoppingListSlice';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ShoppingBagRemoveIcon,
  Delete02Icon,
  ShoppingBag01Icon,
  PencilEdit02Icon
} from '@hugeicons/core-free-icons';
import Header from '../components/Header';
import Searchbar from '../components/Searchbar';
import AddListModal from '../components/AddListModal';
import ConfirmModal from '../components/ConfirmModal';
import '../index.css';

export const HomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const items = useSelector((state: RootState) => state.shoppingList.items);
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'name';

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ShoppingItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Simulates background operation with toast feedback
  const handleSaveItem = async (itemData: { name: string; category?: string; quantity?: string; notes?: string; imageUrl?: string }) => {
    const isEditing = Boolean(editingItem);
    
    // Show background loading indicator
    const toastId = toast.loading(isEditing ? 'Updating item...' : 'Saving new item...');

    try {
      // Simulate brief async delay for background processing
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (editingItem) {
        dispatch(editItem({ ...editingItem, ...itemData }));
        toast.success(`"${itemData.name}" updated successfully!`, { id: toastId });
      } else {
        dispatch(addItem(itemData as any));
        toast.success(`"${itemData.name}" added to list!`, { id: toastId });
      }

      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast.error('Failed to save item. Please try again.', { id: toastId });
    }
  };

  // Confirm delete with background loading feedback
  const handleConfirmDelete = async () => {
    if (!deletingItemId) return;

    const itemToDelete = items.find((item) => item.id === deletingItemId);
    const toastId = toast.loading('Deleting item...');

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      dispatch(deleteItem(deletingItemId));
      toast.success(`"${itemToDelete?.name || 'Item'}" removed from list!`, { id: toastId });
    } catch (error) {
      toast.error('Failed to delete item.', { id: toastId });
    } finally {
      setDeletingItemId(null);
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', e.target.value);
    setSearchParams(newParams);
    toast.success(`Sorted by ${e.target.value}`);
  };

  const filteredAndSortedItems = items
    .filter((item: ShoppingItem) => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    )
    .sort((a: ShoppingItem, b: ShoppingItem) => {
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
      <Header />

      <div className="app-container">
        <div className="search-and-actions-bar">
          <Searchbar />
          <button type="button" className="open-modal-btn" onClick={handleOpenAddModal}>
            + Add New Item
          </button>
        </div>

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

        <main className="content-body">
          {filteredAndSortedItems.length === 0 ? (
            <div className="empty-state">
              <div className="cart-icon">
                <HugeiconsIcon icon={ShoppingBagRemoveIcon} size={82} />
              </div>
              <h3>
                {searchQuery ? `No items found matching "${searchQuery}"` : 'Your shopping list is empty!'}
              </h3>
              <p>{searchQuery ? 'Try searching for something else' : 'Start adding items to your list'}</p>
            </div>
          ) : (
            <div className="item-list">
              {filteredAndSortedItems.map((item: ShoppingItem) => (
                <div key={item.id} className="item-card">
                  <div className="item-left">
                    <input 
                      type="checkbox" 
                      className="round-checkbox" 
                      onChange={(e) => {
                        if (e.target.checked) {
                          toast.success(`Completed "${item.name}"`);
                        }
                      }}
                    />

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
                      className="edit-btn"
                      onClick={() => handleOpenEditModal(item)}
                      title="Edit Item"
                    >
                      <HugeiconsIcon icon={PencilEdit02Icon} size={18} />
                    </button>
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => setDeletingItemId(item.id)}
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
      </div>

      <AddListModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        initialData={editingItem}
      />

      <ConfirmModal
        isOpen={Boolean(deletingItemId)}
        title="Delete Item"
        message="Are you sure you want to delete this item from your shopping list?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingItemId(null)}
      />
    </div>
  );
};

export default HomePage;