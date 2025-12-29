import { useState, FormEvent } from 'react';
import { User, Mail, Shield, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';
import { Card, CardContent, CardHeader, Button, Input, Badge } from '../components/ui';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await userApi.updateProfile(profileForm);
      updateUser(response.data.data);
      toast.success('Profile updated');
      setIsEditingProfile(false);
    } catch {
      // Error handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await userApi.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password updated');
      setIsEditingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      // Error handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = () => {
    const variants: Record<string, 'gray' | 'green' | 'yellow'> = {
      USER: 'gray',
      MODERATOR: 'yellow',
      SUPER_ADMIN: 'green',
    };
    return <Badge variant={variants[user?.role || 'USER']}>{user?.role}</Badge>;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Profile
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your account settings
        </p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Personal Information
            </h2>
            {!isEditingProfile && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditingProfile(true)}>
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditingProfile ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
                  required
                />
                <Input
                  label="Last Name"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" isLoading={isLoading}>
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileForm({
                      firstName: user?.firstName || '',
                      lastName: user?.lastName || '',
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
                  <Mail className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                  <div className="mt-0.5">{getRoleBadge()}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Password
            </h2>
            {!isEditingPassword && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditingPassword(true)}>
                Change
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditingPassword ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                  {passwordError}
                </div>
              )}

              <Input
                label="Current Password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                required
              />
              <Input
                label="New Password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                required
              />
              <div className="flex gap-3">
                <Button type="submit" isLoading={isLoading}>
                  Update Password
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsEditingPassword(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordError('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <Key className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Password</p>
                <p className="font-medium text-gray-900 dark:text-white">••••••••</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
