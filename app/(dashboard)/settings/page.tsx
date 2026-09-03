"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { User, Lock, Bell, LogOut, Save, GraduationCap, Clock, CheckCircle2, XCircle } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [phone, setPhone] = useState("");
  const [savedPhone, setSavedPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Role change request state
  const [roleReason, setRoleReason] = useState("");
  const [roleQualifications, setRoleQualifications] = useState("");
  const [roleSubmitting, setRoleSubmitting] = useState(false);
  const [roleRequest, setRoleRequest] = useState<{ status: string; createdAt: string } | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [colleges, setColleges] = useState<{ _id: string; name: string; code?: string }[]>([]);
  const [roleCollege, setRoleCollege] = useState("");
  const [collegeMissing, setCollegeMissing] = useState(false);
  const [requestedCollegeName, setRequestedCollegeName] = useState("");

  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        const value = String(data.user?.phone || "");
        setPhone(value);
        setSavedPhone(value);
        if (data.user?.name) setName(data.user.name);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/college-directory")
      .then((res) => res.json())
      .then((data) => setColleges(data.colleges || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.role === "student") {
      fetch("/api/role-change-requests")
        .then((res) => res.json())
        .then((data) => {
          const pending = data.requests?.find((r: any) => r.status === "pending");
          const latest = data.requests?.[0];
          setRoleRequest(pending || latest || null);
        })
        .catch(() => {})
        .finally(() => setRoleLoading(false));
    } else {
      setRoleLoading(false);
    }
  }, [user?.role]);

  const handleRoleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleReason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    if (!collegeMissing && !roleCollege) {
      toast.error("Select your college");
      return;
    }
    if (collegeMissing && requestedCollegeName.trim().length < 3) {
      toast.error("Enter the college name to request");
      return;
    }
    setRoleSubmitting(true);
    try {
      const res = await fetch("/api/role-change-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toRole: "teacher",
          reason: roleReason.trim(),
          qualifications: roleQualifications.trim() || undefined,
          college: collegeMissing ? undefined : roleCollege,
          requestedCollegeName: collegeMissing
            ? requestedCollegeName.trim()
            : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Request submitted! We'll review it soon.");
        setRoleRequest({ status: "pending", createdAt: new Date().toISOString() });
        setRoleReason("");
        setRoleQualifications("");
      } else {
        toast.error(data.error || "Failed to submit request");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setRoleSubmitting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        toast.success("Profile updated successfully!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update profile");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const sendPhoneOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error("Enter a valid 10-digit Indian mobile number");
      return;
    }
    setPhoneLoading(true);
    try {
      const res = await fetch("/api/user/phone/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setPhoneOtpSent(true);
      setPhoneCode("");
      toast.success("OTP sent to your mobile number");
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setPhoneLoading(false);
    }
  };

  const confirmPhone = async () => {
    if (phoneCode.length !== 6) return;
    setPhoneLoading(true);
    try {
      const res = await fetch("/api/user/phone/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: phoneCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");
      setSavedPhone(phone);
      setPhoneOtpSent(false);
      setPhoneCode("");
      toast.success("Mobile number updated");
    } catch (error: any) {
      toast.error(error.message || "Invalid or expired OTP");
    } finally {
      setPhoneLoading(false);
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Mobile Number
            </label>
            <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20">
              <span className="inline-flex items-center px-3 bg-slate-50 border-r border-slate-200 text-sm text-slate-600">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                  setPhoneOtpSent(false);
                  setPhoneCode("");
                }}
                maxLength={10}
                placeholder="9876543210"
                className="flex-1 min-w-0 px-4 py-2.5 text-sm focus:outline-none"
              />
              {phone === savedPhone && savedPhone ? (
                <span className="inline-flex items-center px-3 text-xs font-semibold text-emerald-600">
                  Verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={sendPhoneOtp}
                  disabled={phoneLoading || phone.length !== 10}
                  className="px-4 text-xs font-semibold text-violet-600 hover:bg-violet-50 disabled:text-slate-300"
                >
                  {phoneLoading ? "Sending..." : phoneOtpSent ? "Resend" : "Verify"}
                </button>
              )}
            </div>
            {phoneOtpSent && phone !== savedPhone && (
              <div className="flex gap-2 mt-2">
                <input
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit OTP"
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm tracking-[0.3em] text-center focus:outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={confirmPhone}
                  disabled={phoneLoading || phoneCode.length !== 6}
                  className="px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium disabled:opacity-50"
                >
                  Confirm
                </button>
              </div>
            )}
            <p className="text-xs text-slate-400 mt-1">
              Adding or changing your number requires OTP verification.
            </p>
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
            if (newPassword.length < 8) {
              setPwError("New password must be at least 8 characters");
              return;
            }
            if (newPassword === currentPassword) {
              setPwError("New password must be different from your current password");
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
            <div className="relative">
              <input
                type={showCurrentPw ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 pr-12 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
              <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">
                {showCurrentPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showNewPw ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 pr-12 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">
                {showNewPw ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">Min 8 chars, 1 uppercase, 1 number</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPw ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 pr-12 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
              <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">
                {showConfirmPw ? "Hide" : "Show"}
              </button>
            </div>
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

      {/* Become a Teacher — only for students */}
      {user?.role === "student" && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-slate-400" />
            <h2 className="text-base font-semibold text-slate-900">Become a Teacher</h2>
          </div>
          <div className="p-6">
            {roleLoading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : roleRequest?.status === "pending" ? (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <Clock className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Request Pending</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Your request to become a teacher is under review. You can keep using the site as a student in the meantime.
                  </p>
                  <p className="text-xs text-amber-500 mt-2">
                    Submitted {new Date(roleRequest.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : roleRequest?.status === "approved" ? (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">Request Approved!</p>
                  <p className="text-xs text-green-600 mt-1">
                    Your teacher request was approved. Please log out and log back in to access teacher features.
                  </p>
                </div>
              </div>
            ) : roleRequest?.status === "rejected" ? (
              <>
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Previous Request Rejected</p>
                    <p className="text-xs text-red-600 mt-1">
                      Your previous request was not approved. You can submit a new one with more details.
                    </p>
                  </div>
                </div>
                <form onSubmit={handleRoleRequest} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Why do you want to become a teacher?</label>
                    <textarea
                      value={roleReason}
                      onChange={(e) => setRoleReason(e.target.value)}
                      rows={3}
                      required
                      maxLength={1000}
                      placeholder="Explain your teaching experience, subjects you'd like to teach..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Qualifications (optional)</label>
                    <input
                      type="text"
                      value={roleQualifications}
                      onChange={(e) => setRoleQualifications(e.target.value)}
                      maxLength={500}
                      placeholder="e.g., B.Tech in CSE, 2 years teaching experience"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">College you teach at</label>
                    {!collegeMissing && (
                      <select
                        value={roleCollege}
                        onChange={(e) => setRoleCollege(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                      >
                        <option value="">Select college</option>
                        {colleges.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}{c.code ? ` (${c.code})` : ""}
                          </option>
                        ))}
                      </select>
                    )}
                    <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={collegeMissing}
                        onChange={(e) => {
                          setCollegeMissing(e.target.checked);
                          if (e.target.checked) setRoleCollege("");
                        }}
                      />
                      My college isn&apos;t listed — request to add it
                    </label>
                    {collegeMissing && (
                      <input
                        type="text"
                        value={requestedCollegeName}
                        onChange={(e) => setRequestedCollegeName(e.target.value)}
                        placeholder="College name"
                        className="mt-2 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                      />
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={roleSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white font-medium text-sm rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors"
                  >
                    <GraduationCap className="w-4 h-4" />
                    {roleSubmitting ? "Submitting..." : "Submit Request"}
                  </button>
                </form>
              </>
            ) : (
              <form onSubmit={handleRoleRequest} className="space-y-4">
                <p className="text-sm text-slate-600 mb-4">
                  Want to contribute study materials? Apply to become a teacher. You keep full student access while we review your request.
                </p>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Why do you want to become a teacher?</label>
                  <textarea
                    value={roleReason}
                    onChange={(e) => setRoleReason(e.target.value)}
                    rows={3}
                    required
                    maxLength={1000}
                    placeholder="Explain your teaching experience, subjects you'd like to teach..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Qualifications (optional)</label>
                    <input
                    type="text"
                    value={roleQualifications}
                    onChange={(e) => setRoleQualifications(e.target.value)}
                    maxLength={500}
                    placeholder="e.g., B.Tech in CSE, 2 years teaching experience"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">College you teach at</label>
                  {!collegeMissing && (
                    <select
                      value={roleCollege}
                      onChange={(e) => setRoleCollege(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                    >
                      <option value="">Select college</option>
                      {colleges.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}{c.code ? ` (${c.code})` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                  <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={collegeMissing}
                      onChange={(e) => {
                        setCollegeMissing(e.target.checked);
                        if (e.target.checked) setRoleCollege("");
                      }}
                    />
                    My college isn&apos;t listed — request to add it
                  </label>
                  {collegeMissing && (
                    <input
                      type="text"
                      value={requestedCollegeName}
                      onChange={(e) => setRequestedCollegeName(e.target.value)}
                      placeholder="College name"
                      className="mt-2 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                    />
                  )}
                </div>
                <button
                  type="submit"
                  disabled={roleSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white font-medium text-sm rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors"
                >
                  <GraduationCap className="w-4 h-4" />
                  {roleSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

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
