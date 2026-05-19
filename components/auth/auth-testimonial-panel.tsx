import Image from "next/image";
import { AUTH_TESTIMONIALS } from "@/components/auth/constants";

function Stars() {
  return (
    <div className="flex gap-1" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Image
          key={i}
          src="/star.png"
          alt=""
          width={18}
          height={18}
          className="h-[18px] w-[18px]"
        />
      ))}
    </div>
  );
}

function TestimonialCard({
  quote,
  name,
  role,
  avatar,
  rotate,
  offset,
}: (typeof AUTH_TESTIMONIALS)[number]) {
  return (
    <article
      className={`rounded-2xl border border-white/10 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)] ${rotate} ${offset}`}
    >
      <p className="font-montserrat text-[15px] font-medium leading-[1.65] text-[#5C6573]">
        {quote}
      </p>
      <div className="mt-5">
        <Stars />
      </div>
      <div className="mt-5 flex items-center gap-3 border-t border-[#E8EAED] pt-5">
        <Image
          src={avatar}
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 rounded-full object-cover"
        />
        <div>
          <p className="font-montserrat text-[15px] font-semibold text-[#040F20]">
            {name}
          </p>
          <p className="font-montserrat text-sm font-medium text-[#8B939F]">
            {role}
          </p>
        </div>
      </div>
    </article>
  );
}

export function AuthTestimonialPanel() {
  return (
    <aside
      className="relative hidden min-h-svh w-full overflow-hidden bg-[#040F20] lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:overflow-y-auto"
      aria-hidden
    >
      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245, 126, 58, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245, 126, 58, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Orange ambient glow */}
      <div className="pointer-events-none absolute -right-20 top-1/4 h-[420px] w-[420px] rounded-full bg-[#F57E3A]/20 blur-[100px]" />
      <div className="pointer-events-none absolute -left-16 bottom-1/4 h-[320px] w-[320px] rounded-full bg-[#F57E3A]/10 blur-[80px]" />

      <div className="relative z-10 mx-auto w-full max-w-[520px] space-y-6 px-10 py-16 xl:px-14">
        <div className="mb-2 max-w-md">
          <p className="font-montserrat text-sm font-semibold uppercase tracking-wider text-[#F57E3A]">
            Trusted statewide
          </p>
          <h2 className="font-montserrat mt-3 text-[28px] font-bold leading-tight text-white xl:text-[32px]">
            Real-time DUI checkpoint alerts across{" "}
            <span className="text-[#F57E3A]">California</span>
          </h2>
        </div>

        {AUTH_TESTIMONIALS.map((item) => (
          <TestimonialCard key={item.name} {...item} />
        ))}
      </div>
    </aside>
  );
}
