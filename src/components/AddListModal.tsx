import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, Loading03Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import type { ShoppingItem, NewShoppingItemInput } from '../redux/shoppingListSlice';
import {
  searchUnsplashImages,
  triggerUnsplashDownload,
  UnsplashConfigError,
  type UnsplashImageResult,
} from '../services/unsplash';

interface AddListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: NewShoppingItemInput) => void;
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

  // Unsplash image picker state
  const [imageQuery, setImageQuery] = useState('');
  const [isSearchingImages, setIsSearchingImages] = useState(false);
  const [imageResults, setImageResults] = useState<UnsplashImageResult[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [pendingDownloadLocation, setPendingDownloadLocation] = useState<string | null>(null);

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
    setImageQuery('');
    setImageResults([]);
    setSelectedImageId(null);
    setPendingDownloadLocation(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleImageSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageQuery.trim()) return;

    setIsSearchingImages(true);
    try {
      const results = await searchUnsplashImages(imageQuery);
      setImageResults(results);
      if (results.length === 0) {
        toast('No photos found for that search — try another word.');
      }
    } catch (err) {
      if (err instanceof UnsplashConfigError) {
        toast.error(err.message, { duration: 6000 });
      } else if (err instanceof Error) {
        // Now specific per status code (401 bad key, 403 rate limit, etc.)
        // instead of a generic message — see src/services/unsplash.ts.
        toast.error(err.message, { duration: 6000 });
      } else {
        toast.error('Could not search Unsplash. Please try again.');
      }
    } finally {
      setIsSearchingImages(false);
    }
  };

  const handleSelectImage = (image: UnsplashImageResult) => {
    setImageUrl(image.fullUrl);
    setSelectedImageId(image.id);
    setPendingDownloadLocation(image.downloadLocation);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Unsplash's API guidelines ask that a download event is registered
    // once a photo is actually used, not just previewed in search results.
    if (pendingDownloadLocation) {
      triggerUnsplashDownload(pendingDownloadLocation);
    }

    onSave({ name, category, quantity, notes, imageUrl });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>{initialData ? 'Edit Item' : 'Add New Item'}</h3>
        <form onSubmit={handleSubmit}>
          <label>Item Name *</label>
          <input type="text" placeholder="e.g Maize meal" value={name} onChange={(e) => setName(e.target.value)} required />

          <label>Category *</label>
          <input type="text" placeholder="e.g Starch" value={category} onChange={(e) => setCategory(e.target.value)} />

          <label>Quantity *</label>
          <input type="text" value={quantity} onChange={(e) => setQuantity(e.target.value)} />

          <label>Notes</label>
          <input type="text" placeholder="e.g White maize meal" value={notes} onChange={(e) => setNotes(e.target.value)} />

          <label>Item Image *</label>
          <div className="image-picker">
            {imageUrl && (
              <div className="image-picker-preview">
                <img src={imageUrl} alt="Selected item" />
                <button
                  type="button"
                  className="clear-image-btn"
                  onClick={() => {
                    setImageUrl('');
                    setSelectedImageId(null);
                    setPendingDownloadLocation(null);
                  }}
                >
                  Remove photo
                </button>
              </div>
            )}

            <div className="image-search-row">
              <input
                type="text"
                placeholder="Search Unsplash, e.g. 'apples'"
                value={imageQuery}
                onChange={(e) => setImageQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleImageSearch(e);
                  }
                }}
              />
              <button
                type="button"
                className="image-search-btn"
                onClick={handleImageSearch}
                disabled={isSearchingImages || !imageQuery.trim()}
                aria-label="Search Unsplash"
              >
                <HugeiconsIcon icon={isSearchingImages ? Loading03Icon : Search01Icon} size={16} />
              </button>
            </div>

            {imageResults.length > 0 && (
              <div className="image-results-grid">
                {imageResults.map((image) => (
                  <button
                    type="button"
                    key={image.id}
                    className={`image-result-thumb ${selectedImageId === image.id ? 'selected' : ''}`}
                    onClick={() => handleSelectImage(image)}
                    title={`Photo by ${image.photographerName} on Unsplash`}
                  >
                    <img src={image.thumbUrl} alt={image.description} />
                    {selectedImageId === image.id && (
                      <span className="selected-check">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
            <p className="image-picker-hint">Photos courtesy of Unsplash contributors.</p>
          </div>

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