import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { AppDispatch, RootState } from '../redux/store';
import EmptyState from '../assets/empty-cart-cartoon.png'
import {
  fetchItems,
  addItem,
  editItem,
  deleteItem,
  type ShoppingItem,
  type NewShoppingItemInput,
} from '../redux/shoppingListSlice';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Delete02Icon,
  ShoppingBag01Icon,
  PencilEdit02Icon,
  Share08Icon,
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
  // Tracks which items are ticked as "completed" in this browsing session.
  // Not persisted to the backend — a refresh clears it, same as the rest
  // of the app's completion-checkbox behavior.
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: RootState) => state.auth.user);
  const items = useSelector((state: RootState) => state.shoppingList.items);
  const listStatus = useSelector((state: RootState) => state.shoppingList.status);
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'name';

  // Load this user's shopping list from the json-server backend whenever
  // the signed-in user changes (e.g. after login).
  useEffect(() => {
    if (user) {
      dispatch(fetchItems(user.id));
    }
  }, [dispatch, user]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ShoppingItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (itemData: NewShoppingItemInput) => {
    if (!user) return;
    const isEditing = Boolean(editingItem);
    const toastId = toast.loading(isEditing ? 'Updating item...' : 'Saving new item...');

    const action = editingItem
      ? await dispatch(editItem({ ...editingItem, ...itemData }))
      : await dispatch(addItem({ userId: user.id, item: itemData }));

    if (action.meta.requestStatus === 'fulfilled') {
      toast.success(
        isEditing ? `"${itemData.name}" updated successfully!` : `"${itemData.name}" added to list!`,
        { id: toastId }
      );
      setIsModalOpen(false);
      setEditingItem(null);
    } else {
      toast.error((action.payload as string) || 'Failed to save item. Please try again.', { id: toastId });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItemId) return;

    const itemToDelete = items.find((item) => item.id === deletingItemId);
    const toastId = toast.loading('Deleting item...');

    const action = await dispatch(deleteItem(deletingItemId));

    if (action.meta.requestStatus === 'fulfilled') {
      toast.success(`"${itemToDelete?.name || 'Item'}" removed from list!`, { id: toastId });
    } else {
      toast.error((action.payload as string) || 'Failed to delete item.', { id: toastId });
    }
    setDeletingItemId(null);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', e.target.value);
    setSearchParams(newParams);
    toast.success(`Sorted by ${e.target.value}`);
  };

  // Shares the current list view (including any active search/sort filters,
  // which already live in the URL) so someone else can open the same view.
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `${user?.name ?? 'My'}'s shopping list — ShopBuddy`,
      text: 'Take a look at my shopping list on ShopBuddy!',
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled the native share sheet — nothing to do.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied! Share it with anyone.');
    } catch {
      toast.error('Could not copy the link. Copy it manually from the address bar.');
    }
  };

  const handleToggleComplete = (item: ShoppingItem, isChecked: boolean) => {
  // The toast is a side effect, so it must NOT live inside the
  // setCompletedIds updater function below — React (in Strict Mode /
  // development) calls updater functions twice to verify they're pure,
  // which was firing this toast twice per click.
  setCompletedIds((prev) => {
    const next = new Set(prev);
    if (isChecked) {
      next.add(item.id);
    } else {
      next.delete(item.id);
    }
    return next;
  });

  if (isChecked) {
    toast.success(`Completed "${item.name}"`);
  }
};

  const filteredAndSortedItems = items
    .filter((item: ShoppingItem) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      // Matches on name OR category — an item shows up if either field
      // contains the search text, not just the name.
      const nameMatch = item.name.toLowerCase().includes(query);
      const categoryMatch = (item.category || '').toLowerCase().includes(query);
      return nameMatch || categoryMatch;
    })
    .sort((a: ShoppingItem, b: ShoppingItem) => {
      if (sortBy === 'category') {
        return (a.category || '').localeCompare(b.category || '');
      }
      if (sortBy === 'date') {
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
      return a.name.localeCompare(b.name);
    });

  // Only count items that still exist — if a completed item gets deleted,
  // its stale id in completedIds is simply never matched here.
  const completedCount = items.filter((item) => completedIds.has(item.id)).length;
  const totalCount = items.length;

  return (
    <div className="app-viewport">
      <Header />

      <div className="app-container">
        <div className="search-and-actions-bar">
          <Searchbar />
          <button type="button" className="open-modal-btn" onClick={handleOpenAddModal}>
            + Add New Item
          </button>
          <button type="button" className="share-list-btn" onClick={handleShare} title="Share this list">
            <HugeiconsIcon icon={Share08Icon} size={18} />
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

        {totalCount > 0 && (
          <div className="progress-summary">
            <span className="progress-summary-text">
              {completedCount} of {totalCount} items completed
            </span>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        <main className="content-body">
          {listStatus === 'loading' && items.length === 0 ? (
            <div className="empty-state">
              <p>Loading your shopping list...</p>
            </div>
          ) : filteredAndSortedItems.length === 0 ? (
            <div className="empty-state">
              <div className="cart-icon">
                <img src={EmptyState}/>
              </div>
              <h3>
                {searchQuery ? `No items found matching "${searchQuery}"` : 'Your shopping list is empty!'}
              </h3>
              <p>{searchQuery ? 'Try searching for something else' : 'Looks like you have not made your list yet.'}</p>
            </div>
          ) : (
            <div className="item-list">
              {filteredAndSortedItems.map((item: ShoppingItem) => {
                const isCompleted = completedIds.has(item.id);
                return (
                <div key={item.id} className={`item-card ${isCompleted ? 'item-completed' : ''}`}>
                  <div className="item-left">
                    <input
                      type="checkbox"
                      className="round-checkbox"
                      checked={isCompleted}
                      onChange={(e) => handleToggleComplete(item, e.target.checked)}
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
                );
              })}
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