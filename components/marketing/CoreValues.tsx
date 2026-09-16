import Image from "next/image";

const values = [
  {
    title: "Student First",
    desc: "Everything we do is designed for students.",
    card: "bg-[#f3e8ff]",
    image: "/images/icons/students.png",
    alt: "Students illustration",
  },
  {
    title: "Trust & Quality",
    desc: "We ensure content is reviewed and reliable.",
    card: "bg-[#ecfdf3]",
    image: "/images/icons/verified.png",
    alt: "Verified shield illustration",
  },
  {
    title: "Share & Grow",
    desc: "Sharing knowledge helps everyone grow.",
    card: "bg-[#fff4e5]",
    image: "/images/icons/share.png",
    alt: "Share illustration",
  },
  {
    title: "Privacy First",
    desc: "Your data and privacy are always protected.",
    card: "bg-[#e8f3ff]",
    image: "/images/icons/lock.png",
    alt: "Lock illustration",
  },
  {
    title: "Always Free",
    desc: "Education is a right, not a privilege.",
    card: "bg-[#fde8f2]",
    image: "/images/icons/love.png",
    alt: "Heart illustration",
  },
];

export default function CoreValues() {
  return (
    <section className="font-marketing bg-white px-6 py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-14">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">
            Our Core Values
          </p>
          <h2 className="mt-3 text-[2rem] font-bold tracking-tight text-[#111] sm:text-[2.5rem] md:text-[2.75rem]">
            What We Stand For
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-500 sm:text-base">
            Guiding principles that drive everything we do, to create a better learning
            experience for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
          {values.map((value) => (
            <article
              key={value.title}
              className={`${value.card} flex min-h-[290px] flex-col rounded-[24px] px-5 pb-6 pt-5 text-center sm:min-h-[300px] sm:px-6 sm:pb-7 sm:pt-6`}
            >
              <div className="mx-auto mb-5 flex h-[120px] w-full max-w-[150px] items-end justify-center sm:h-[130px]">
                <Image
                  src={value.image}
                  alt={value.alt}
                  width={180}
                  height={180}
                  className="h-auto max-h-[120px] w-auto object-contain sm:max-h-[130px]"
                />
              </div>
              <h3 className="text-[17px] font-bold text-[#111] sm:text-[18px]">{value.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{value.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
