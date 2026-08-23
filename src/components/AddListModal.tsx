import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  Add01Icon,
  ShoppingBasket01Icon,
  Image01Icon,
  PencilEdit02Icon,
  Tag01Icon
} from '@hugeicons/core-free-icons';

interface AddListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: {
    name: string;
    category: string;
    quantity: string;
    notes: string;
    imageUrl: string;
  }) => void;
}

export const AddListModal: React.FC<AddListModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
}) => {
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('General');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [itemNotes, setItemNotes] = useState('');
  const [itemImageUrl, setItemImageUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    onAddItem({
      name: itemName.trim(),
      category: itemCategory.trim() || 'General',
      quantity: itemQuantity.trim() || '1',
      notes: itemNotes.trim(),
      imageUrl: itemImageUrl.trim(),
    });

    // Reset form fields
    setItemName('');
    setItemCategory('General');
    setItemQuantity('1');
    setItemNotes('');
    setItemImageUrl('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New Item</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="modal-item-name">
            <HugeiconsIcon icon={ShoppingBasket01Icon} size={16} /> Item Name *
          </label>
          <input
            id="modal-item-name"
            type="text"
            placeholder="e.g. Róisín Beer"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
          />

          <label htmlFor="modal-item-category">
            <HugeiconsIcon icon={Tag01Icon} size={16} /> Category
          </label>
          <input
            id="modal-item-category"
            type="text"
            placeholder="e.g. Beverages, Produce"
            value={itemCategory}
            onChange={(e) => setItemCategory(e.target.value)}
          />

          <label htmlFor="modal-item-qty">Quantity / Size</label>
          <input
            id="modal-item-qty"
            type="text"
            placeholder="e.g. 330ml or 1"
            value={itemQuantity}
            onChange={(e) => setItemQuantity(e.target.value)}
          />

          <label htmlFor="modal-item-notes">
            <HugeiconsIcon icon={PencilEdit02Icon} size={16} /> Optional Notes
          </label>
          <input
            id="modal-item-notes"
            type="text"
            placeholder="e.g. Extra cold"
            value={itemNotes}
            onChange={(e) => setItemNotes(e.target.value)}
          />

          <label htmlFor="modal-item-image">
            <HugeiconsIcon icon={Image01Icon} size={16} /> Image URL
          </label>
          <input
            id="modal-item-image"
            type="url"
            placeholder="https://example.com/product.png"
            value={itemImageUrl}
            onChange={(e) => setItemImageUrl(e.target.value)}
          />

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              <HugeiconsIcon icon={Cancel01Icon} size={16} /> Cancel
            </button>
            <button type="submit" className="submit-btn">
              <HugeiconsIcon icon={Add01Icon} size={16} /> Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddListModal;