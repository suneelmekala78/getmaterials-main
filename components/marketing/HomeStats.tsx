import { FaUsers, FaSmile, FaUniversity, FaFolderOpen, FaHeart } from "react-icons/fa";

const stats = [
  { icon: FaUsers, value: "10,000+", label: "Study Materials", tint: "bg-[#EDE4FF] text-[#7C3AED]" },
  { icon: FaSmile, value: "5,000+", label: "Happy Students", tint: "bg-[#DCFCE7] text-[#16A34A]" },
  { icon: FaUniversity, value: "100+", label: "Colleges", tint: "bg-[#FFEDD5] text-[#EA580C]" },
  { icon: FaFolderOpen, value: "50+", label: "Subjects Covered", tint: "bg-[#DBEAFE] text-[#2563EB]" },
  { icon: FaHeart, value: "100%", label: "Free Forever", tint: "bg-[#FCE7F3] text-[#DB2777]" },
];

export default function HomeStats() {
  return (
    <section className="relative z-10 px-6 pb-8 -mt-2">
      <div className="max-w-6xl mx-auto bg-white rounded-[28px] shadow-[0_16px_50px_rgba(17,17,17,0.08)] px-4 py-6 md:px-8 md:py-7">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-3">
          {stats.map((item) => (
            <div key={item.label} className="flex flex-col items-center text-center gap-2.5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.tint}`}>
                <item.icon className="text-xl" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-[#111] leading-tight">{item.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
