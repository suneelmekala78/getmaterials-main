import Link from "next/link";
import { FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-[#fafafa] border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="font-extrabold text-[1.3rem] text-[var(--primary)]">
              Get<span className="text-black">Materials</span>
            </Link>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              Free, open education materials curated by verified teachers. Learn anything, anytime, anywhere.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="https://linkedin.com/company/getmaterials" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[var(--primary)] hover:text-white transition">
                <FaLinkedinIn className="text-sm" />
              </a>
              <a href="https://instagram.com/getmaterials.in" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[var(--primary)] hover:text-white transition">
                <FaInstagram className="text-sm" />
              </a>
              <a href="https://x.com/getmaterials" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[var(--primary)] hover:text-white transition">
                <FaXTwitter className="text-sm" />
              </a>
              <a href="https://youtube.com/@GetMaterials" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[var(--primary)] hover:text-white transition">
                <FaYoutube className="text-sm" />
              </a>
            </div>
          </div>
          {/* Platform */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-gray-900 mb-4">Platform</h4>
            <ul className="space-y-2.5">
              <li><Link href="/materials" className="text-sm text-gray-500 hover:text-[var(--primary)]">Browse Materials</Link></li>
              <li><Link href="/about" className="text-sm text-gray-500 hover:text-[var(--primary)]">About Us</Link></li>
              <li><Link href="/support" className="text-sm text-gray-500 hover:text-[var(--primary)]">Support / Donate</Link></li>
              <li><Link href="/feedback" className="text-sm text-gray-500 hover:text-[var(--primary)]">Feedback</Link></li>
              <li><Link href="/how-to-use" className="text-sm text-gray-500 hover:text-[var(--primary)]">How to Use</Link></li>
            </ul>
          </div>
          {/* Subjects */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-gray-900 mb-4">Subjects</h4>
            <ul className="space-y-2.5">
              <li><Link href="/materials" className="text-sm text-gray-500 hover:text-[var(--primary)]">Mathematics</Link></li>
              <li><Link href="/materials" className="text-sm text-gray-500 hover:text-[var(--primary)]">Web Development</Link></li>
              <li><Link href="/materials" className="text-sm text-gray-500 hover:text-[var(--primary)]">Chemistry</Link></li>
              <li><Link href="/materials" className="text-sm text-gray-500 hover:text-[var(--primary)]">English</Link></li>
              <li><Link href="/materials" className="text-sm text-gray-500 hover:text-[var(--primary)]">Physics</Link></li>
            </ul>
          </div>
          {/* Legal */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li><Link href="/privacy" className="text-sm text-gray-500 hover:text-[var(--primary)]">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-500 hover:text-[var(--primary)]">Terms of Service</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-500 hover:text-[var(--primary)]">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} GetMaterials. Built by{" "}
            <a href="https://suneelmekala.com" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] font-semibold hover:underline">
              Suneel Mekala
            </a>
          </p>
          <p className="text-sm text-gray-400">Made with ❤️ for students everywhere</p>
        </div>
      </div>
    </footer>
  );
}
