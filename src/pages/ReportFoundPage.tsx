import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useItems } from '@/hooks/useItems';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS } from '@/types';
import type { ItemCategory } from '@/types';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { PlusCircle, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function ReportFoundPage() {
  const { user } = useAuth();
  const { createItem } = useItems();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'electronics' as ItemCategory,
    description: '',
    location: CAMPUS_LOCATIONS[0] || 'CC3 (Computer Centre 3)',
    date_occurred: new Date().toISOString().split('T')[0] || '',
    time_occurred: '',
    distinguishing_details: '',
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required (e.g., Casio fx-991EX Calculator).';
    }
    if (!formData.category) {
      newErrors.category = 'Please select an item category.';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Please describe the found item and circumstances.';
    }
    if (!formData.location) {
      newErrors.location = 'Please select where the item was found.';
    }
    if (!formData.date_occurred) {
      newErrors.date_occurred = 'Please specify the date found.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be signed in to report an item.');
      navigate('/login');
      return;
    }

    if (!validate()) return;

    try {
      setSubmitting(true);
      const created = await createItem(
        {
          title: formData.title.trim(),
          category: formData.category,
          description: formData.description.trim(),
          location: formData.location,
          date_occurred: formData.date_occurred,
          time_occurred: formData.time_occurred || null,
          distinguishing_details: formData.distinguishing_details.trim() || null,
          report_type: 'found',
          reported_by: user.id,
        },
        photo
      );

      toast.success('Found item reported successfully! Notice posted.');
      navigate(`/items/${created.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit report';
      toast.error(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2">
          <PlusCircle className="w-3.5 h-3.5 text-amber-700" />
          Campus Noticeboard Submission
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-surface-900">
          Report a Found Item
        </h1>
        <p className="section-subtitle">
          Help return an item to its owner. Provide accurate details and location.
        </p>
      </div>

      <div className="card p-6 sm:p-8 bg-white shadow-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="input-label">
              Item Title / Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Black Titan Watch, Hostel 2 Room Key, Blue Parker Pen"
              className="input-field"
            />
            {errors.title && <p className="input-error">{errors.title}</p>}
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as ItemCategory })
                }
                className="input-field bg-white"
              >
                {ITEM_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {errors.category && <p className="input-error">{errors.category}</p>}
            </div>

            <div>
              <label className="input-label">
                Where did you find it? <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input-field bg-white"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              {errors.location && <p className="input-error">{errors.location}</p>}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">
                Date Found <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date_occurred}
                onChange={(e) => setFormData({ ...formData, date_occurred: e.target.value })}
                className="input-field"
              />
              {errors.date_occurred && <p className="input-error">{errors.date_occurred}</p>}
            </div>

            <div>
              <label className="input-label">
                Approximate Time <span className="text-2xs text-surface-400 font-normal">(Optional)</span>
              </label>
              <input
                type="time"
                value={formData.time_occurred}
                onChange={(e) => setFormData({ ...formData, time_occurred: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="input-label">
              General Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a clear description of the item, brand, color, condition, where exactly in the room/area it was found..."
              className="input-field"
            />
            {errors.description && <p className="input-error">{errors.description}</p>}
          </div>

          {/* Photo Upload */}
          <div>
            <ImageUpload
              value={photo}
              onChange={(f) => setPhoto(f)}
              label="Photograph of Found Item"
              helperText="Upload a clear picture of the item. Max 5MB (JPEG, PNG, WebP)."
            />
          </div>

          {/* Distinguishing details */}
          <div>
            <label className="input-label">
              Distinguishing / Identifying Features <span className="text-2xs text-surface-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={formData.distinguishing_details}
              onChange={(e) =>
                setFormData({ ...formData, distinguishing_details: e.target.value })
              }
              placeholder="e.g. Scratched bottom left corner, specific sticker on lid, keychain text..."
              className="input-field"
            />
            <p className="text-2xs text-surface-400 mt-1">
              Any visible detail that helps verify genuine claimant ownership.
            </p>
          </div>

          <div className="pt-4 border-t border-surface-200">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2"
            >
              {submitting ? 'Submitting Report...' : 'Publish Found Item Report'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
