"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { User, Lock, Bell, LogOut, Save } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
    } catch (err) {
      // Handle error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences.</p>
      </div>

      {/* Profile section */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <User className="w-5 h-5 text-slate-400" />
          <h2 className="text-base font-semibold text-slate-900">Profile</h2>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{user?.name}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-violet-50 text-violet-600 rounded">
                {user?.role || "student"}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white font-medium text-sm rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <Lock className="w-5 h-5 text-slate-400" />
          <h2 className="text-base font-semibold text-slate-900">Change Password</h2>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setPwError("");
            setPwSuccess("");
            if (newPassword !== confirmPassword) {
              setPwError("Passwords do not match");
              return;
            }
            setPwLoading(true);
            try {
              const res = await fetch("/api/user/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
              });
              const data = await res.json();
              if (!res.ok) {
                setPwError(data.error || "Failed to change password");
              } else {
                setPwSuccess("Password changed successfully!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }
            } catch {
              setPwError("Something went wrong");
            } finally {
              setPwLoading(false);
            }
          }}
          className="p-6 space-y-4"
        >
          {pwError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {pwError}
            </div>
          )}
          {pwSuccess && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg">
              {pwSuccess}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
            <p className="text-xs text-slate-400 mt-1">Min 8 chars, 1 uppercase, 1 number</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={pwLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white font-medium text-sm rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            <Lock className="w-4 h-4" />
            {pwLoading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <Bell className="w-5 h-5 text-slate-400" />
          <h2 className="text-base font-semibold text-slate-900">Notifications</h2>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: "New material notifications", desc: "Get notified when new materials are added to your subjects" },
            { label: "Quiz reminders", desc: "Remind you to take quizzes you haven't completed" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-10 h-5 bg-slate-200 peer-focus:ring-2 peer-focus:ring-violet-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <LogOut className="w-5 h-5 text-slate-400" />
          <h2 className="text-base font-semibold text-slate-900">Session</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Sign out</p>
              <p className="text-xs text-slate-500">Sign out of your account on this device</p>
            </div>
            <button
              onClick={() => setShowLogout(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showLogout}
        title="Log out"
        message="Are you sure you want to log out?"
        confirmLabel="Log out"
        variant="warning"
        onConfirm={() => signOut({ callbackUrl: "/login" })}
        onCancel={() => setShowLogout(false)}
      />


    </div>
  );
}
