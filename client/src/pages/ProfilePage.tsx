import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading, updateProfile, updatePassword } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreviewError, setAvatarPreviewError] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
    if (user) {
      setDisplayName(user.user_metadata?.display_name || '');
      setAvatarUrl(user.user_metadata?.avatar_url || '');
    }
  }, [user, loading, navigate]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await updateProfile({
      displayName,
      avatarUrl,
    });

    setIsSaving(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('profile.updateSuccess'));
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);

    if (newPassword !== confirmPassword) {
      toast.error(t('profile.passwordMismatch'));
      setIsChangingPassword(false);
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t('profile.passwordTooShort'));
      setIsChangingPassword(false);
      return;
    }

    const { error } = await updatePassword(newPassword);

    setIsChangingPassword(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('profile.passwordSuccess'));
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('common.back')}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('profile.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('profile.subtitle')}
          </p>
        </div>

        {/* Profile Avatar Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-indigo-100 dark:border-indigo-900"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                {displayName || user.email?.split('@')[0]}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {user.email}
              </p>
              <span className={`inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                user.user_metadata?.role === 'admin'
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                {user.user_metadata?.role === 'admin' ? 'Admin' : 'User'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleProfileUpdate} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('profile.editInfo')}
          </h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('profile.displayName')}
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder={t('profile.displayNamePlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('profile.avatarUrl')}
              </label>
              <input
                type="url"
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => {
                  setAvatarUrl(e.target.value);
                  setAvatarPreviewError(false);
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="https://example.com/avatar.jpg"
              />

              {/* Avatar Preview */}
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {t('profile.avatarPreview')}
                </p>
                {avatarUrl ? (
                  <div className="flex items-center gap-3">
                    {!avatarPreviewError ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        onError={() => setAvatarPreviewError(true)}
                        onLoad={() => setAvatarPreviewError(false)}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                    {avatarPreviewError && (
                      <p className="text-xs text-red-500 dark:text-red-400">
                        {t('profile.avatarLoadError')}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                    {t('profile.avatarPreviewHint')}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('profile.emailCannotChange')}
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="mt-6 w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('common.loading')}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('common.save')}
              </>
            )}
          </button>
        </form>

        {/* Change Password Form */}
        <form onSubmit={handlePasswordChange} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('profile.changePassword')}
          </h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('profile.newPassword')}
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('auth.confirmPassword')}
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isChangingPassword || !newPassword || !confirmPassword}
            className="mt-6 w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isChangingPassword ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('common.loading')}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                {t('profile.changePassword')}
              </>
            )}
          </button>
        </form>

        {/* Account Info */}
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {t('profile.accountCreated')}: {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
