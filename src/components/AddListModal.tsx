import React, { useState, useEffect } from 'react';
import type { ShoppingItem } from '../redux/shoppingListSlice';

interface AddListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: { name: string; category?: string; quantity?: string; notes?: string; imageUrl?: string }) => void;
  initialData?: ShoppingItem | null;
}

export const AddListModal: React.FC<AddListModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCategory(initialData.category || '');
      setQuantity(initialData.quantity || '1');
      setNotes(initialData.notes || '');
      setImageUrl(initialData.imageUrl || '');
    } else {
      setName('');
      setCategory('');
      setQuantity('');
      setNotes('');
      setImageUrl('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name, category, quantity, notes, imageUrl });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>{initialData ? 'Edit Item' : 'Add New Item'}</h3>
        <form onSubmit={handleSubmit}>
          <label>Item Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

          <label>Category</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />

          <label>Quantity</label>
          <input type="text" value={quantity} onChange={(e) => setQuantity(e.target.value)} />

          <label>Notes</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />

          <label>Image URL</label>
          <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {initialData ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddListModal;