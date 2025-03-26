import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Lock, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileData {
  fullName: string;
  email: string;
  avatarFile: File | null; // ✅ Changed to File type
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, isLoading, updateProfile, signOut, deleteAccount } = useAuth();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState<ProfileData>({
    fullName: '',
    email: '',
    avatarFile: null,
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.user_metadata?.full_name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsUpdating(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('full_name', formData.fullName);
      if (formData.avatarFile) {
        formDataToSend.append('avatar', formData.avatarFile);
      }

      const response = await updateProfile(formData.fullName, formData.avatarFile || undefined);

      if (response.error) {
        throw new Error(response.error);
      }

      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { error: deleteError } = await deleteAccount();
      if (deleteError) throw deleteError;

      await signOut();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
          </div>

          {/* ✅ Error and Success Message */}
          {error && (
            <div className="px-8 py-4 bg-red-50 border-b border-red-200">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="px-8 py-4 bg-green-50 border-b border-green-200">
              <p className="text-green-600">{success}</p>
            </div>
          )}

          {/* ✅ Form */}
          <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
            {/* ✅ Avatar Section */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={
                    formData.avatarFile
                      ? URL.createObjectURL(formData.avatarFile)
                      : user.user_metadata?.avatar_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName)}&background=random`
                  }
                  alt={formData.fullName}
                  className="h-24 w-24 rounded-full object-cover"
                />
                <label
                  htmlFor="avatar"
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700"
                >
                  <Camera className="h-4 w-4" />
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setFormData({ ...formData, avatarFile: e.target.files?.[0] || null })
                    }
                  />
                </label>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{formData.fullName}</h3>
                <p className="text-sm text-gray-500">{formData.email}</p>
              </div>
            </div>

            {/* ✅ Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* ✅ Action Buttons */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:text-red-700"
              >
                Delete Account
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ✅ Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Account</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-600 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
