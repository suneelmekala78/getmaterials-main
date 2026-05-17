"use client";

import { useEffect, useState } from "react";
import { Heart, Shield, Users, Sparkles, Trophy, QrCode } from "lucide-react";
import Image from "next/image";

export default function DonatePage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/donations/leaderboard")
      .then((res) => res.json())
      .then((data) => setLeaderboard(data.leaderboard || []))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Heart className="w-6 h-6 text-pink-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Support Free Education</h1>
        <p className="text-slate-500">
          Your donation keeps GetMaterials free for everyone. Every rupee counts.
        </p>
      </div>

      {/* QR Code */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <QrCode className="w-5 h-5 text-violet-500" />
          <h3 className="text-base font-semibold text-slate-900">Scan to Donate</h3>
        </div>
        <div className="bg-slate-50 rounded-2xl p-6 inline-block">
          <Image src="/qrcode.jpeg" alt="Donation QR Code" width={220} height={220} className="rounded-xl" />
        </div>
        <p className="text-sm text-slate-500">Scan with any UPI app (Google Pay, PhonePe, Paytm, etc.)</p>
      </div>

      {/* Why donate */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Shield, title: "Transparent", desc: "Monthly spending reports" },
          { icon: Users, title: "Help Students", desc: "Keep education free" },
          { icon: Sparkles, title: "No Ads", desc: "Donations replace ads" },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-xl p-5 border border-slate-100 text-center">
            <item.icon className="w-6 h-6 text-violet-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-semibold text-slate-900">Top Supporters</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {leaderboard.map((donor, index) => (
              <div key={index} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? "bg-amber-100 text-amber-700" :
                    index === 1 ? "bg-slate-100 text-slate-600" :
                    index === 2 ? "bg-orange-100 text-orange-700" :
                    "bg-slate-50 text-slate-500"
                  }`}>
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-900">{donor.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-slate-900">₹{donor.totalAmount.toLocaleString("en-IN")}</span>
                  <span className="text-xs text-slate-400 ml-2">({donor.count} times)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
