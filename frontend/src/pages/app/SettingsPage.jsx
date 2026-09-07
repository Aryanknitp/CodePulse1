import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useSync } from "../../hooks/useSync.js";
import { useApp } from "../../context/AppContext.jsx";
import { authApi } from "../../services/authApi.js";
import { userApi } from "../../services/userApi.js";
import { codeforcesApi } from "../../services/codeforcesApi.js";
import { ROUTES } from "../../constants/routes.js";
import { validatePassword } from "../../utils/validators.js";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import Tabs from "../../components/common/Tabs.jsx";
import ConfirmDialog from "../../components/common/ConfirmDialog.jsx";

const SETTINGS_TABS = [
  { value: "account", label: "Account" },
  { value: "appearance", label: "Appearance" },
  { value: "notifications", label: "Notifications" },
  { value: "codeforces", label: "Codeforces" },
  { value: "ai", label: "AI" },
  { value: "security", label: "Security" },
];

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      className={`relative w-9 h-5 rounded-full transition-colors ${checked ? "bg-[#6366f1]" : "bg-[#1e2030]"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`}
      />
    </button>
  );
}

function AccountTab() {
  const { user } = useAuth();
  return (
    <div className="space-y-4">
      <p className="text-sm text-[#9ca3c4]">
        Account information is managed in your profile.
      </p>
      <div className="bg-[#0d0e14] rounded-lg p-4">
        <p className="text-xs text-[#6b7280] mb-1">Name</p>
        <p className="text-sm text-[#e8eaf0]">{user?.name}</p>
      </div>
      <div className="bg-[#0d0e14] rounded-lg p-4">
        <p className="text-xs text-[#6b7280] mb-1">Email</p>
        <p className="text-sm text-[#e8eaf0]">{user?.email}</p>
      </div>
    </div>
  );
}

function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-[#e8eaf0]">Theme</p>
      <div className="flex gap-3">
        {["dark", "light", "system"].map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`flex-1 py-3 rounded-lg border text-sm font-medium capitalize transition-colors ${theme === t ? "border-[#6366f1] bg-[#6366f1]/10 text-[#818cf8]" : "border-[#1e2030] text-[#6b7280] hover:border-[#252840]"}`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

function NotificationsTab() {
  const { user } = useAuth();
  const { toast } = useApp();
  const [prefs, setPrefs] = useState(
    user?.notificationPrefs || { daily: true, weekly: true, syncFail: true },
  );
  const update = async (key, value) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    try {
      await userApi.updateMe({ notificationPrefs: next });
    } catch {
      toast.error("Failed to save notification settings.");
    }
  };
  return (
    <div className="space-y-4">
      {[
        {
          key: "daily",
          label: "Daily Practice",
          desc: "When your daily practice is ready",
        },
        {
          key: "weekly",
          label: "Weekly Report",
          desc: "When your weekly AI report is available",
        },
        {
          key: "syncFail",
          label: "Sync Failures",
          desc: "When Codeforces sync fails",
        },
      ].map((n) => (
        <div
          key={n.key}
          className="flex items-center justify-between py-3 border-b border-[#1e2030] last:border-0"
        >
          <div>
            <p className="text-sm text-[#e8eaf0]">{n.label}</p>
            <p className="text-xs text-[#6b7280]">{n.desc}</p>
          </div>
          <Toggle checked={prefs[n.key]} onChange={(v) => update(n.key, v)} />
        </div>
      ))}
    </div>
  );
}

function CodeforcesTab() {
  const { syncing, syncNow } = useSync();
  const { user } = useAuth();
  const { toast } = useApp();
  const [autoSync, setAutoSync] = useState(user?.autoSync ?? true);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-3 border-b border-[#1e2030]">
        <div>
          <p className="text-sm text-[#e8eaf0]">Automatic Sync</p>
          <p className="text-xs text-[#6b7280]">
            Auto-sync new Codeforces activity
          </p>
        </div>
        <Toggle
          checked={autoSync}
          onChange={async (value) => {
            setAutoSync(value);
            try {
              await userApi.updateMe({ autoSync: value });
            } catch {
              toast.error("Failed to save auto-sync setting.");
            }
          }}
        />
      </div>
      <div className="flex items-center justify-between py-3 border-b border-[#1e2030]">
        <div>
          <p className="text-sm text-[#e8eaf0]">Last Sync</p>
          <p className="text-xs text-[#6b7280]">
            {user?.cfProfile?.lastSyncAt
              ? new Date(user.cfProfile.lastSyncAt).toLocaleString()
              : "Never"}
          </p>
        </div>
      </div>
      <Button variant="secondary" onClick={syncNow} loading={syncing}>
        Manual Sync Now
      </Button>
    </div>
  );
}

function AITab() {
  const { user } = useAuth();
  const { toast } = useApp();
  const [focus, setFocus] = useState(user?.aiFocus || "balanced");
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-[#e8eaf0]">Coaching Focus</p>
      <div className="space-y-2">
        {[
          {
            value: "competitive",
            label: "Competitive",
            desc: "Focus on contest performance and rating improvement",
          },
          {
            value: "balanced",
            label: "Balanced",
            desc: "Mix of rating improvement and topic coverage",
          },
          {
            value: "foundations",
            label: "Foundations",
            desc: "Focus on strengthening weak fundamentals",
          },
        ].map((f) => (
          <button
            key={f.value}
            onClick={async () => {
              setFocus(f.value);
              try {
                await userApi.updateMe({ aiFocus: f.value });
              } catch {
                toast.error("Failed to save AI preference.");
              }
            }}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${focus === f.value ? "border-[#6366f1] bg-[#6366f1]/10" : "border-[#1e2030] hover:border-[#252840]"}`}
          >
            <p className="text-sm font-medium text-[#e8eaf0]">{f.label}</p>
            <p className="text-xs text-[#6b7280]">{f.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function SecurityTab() {
  const [form, setForm] = useState({ current: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { toast } = useApp();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.current) errs.current = "Required";
    const pwErrs = validatePassword(form.password);
    if (pwErrs.length) errs.password = pwErrs[0];
    if (form.password !== form.confirm) errs.confirm = "Passwords do not match";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: form.current,
        password: form.password,
      });
      toast.success("Password changed successfully.");
      setForm({ current: "", password: "", confirm: "" });
    } catch (err) {
      toast.error(err?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleChangePassword} className="space-y-4">
        <p className="text-sm font-medium text-[#e8eaf0]">Change Password</p>
        <Input
          type="password"
          label="Current Password"
          value={form.current}
          error={errors.current}
          onChange={(e) => setForm((p) => ({ ...p, current: e.target.value }))}
        />
        <Input
          type="password"
          label="New Password"
          value={form.password}
          error={errors.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
        />
        <Input
          type="password"
          label="Confirm New Password"
          value={form.confirm}
          error={errors.confirm}
          onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
        />
        <Button type="submit" variant="secondary" loading={loading}>
          Change Password
        </Button>
      </form>
      <div className="border-t border-[#1e2030] pt-4">
        <Button
          variant="ghost"
          className="w-full text-[#ef4444] hover:bg-[#ef4444]/10"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}

const TAB_CONTENT = {
  account: AccountTab,
  appearance: AppearanceTab,
  notifications: NotificationsTab,
  codeforces: CodeforcesTab,
  ai: AITab,
  security: SecurityTab,
};

export default function SettingsPage() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") || "account");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useApp();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const TabContent = TAB_CONTENT[tab] || (() => null);

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await userApi.deleteMe();
      toast.success("Account deleted.");
      await logout();
      navigate(ROUTES.HOME);
    } catch {
      toast.error("Failed to delete account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold text-[#e8eaf0]">Settings</h2>
        <p className="text-sm text-[#6b7280]">
          Manage your application preferences.
        </p>
      </div>

      <Tabs
        tabs={SETTINGS_TABS}
        active={tab}
        onChange={setTab}
        className="overflow-x-auto"
      />

      <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-5">
        <TabContent />
      </div>

      {/* Danger Zone */}
      <div className="bg-[#111218] border border-[#ef4444]/20 rounded-xl p-5 space-y-3">
        <p className="text-sm font-semibold text-[#ef4444]">Danger Zone</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="border border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10"
            onClick={() => setConfirmDisconnect(true)}
          >
            Disconnect Codeforces
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="border border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10"
            onClick={() => setConfirmDelete(true)}
          >
            Delete Account
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        description="This will permanently delete your account and all data. This cannot be undone."
        confirmLabel="Delete Account"
        loading={loading}
      />
      <ConfirmDialog
        open={confirmDisconnect}
        onClose={() => setConfirmDisconnect(false)}
        onConfirm={async () => {
          try {
            await codeforcesApi.disconnect();
            toast.success("Disconnected.");
            navigate(ROUTES.CONNECT_CODEFORCES);
          } catch {
            toast.error("Failed.");
          }
          setConfirmDisconnect(false);
        }}
        title="Disconnect Codeforces"
        description="Remove your Codeforces connection and all synced data."
        confirmLabel="Disconnect"
      />
    </div>
  );
}
