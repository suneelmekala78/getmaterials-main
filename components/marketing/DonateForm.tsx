"use client";

import { FaQrcode } from "react-icons/fa";
import Image from "next/image";

export default function DonateForm() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-10 text-center space-y-5">
      <div className="flex items-center justify-center gap-2">
        <FaQrcode className="text-[var(--primary)] text-lg" />
        <h3 className="text-lg font-bold">Scan to Donate</h3>
      </div>
      <div className="bg-gray-50 rounded-2xl p-6 inline-block">
        <Image src="/qrcode.jpeg" alt="Donation QR Code" width={220} height={220} className="rounded-xl" />
      </div>
      <p className="text-sm text-gray-500">Scan with any UPI app (Google Pay, PhonePe, Paytm, etc.)</p>
    </div>
  );
}
