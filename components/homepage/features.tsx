import Image from "next/image";

const FEATURES = [
  {
    icon: "/alert.svg",
    title: "Real-Time Alerts",
    description: "Instant notifications about DUI checkpoints near you.",
  },
  {
    icon: "/map.svg",
    title: "Live Incident Map",
    description:
      "Interactive map with real-time incidents and enforcement activity.",
  },
  {
    icon: "/data.svg",
    title: "Historical Data",
    description:
      "View DUI checkpoint history and trends by date, county & time.",
  },
  {
    icon: "/whattodo.svg",
    title: "What To Do First",
    description: "Arrested? Here's What to Do, and What to Avoid",
  },
  {
    icon: "/right.png",
    title: "Know Your Rights",
    description: "Quick access to your rights and legal resources.",
  },
  {
    icon: "/checkpoints.svg",
    title: "Upcoming Checkpoints",
    description:
      "All publicly announced upcoming checkpoints in one place.",
  },
] as const;

export function Features() {
  return (
    <section
      id="resources"
      className="scroll-mt-[80px] w-full bg-[#F5F6F8] py-16 md:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-14">
        <header className="mx-auto max-w-3xl text-center">
          <h2 className=" w-full max-w-[636px] mx-auto font-inter text-[28px] font-semibold leading-tight text-[#040F20] sm:text-[32px] lg:text-[36px]">
            Powerful Features Built for Your{" "}
            <span className="text-[#F57E3A]">Protection</span>
          </h2>
          <div
            className="mx-auto mt-3 h-1 w-16 rounded-full bg-[#F57E3A]"
            aria-hidden
          />
        </header>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {FEATURES.map(({ icon, title, description }) => (
            <article
              key={title}
              className="flex flex-col items-center rounded-xl bg-white px-6 py-10 text-center shadow-[0_4px_24px_rgba(4,15,32,0.08)]"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center">
                <Image
                  src={icon}
                  alt=""
                  width={80}
                  height={80}
                  className="h-16 w-16 object-contain sm:h-20 sm:w-20"
                />
              </div>
              <h3 className="font-inter text-[20px] text-lg font-semibold text-[#040F20] md:text-[22px] lg:text-[24px]">
                {title}
              </h3>
              <p className="font-inter mt-3 text-sm font-normal leading-relaxed text-[#5C6573] sm:text-base">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
