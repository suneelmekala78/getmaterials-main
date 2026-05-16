"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { Heart, Shield, Users, Sparkles, CheckCircle, Trophy } from "lucide-react";

const amounts = [50, 100, 250, 500, 1000, 2500];

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/donations/leaderboard")
      .then((res) => res.json())
      .then((data) => setLeaderboard(data.leaderboard || []))
      .catch(() => {});
  }, []);

  const handleDonate = async () => {
    const amount = selectedAmount || parseInt(customAmount);
    if (!amount || amount < 10) return;

    setLoading(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (data.orderId) {
        // Initialize Razorpay payment
        const options = {
          key: data.keyId,
          amount: amount * 100,
          currency: "INR",
          name: "GetMaterials",
          description: "Support Free Education",
          order_id: data.orderId,
          handler: async function (response: any) {
            await fetch("/api/donations", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
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

      {/* Amount selection */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Choose amount</h2>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {amounts.map((amount) => (
            <button
              key={amount}
              onClick={() => { setSelectedAmount(amount); setCustomAmount(""); }}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                selectedAmount === amount
                  ? "border-violet-500 bg-violet-50 shadow-sm"
                  : "border-slate-200 hover:border-violet-200 hover:bg-violet-50/50"
              }`}
            >
              <span className="text-xl font-bold text-slate-900">₹{amount}</span>
            </button>
          ))}
        </div>

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
            placeholder="Custom amount"
            min="10"
            className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
          />
        </div>

        <button
          onClick={handleDonate}
          disabled={loading || (!selectedAmount && !customAmount)}
          className="w-full mt-5 py-3.5 bg-gradient-to-r from-pink-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Processing..." : `Donate ₹${selectedAmount || customAmount || "0"}`}
        </button>
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
    </>
  );
}
