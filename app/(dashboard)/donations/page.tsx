"use client";

import { useState, useEffect } from "react";
import { Heart, Calendar, CheckCircle, Clock, IndianRupee } from "lucide-react";

interface Donation {
  _id: string;
  amount: number;
  currency: string;
  status: "completed" | "pending";
  message?: string;
  createdAt: string;
}

export default function DonationHistoryPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/donations/history")
      .then((res) => res.json())
      .then((data) => {
        setDonations(data.donations || []);
        setTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white rounded-xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Donation History</h1>
        <p className="text-slate-500 mt-1">Track your contributions to free education.</p>
      </div>

      {/* Summary card */}
      <div className="bg-gradient-to-r from-pink-500 to-violet-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-5 h-5" />
          <span className="text-sm font-medium opacity-90">Total Donated</span>
        </div>
        <p className="text-3xl font-bold">₹{total.toLocaleString("en-IN")}</p>
        <p className="text-sm opacity-80 mt-1">{donations.filter(d => d.status === "completed").length} successful donations</p>
      </div>

      {/* Donation list */}
      {donations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Heart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">No donations yet</p>
          <p className="text-xs text-slate-400 mt-1">Your donations will appear here after you contribute.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {donations.map((donation) => (
            <div
              key={donation._id}
              className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  donation.status === "completed" ? "bg-emerald-50" : "bg-amber-50"
                }`}>
                  {donation.status === "completed" ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    ₹{donation.amount.toLocaleString("en-IN")}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-500">
                      {new Date(donation.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-lg capitalize ${
                donation.status === "completed"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}>
                {donation.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
