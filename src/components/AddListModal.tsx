import React, { useState } from 'react';

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
        <h3>Add New Item</h3>
        <form onSubmit={handleSubmit}>
          <label htmlFor="modal-item-name">Item Name *</label>
          <input
            id="modal-item-name"
            type="text"
            placeholder="e.g. Tomatoes, Bedding"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
          />

          <label htmlFor="modal-item-category">Category</label>
          <input
            id="modal-item-category"
            type="text"
            placeholder="e.g. Beverages, Produce"
            value={itemCategory}
            onChange={(e) => setItemCategory(e.target.value)}
          />

          <label htmlFor="modal-item-qty">Quantity</label>
          <input
            id="modal-item-qty"
            type="text"
            placeholder="e.g. 330ml or 1"
            value={itemQuantity}
            onChange={(e) => setItemQuantity(e.target.value)}
          />

          <label htmlFor="modal-item-notes">Optional Notes</label>
          <input
            id="modal-item-notes"
            type="text"
            placeholder="e.g. Extra cold"
            value={itemNotes}
            onChange={(e) => setItemNotes(e.target.value)}
          />

          <label htmlFor="modal-item-image">Image URL</label>
          <input
            id="modal-item-image"
            type="url"
            placeholder="https://example.com/product.png"
            value={itemImageUrl}
            onChange={(e) => setItemImageUrl(e.target.value)}
          />

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddListModal;