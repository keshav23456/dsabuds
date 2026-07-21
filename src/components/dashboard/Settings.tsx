'use client';

import { useState, useEffect } from 'react';
import { Camera, CheckCircle2, AlertCircle, User, Link2, GraduationCap, Share2 } from 'lucide-react';
import { Card, Button, Input } from '@/components/common';
import { userService, platformService } from '@/services';
import { PLATFORMS, SOCIAL_LINKS } from '@/config/constants';
import { PLATFORMS as PLATFORM_ICONS } from '@/utils/platformUtils';
import { SocialIcon } from '@/utils/socialIcons';
import { useUserStore, type User as UserType } from '@/store/useUserStore';
import apiClient from '@/lib/apiClient';
import { useBranchesForEmail } from '@/hooks';
import type { PlatformConnection } from './DashboardShellContext';

function getInitials(name?: string | null) {
  if (!name) return '?';
  const cleanName = name.replace(/[^a-zA-Z\s]/g, '').trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface SettingsProps {
  user?: UserType | null;
  platforms: PlatformConnection[];
  onUpdate?: (force?: boolean) => Promise<void>;
}

interface PlatformFormEntry {
  id: string;
  name: string;
  color: string;
  username: string;
  synced: boolean;
}

export function Settings({ user: propUser, platforms, onUpdate }: SettingsProps) {
  const globalUser = useUserStore((state) => state.user);
  const user = propUser || globalUser;
  const availableBranches = useBranchesForEmail(user?.email);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatarUrl || '',
    branch: user?.branch || '',
  });

  const getMappedSocialLinks = (links?: Record<string, string> | null) => {
    const source = links || {};
    return SOCIAL_LINKS.reduce((acc: Record<string, string>, s) => {
      acc[s.id] = source[s.id] || '';
      return acc;
    }, {});
  };

  const [socialLinksData, setSocialLinksData] = useState<Record<string, string>>(() => getMappedSocialLinks(user?.socialLinks));

  const getMappedPlatforms = (platList: PlatformConnection[]): PlatformFormEntry[] => {
    return PLATFORMS.map((defaultPlatform) => {
      const conn = (platList || []).find(
        (c) => c.platform?.toLowerCase() === defaultPlatform.id?.toLowerCase()
      );
      if (conn) {
        return {
          id: defaultPlatform.id,
          name: defaultPlatform.name,
          color: defaultPlatform.color,
          username: conn.username || '',
          synced: conn.synced,
        };
      }
      return {
        id: defaultPlatform.id,
        name: defaultPlatform.name,
        color: defaultPlatform.color,
        username: '',
        synced: false,
      };
    });
  };

  const [platformData, setPlatformData] = useState<PlatformFormEntry[]>(() => getMappedPlatforms(platforms));

  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  const [platformsError, setPlatformsError] = useState('');
  const [platformsSuccess, setPlatformsSuccess] = useState('');
  const [platformsSaving, setPlatformsSaving] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      setUploadingAvatar(true);
      setProfileError('');
      setProfileSuccess('');
      const res: any = await apiClient.post('/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res?.url) {
        setProfileData((prev) => ({ ...prev, avatar: res.url }));
        setProfileSuccess('Avatar uploaded! Remember to save changes.');
      } else {
        setProfileError('Invalid response received during avatar upload.');
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setProfileError('Failed to upload image. Please check size/format.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatarUrl || '',
        branch: user.branch || '',
      });
      setSocialLinksData(getMappedSocialLinks(user.socialLinks));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (platforms) {
      setPlatformData(getMappedPlatforms(platforms));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platforms]);

  const handleProfileChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (id: string, value: string) => {
    setSocialLinksData((prev) => ({ ...prev, [id]: value }));
  };

  const handlePlatformChange = (platformId: string, field: 'username' | 'synced', value: string | boolean) => {
    setPlatformData((prev) => prev.map((platform) =>
      platform.id === platformId
        ? { ...platform, [field]: value }
        : platform
    ));
  };

  const handleSaveProfile = async () => {
    setProfileError('');
    setProfileSuccess('');
    setProfileSaving(true);
    try {
      const res: any = await userService.updateProfile({
        name: profileData.name,
        avatarUrl: profileData.avatar || null,
        branch: profileData.branch || null,
        socialLinks: socialLinksData,
      });
      if (res?.user) {
        useUserStore.getState().setUser(res.user);
      }
      setProfileSuccess('Profile updated successfully!');
      if (onUpdate) await onUpdate(true);
    } catch (err: any) {
      console.error(err);
      setProfileError(err?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSavePlatforms = async () => {
    setPlatformsError('');
    setPlatformsSuccess('');
    setPlatformsSaving(true);
    try {
      for (const platform of platformData) {
        if (platform.username.trim()) {
          await platformService.updateConnection(platform.id, {
            username: platform.username,
            synced: platform.synced,
          });

          if (platform.synced) {
            await platformService.syncConnection(platform.id);
          }
        } else {
          const wasConnected = (platforms || []).some(
            (c) => c.platform?.toLowerCase() === platform.id?.toLowerCase()
          );
          if (wasConnected) {
            await platformService.deleteConnection(platform.id);
          }
        }
      }
      setPlatformsSuccess('Platform connections updated successfully!');
      if (onUpdate) await onUpdate(true);
    } catch (err: any) {
      console.error(err);
      setPlatformsError(err?.message || 'Failed to update platform connections.');
    } finally {
      setPlatformsSaving(false);
    }
  };

  const connectedCount = platformData.filter((p) => p.synced).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#E5E7EB] text-4xl font-normal italic mb-2 font-serif">
          Settings
        </h1>
        <p className="text-[#9CA3AF] font-mono">Manage your account and preferences</p>
      </div>

      {/* Profile hero */}
      <Card
        variant="default"
        hoverable={false}
        className="rounded-xl p-6 border border-[#21262D] bg-gradient-to-br from-[#161B22] to-[#0D1117]"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative shrink-0 group">
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-[#0D1117] border-2 border-[#1F2937] group-hover:border-[#35b9f1]/40 transition-colors">
              {profileData.avatar ? (
                <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-2xl text-[#35b9f1]">
                  {getInitials(profileData.name || user?.name)}
                </span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              id="settings-avatar-input"
              disabled={uploadingAvatar}
            />
            <label
              htmlFor="settings-avatar-input"
              className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#35b9f1] text-black flex items-center justify-center border-2 border-[#0D1117] cursor-pointer hover:bg-[#35b9f1]/90 transition-colors ${uploadingAvatar ? 'opacity-50 pointer-events-none' : ''}`}
              title="Change avatar"
            >
              <Camera size={14} strokeWidth={2.5} />
            </label>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-[#E5E7EB] text-xl font-bold">{profileData.name || 'Unnamed'}</h2>
            <p className="text-[#6B7280] text-sm font-mono mt-0.5">{profileData.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              {profileData.branch && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D1117] border border-[#1F2937] text-xs font-mono text-[#9CA3AF]">
                  <GraduationCap size={12} className="text-[#35b9f1]" />
                  {profileData.branch}
                </span>
              )}
              {user?.year && (
                <span className="px-3 py-1 rounded-full bg-[#0D1117] border border-[#1F2937] text-xs font-mono text-[#9CA3AF]">
                  Batch of {user.year}
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-[#0D1117] border border-[#1F2937] text-xs font-mono text-[#9CA3AF]">
                {connectedCount}/{platformData.length} platforms connected
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Profile Settings Card */}
        <Card variant="default" className="rounded-xl p-6 border border-[#21262D] bg-[#161B22] hover:border-[#35b9f1]/10">
          <div className="mb-6 pb-4 border-b border-[#21262D] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0D1117] border border-[#1F2937] flex items-center justify-center text-[#35b9f1] shrink-0">
              <User size={16} />
            </div>
            <div>
              <h3 className="text-[#E5E7EB] font-bold text-lg leading-tight">Profile Settings</h3>
              <p className="text-[#6B7280] text-xs font-mono">Update your personal information</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Name"
              value={profileData.name}
              onChange={(e) => handleProfileChange('name', e.target.value)}
              labelClassName="font-medium text-[#E5E7EB] normal-case text-sm mb-2 block"
              inputClassName="py-2.5 border-[#1F2937]"
            />

            <Input
              label="Email"
              type="email"
              value={profileData.email}
              disabled={true}
              labelClassName="font-medium text-[#E5E7EB] normal-case text-sm mb-2 block"
              inputClassName="py-2.5 border-[#1F2937] opacity-60 cursor-not-allowed"
            />

            <div>
              <label className="block text-[#E5E7EB] text-sm font-medium mb-2">Branch</label>
              <select
                value={profileData.branch}
                onChange={(e) => handleProfileChange('branch', e.target.value)}
                disabled={(user?.branchChangesCount ?? 0) >= 1}
                className={`w-full bg-[#0D1117] border border-[#1F2937] rounded-lg px-4 py-2.5 text-[#E5E7EB] focus:outline-none focus:border-[#35b9f1] transition-colors font-mono cursor-pointer ${
                  (user?.branchChangesCount ?? 0) >= 1 ? 'opacity-60 cursor-not-allowed border-dashed' : ''
                }`}
              >
                <option value="" disabled>Select your branch</option>
                {availableBranches.map((b) => (
                  <option key={b} value={b} className="bg-[#161B22]">
                    {b}
                  </option>
                ))}
              </select>
              {(user?.branchChangesCount ?? 0) >= 1 && (
                <p className="text-[#6B7280] text-[10px] mt-1 font-mono">
                  Branch can only be changed once after onboarding.
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-[#1F2937]/60">
              <div className="flex items-center gap-2 mb-3 mt-4">
                <Share2 size={14} className="text-[#35b9f1]" />
                <label className="block text-[#E5E7EB] text-sm font-medium">Social Links</label>
              </div>
              <div className="space-y-3">
                {SOCIAL_LINKS.map((social) => (
                  <div key={social.id} className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-lg bg-[#0D1117] border border-[#1F2937] flex items-center justify-center shrink-0"
                      style={{ color: social.color }}
                    >
                      <SocialIcon id={social.id} className="w-4 h-4" />
                    </div>
                    <Input
                      value={socialLinksData[social.id]}
                      onChange={(e) => handleSocialLinkChange(social.id, e.target.value)}
                      placeholder={social.placeholder}
                      inputClassName="py-2 px-3 border-[#1F2937] text-sm bg-[#0D1117]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {profileError && (
              <p className="flex items-center gap-1.5 text-red-400 text-sm font-mono">
                <AlertCircle size={14} className="shrink-0" /> {profileError}
              </p>
            )}
            {profileSuccess && (
              <p className="flex items-center gap-1.5 text-[#10B981] text-sm font-mono">
                <CheckCircle2 size={14} className="shrink-0" /> {profileSuccess}
              </p>
            )}

            <div className="pt-4 flex justify-end border-t border-[#1F2937]/60">
              <Button
                onClick={handleSaveProfile}
                disabled={profileSaving}
                variant="accent"
                size="sm"
                className="w-full md:w-auto font-mono text-sm rounded-lg px-6 py-2.5 mt-4"
              >
                {profileSaving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Connected Platforms Card */}
        <Card variant="default" className="rounded-xl p-6 border border-[#21262D] bg-[#161B22] hover:border-[#35b9f1]/10">
          <div className="mb-6 pb-4 border-b border-[#21262D] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0D1117] border border-[#1F2937] flex items-center justify-center text-[#35b9f1] shrink-0">
              <Link2 size={16} />
            </div>
            <div>
              <h3 className="text-[#E5E7EB] font-bold text-lg leading-tight">Connected Platforms</h3>
              <p className="text-[#6B7280] text-xs font-mono">Manage your coding platform connections</p>
            </div>
          </div>

          <div className="space-y-3">
            {platformData.map((platform) => (
              <div
                key={platform.id}
                className={`bg-[#0D1117] border rounded-lg p-4 transition-colors ${
                  platform.synced ? 'border-[#35b9f1]/25' : 'border-[#1F2937]'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#161B22] border border-[#1F2937] overflow-hidden shrink-0">
                    {(() => {
                      const IconComponent = PLATFORM_ICONS[platform.id]?.Icon;
                      return IconComponent ? (
                        <IconComponent className={`w-6 h-6 ${platform.synced ? '' : 'grayscale opacity-40 text-neutral-600'}`} style={{ color: platform.color }} />
                      ) : null;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[#E5E7EB] font-semibold truncate">{platform.name}</h4>
                    <p className={`text-xs font-mono flex items-center gap-1.5 ${
                      platform.synced ? 'text-[#10B981]' : 'text-[#6B7280]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${platform.synced ? 'bg-[#10B981]' : 'bg-[#6B7280]'}`} />
                      {platform.synced ? 'Connected' : 'Not Connected'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Input
                    label="Username"
                    value={platform.username}
                    onChange={(e) => handlePlatformChange(platform.id, 'username', e.target.value)}
                    labelClassName="font-medium text-[#9CA3AF] normal-case text-xs mb-1.5 block"
                    inputClassName="py-2 px-3 border-[#1F2937] text-sm bg-[#161B22]"
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[#9CA3AF] text-xs">Sync Status</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={platform.synced}
                        onChange={(e) => handlePlatformChange(platform.id, 'synced', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#1F2937] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#35b9f1]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#35b9f1]"></div>
                    </label>
                  </div>
                </div>
              </div>
            ))}

            {platformsError && (
              <p className="flex items-center gap-1.5 text-red-400 text-sm font-mono">
                <AlertCircle size={14} className="shrink-0" /> {platformsError}
              </p>
            )}
            {platformsSuccess && (
              <p className="flex items-center gap-1.5 text-[#10B981] text-sm font-mono">
                <CheckCircle2 size={14} className="shrink-0" /> {platformsSuccess}
              </p>
            )}

            <div className="pt-4 flex justify-end border-t border-[#1F2937]/60">
              <Button
                onClick={handleSavePlatforms}
                disabled={platformsSaving}
                variant="accent"
                size="sm"
                className="w-full md:w-auto font-mono text-sm rounded-lg px-6 py-2.5 mt-4"
              >
                {platformsSaving ? 'Saving...' : 'Save Connections'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
