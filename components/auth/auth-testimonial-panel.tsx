import { AuthTestimonialMarquee } from "@/components/auth/auth-testimonial-marquee";

export function AuthTestimonialPanel() {
  return (
    <aside className="relative hidden min-h-svh w-full flex-1 overflow-hidden bg-[#040F20] lg:flex lg:min-w-0 lg:flex-col lg:justify-center">
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
      <div className="pointer-events-none absolute -right-24 top-1/4 h-[480px] w-[480px] rounded-full bg-[#F57E3A]/20 blur-[100px]" />
      <div className="pointer-events-none absolute -left-20 bottom-1/4 h-[380px] w-[380px] rounded-full bg-[#F57E3A]/10 blur-[80px]" />

      <div className="relative z-10 flex w-full flex-col justify-center gap-10 px-8 py-16 lg:px-12 xl:gap-12 xl:px-16 xl:py-20">
        <div className="max-w-2xl">
          <p className="font-montserrat text-sm font-semibold uppercase tracking-wider text-[#F57E3A]">
            Trusted statewide
          </p>
          <h2 className="font-montserrat mt-3 text-[28px] font-bold leading-tight text-white lg:text-[34px] xl:text-[38px]">
            Real-time DUI checkpoint alerts across{" "}
            <span className="text-[#F57E3A]">California</span>
          </h2>
        </div>

        <AuthTestimonialMarquee />
      </div>
    </aside>
  );
}
