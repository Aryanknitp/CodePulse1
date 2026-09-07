import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSync } from '../../hooks/useSync.js';
import { codeforcesApi } from '../../services/codeforcesApi.js';
import { authApi } from '../../services/authApi.js';
import { useApp } from '../../context/AppContext.jsx';
import { ROUTES } from '../../constants/routes.js';
import { getRatingColor, getRatingTitle } from '../../utils/formatRating.js';
import { formatRelative } from '../../utils/formatDate.js';
import Button from '../../components/common/Button.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';

function Section({ title, children }) {
  return (
    <div className="bg-[#111218] border border-[#1e2030] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1e2030]">
        <h3 className="text-sm font-semibold text-[#e8eaf0]">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Row({ label, value, action }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#1e2030] last:border-0">
      <div>
        <p className="text-xs text-[#6b7280]">{label}</p>
        <p className="text-sm text-[#e8eaf0] mt-0.5">{value || '—'}</p>
      </div>
      {action}
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout, codeforcesConnected, refreshUser } = useAuth();
  const { syncing, syncNow } = useSync();
  const { toast } = useApp();
  const navigate = useNavigate();
  const [disconnecting, setDisconnecting] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await codeforcesApi.disconnect();
      await refreshUser();
      toast.success('Codeforces account disconnected.');
      setConfirmDisconnect(false);
      navigate(ROUTES.CONNECT_CODEFORCES);
    } catch {
      toast.error('Failed to disconnect.');
    } finally {
      setDisconnecting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold text-[#e8eaf0]">Profile</h2>
        <p className="text-sm text-[#6b7280]">Manage your account and Codeforces connection.</p>
      </div>

      {/* Avatar header */}
      <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#6366f1]/20 flex items-center justify-center text-2xl font-bold text-[#818cf8]">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <p className="font-semibold text-[#e8eaf0]">{user?.name}</p>
          <p className="text-sm text-[#6b7280]">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={user?.emailVerified ? 'success' : 'warning'}>
              {user?.emailVerified ? 'Email Verified' : 'Email Unverified'}
            </StatusBadge>
          </div>
        </div>
      </div>

      {/* Account */}
      <Section title="Account">
        <Row label="Full Name" value={user?.name} />
        <Row label="Email" value={user?.email}
          action={<StatusBadge status={user?.emailVerified ? 'success' : 'warning'}>{user?.emailVerified ? 'Verified' : 'Unverified'}</StatusBadge>} />
      </Section>

      {/* Codeforces */}
      <Section title="Codeforces Connection">
        {codeforcesConnected ? (
          <>
            <Row label="Handle" value={user?.codeforcesHandle}
              action={<StatusBadge status={user?.codeforcesVerified ? 'success' : 'warning'}>{user?.codeforcesVerified ? 'Verified' : 'Unverified'}</StatusBadge>} />
            <Row label="Current Rating" value={user?.cfProfile?.rating ? (
              <span style={{ color: getRatingColor(user.cfProfile.rating) }}>
                {user.cfProfile.rating} ({getRatingTitle(user.cfProfile.rating)})
              </span>
            ) : '—'} />
            <Row label="Max Rating" value={user?.cfProfile?.maxRating || '—'} />
            <Row label="Last Sync" value={user?.cfProfile?.lastSyncAt ? formatRelative(user.cfProfile.lastSyncAt) : 'Never'} />
            <div className="flex gap-2 pt-3">
              <Button variant="secondary" size="sm" onClick={syncNow} loading={syncing}>Sync Now</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.CONNECT_CODEFORCES)} className="text-[#9ca3c4]">Change Handle</Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmDisconnect(true)} className="text-[#ef4444] ml-auto">Disconnect</Button>
            </div>
          </>
        ) : (
          <div className="text-center py-4 space-y-3">
            <p className="text-sm text-[#6b7280]">No Codeforces account connected.</p>
            <Button onClick={() => navigate(ROUTES.CONNECT_CODEFORCES)}>Connect Codeforces</Button>
          </div>
        )}
      </Section>

      {/* Security */}
      <Section title="Security">
        <div className="space-y-3">
          <Button variant="secondary" className="w-full" onClick={() => navigate(ROUTES.SETTINGS + '?tab=security')}>
            Change Password
          </Button>
          <Button variant="ghost" className="w-full text-[#ef4444] hover:bg-[#ef4444]/10" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Section>

      <ConfirmDialog
        open={confirmDisconnect}
        onClose={() => setConfirmDisconnect(false)}
        onConfirm={handleDisconnect}
        title="Disconnect Codeforces"
        description="This will remove your Codeforces connection and all synced data. You can reconnect anytime."
        confirmLabel="Disconnect"
        loading={disconnecting}
      />
    </div>
  );
}
