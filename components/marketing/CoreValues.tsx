import { FaUsers, FaShieldAlt, FaShareAlt, FaLock, FaHeart } from "react-icons/fa";

const values = [
  {
    icon: FaUsers,
    title: "Student First",
    desc: "Everything we do is designed for students.",
    card: "bg-[#F3E8FF]",
    iconWrap: "text-[#7C3AED]",
  },
  {
    icon: FaShieldAlt,
    title: "Trust & Quality",
    desc: "We ensure content is reviewed and reliable.",
    card: "bg-[#ECFDF3]",
    iconWrap: "text-[#16A34A]",
  },
  {
    icon: FaShareAlt,
    title: "Share & Grow",
    desc: "Sharing knowledge helps everyone grow.",
    card: "bg-[#FFF4E5]",
    iconWrap: "text-[#EA580C]",
  },
  {
    icon: FaLock,
    title: "Privacy First",
    desc: "Your data and privacy are always protected.",
    card: "bg-[#E8F3FF]",
    iconWrap: "text-[#2563EB]",
  },
  {
    icon: FaHeart,
    title: "Always Free",
    desc: "Education is a right, not a privilege.",
    card: "bg-[#FDE8F2]",
    iconWrap: "text-[#DB2777]",
  },
];

export default function CoreValues() {
  return (
    <section className="section-sm bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-10 text-[#111]">
          Our Core Values
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {values.map((value) => (
            <div
              key={value.title}
              className={`${value.card} rounded-[22px] p-6 text-center`}
            >
              <div className={`mx-auto mb-4 ${value.iconWrap}`}>
                <value.icon className="text-[28px] mx-auto" />
              </div>
              <h3 className="font-bold mb-2 text-[#111]">{value.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{value.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
