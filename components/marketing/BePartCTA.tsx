import Image from "next/image";
import Link from "next/link";
import { FaCloudUploadAlt, FaUsers } from "react-icons/fa";

export default function BePartCTA() {
  return (
    <section className="section pt-2 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(90deg,#1E3A8A_0%,#5B21B6_45%,#7C3AED_100%)]">
          <svg
            className="pointer-events-none absolute left-4 top-6 w-36 h-36 text-white/15"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="32" cy="32" r="20" />
            <ellipse cx="32" cy="32" rx="8" ry="20" />
            <path d="M12 32h40M18 20h28M18 44h28" />
          </svg>
          <svg
            className="pointer-events-none absolute right-8 bottom-6 w-24 h-24 text-white/20"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="M12 40h40v6a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6v-6Z" />
            <path d="M20 40V28l12-10 12 10v12" />
            <path d="M44 22v-6h6" />
          </svg>

          <div className="relative grid grid-cols-1 md:grid-cols-[1.1fr_1fr] md:items-stretch">
            <div className="flex items-end justify-center md:justify-start px-4 md:pl-10 pt-6 md:pt-8">
              <Image
                src="/images/be-part.png"
                alt="Students joining the GetMaterials community"
                width={760}
                height={420}
                className="w-full max-w-[560px] h-auto object-contain object-bottom block"
              />
            </div>
            <div className="text-white text-center md:text-left px-6 py-10 md:pr-10 md:pl-2 flex flex-col justify-center">
              <h2 className="text-3xl md:text-[36px] font-extrabold mb-3 leading-tight">
                Be a Part of Something Bigger
              </h2>
              <p className="text-white/90 mb-6 max-w-md mx-auto md:mx-0">
                Upload materials, help others, and make learning better for everyone.
              </p>
              <div className="flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-3">
                <Link
                  href="/upload"
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#6D28D9] font-bold px-5 py-3 rounded-lg text-[15px] hover:-translate-y-0.5 transition-all w-full sm:w-auto"
                >
                  <FaCloudUploadAlt className="text-base" />
                  Upload Material
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 border border-white text-white font-bold px-5 py-3 rounded-lg text-[15px] hover:bg-white/10 transition-all w-full sm:w-auto"
                >
                  <FaUsers className="text-sm" />
                  Join Community
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
