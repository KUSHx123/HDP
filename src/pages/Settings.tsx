import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Moon, 
  Sun, 
  AlertCircle,
  Save,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SettingsFormData {
  fullName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  darkMode: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    predictions: boolean;
  };
}

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<SettingsFormData>({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    darkMode: false,
    notifications: {
      email: true,
      push: true,
      predictions: true
    }
  });

  // ✅ Load user data into form state
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.user_metadata?.full_name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  // ✅ Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // ✅ Update profile information
      const result = await updateProfile(formData.fullName, file ?? undefined);
      if (result.error) throw result.error;

      // ✅ Password update (optional)
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        // ✅ You can handle password update here using your own API if needed
      }

      setSuccess('Settings updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // ✅ Handle dark mode toggle
  const toggleDarkMode = () => {
    setFormData(prev => ({
      ...prev,
      darkMode: !prev.darkMode
    }));
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* ✅ Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* ✅ Success Message */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ✅ Profile Picture Upload */}
          <div className="flex items-center space-x-4">
            <img
              src={user?.user_metadata?.avatar_url || '/default-avatar.png'}
              alt="Avatar"
              className="h-16 w-16 rounded-full object-cover"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Camera className="h-5 w-5 text-gray-500" />
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* ✅ Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* ✅ Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full border-gray-300 rounded-md shadow-sm"
              disabled
            />
          </div>

          {/* ✅ Password Update */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              className="w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* ✅ Dark Mode Toggle */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="flex items-center"
            >
              {formData.darkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-500" />
              )}
              <span className="ml-2 text-sm">
                {formData.darkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
          </div>

          {/* ✅ Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md shadow"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
