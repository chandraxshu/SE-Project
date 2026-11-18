import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DEPARTMENTS, ACADEMIC_BATCHES } from '@/types';
import { GraduationCap, ArrowRight, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export function OnboardingPage() {
  const { user, profile, needsOnboarding, updateProfile } = useAuth();
  const navigate = useNavigate();

  // If already onboarded, send to dashboard
  if (profile && !needsOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  // Pre-fill name from google user metadata if available
  const defaultName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || '';

  const [formData, setFormData] = useState({
    full_name: defaultName,
    roll_number: '',
    department: DEPARTMENTS[0] || 'Information Technology',
    academic_batch: ACADEMIC_BATCHES[1] || '2024',
    phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required.';
    }

    const rollRegex = /^[A-Za-z]{3}\d{7,8}$/i; // E.g., IIT2023001, IEC2022045
    if (!formData.roll_number.trim()) {
      newErrors.roll_number = 'IIITA Roll Number is required.';
    } else if (formData.roll_number.trim().length < 5) {
      newErrors.roll_number = 'Please enter a valid IIITA roll number (e.g., IIT2023001).';
    }

    if (!formData.department) {
      newErrors.department = 'Please select your department.';
    }

    if (!formData.academic_batch) {
      newErrors.academic_batch = 'Please select your academic batch.';
    }

    if (formData.phone && !/^\+?[0-9]{10,13}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number or leave blank.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await updateProfile({
        full_name: formData.full_name.trim(),
        roll_number: formData.roll_number.trim().toUpperCase(),
        department: formData.department,
        academic_batch: formData.academic_batch,
        phone: formData.phone.trim() || null,
        email: user?.email || '',
        role: 'student', // default student role
      });

      toast.success('Profile created successfully! Welcome to Khoj.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to complete registration';
      toast.error(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="card p-8 shadow-elevated">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold font-display text-surface-900">
              Complete Student Registration
            </h1>
            <p className="text-xs text-surface-500 mt-1 max-w-sm mx-auto">
              Welcome to Khoj! Please provide your IIITA credentials to complete your one-time profile setup.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="input-label">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g. Chandranshu Patel"
                className="input-field"
              />
              {errors.full_name && <p className="input-error">{errors.full_name}</p>}
            </div>

            {/* Email (Readonly) */}
            <div>
              <label className="input-label">Institutional Email</label>
              <input
                type="text"
                value={user?.email || ''}
                readOnly
                disabled
                className="input-field bg-surface-100 text-surface-500 cursor-not-allowed"
              />
              <p className="text-2xs text-surface-400 mt-1">Verified via Google Workspace.</p>
            </div>

            {/* Roll Number */}
            <div>
              <label className="input-label">
                IIITA Roll Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.roll_number}
                onChange={(e) =>
                  setFormData({ ...formData, roll_number: e.target.value.toUpperCase() })
                }
                placeholder="e.g. IIT2023001 or IEC2022045"
                className="input-field uppercase tracking-wider"
              />
              {errors.roll_number && <p className="input-error">{errors.roll_number}</p>}
            </div>

            {/* Department & Batch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="input-field bg-white"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {errors.department && <p className="input-error">{errors.department}</p>}
              </div>

              <div>
                <label className="input-label">
                  Academic Batch / Year <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.academic_batch}
                  onChange={(e) => setFormData({ ...formData, academic_batch: e.target.value })}
                  className="input-field bg-white"
                >
                  {ACADEMIC_BATCHES.map((batch) => (
                    <option key={batch} value={batch}>
                      Batch {batch}
                    </option>
                  ))}
                </select>
                {errors.academic_batch && <p className="input-error">{errors.academic_batch}</p>}
              </div>
            </div>

            {/* Contact Number (Optional) */}
            <div>
              <label className="input-label">
                Contact Number <span className="text-xs text-surface-400 font-normal">(Optional — kept private from other students)</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +91 9876543210"
                className="input-field"
              />
              {errors.phone && <p className="input-error">{errors.phone}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 mt-4"
            >
              {submitting ? 'Saving Profile...' : 'Complete Registration'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
