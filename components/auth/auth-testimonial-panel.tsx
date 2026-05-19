import { AuthTestimonialMarquee } from "@/components/auth/auth-testimonial-marquee";

export function AuthTestimonialPanel() {
  return (
    <aside className="relative hidden min-h-svh w-full overflow-hidden bg-[#040F20] lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center">
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

      <div className="relative z-10 mx-auto w-full max-w-[480px] px-10 py-16 xl:px-14">
        <div className="mb-8 max-w-md">
          <p className="font-montserrat text-sm font-semibold uppercase tracking-wider text-[#F57E3A]">
            Trusted statewide
          </p>
          <h2 className="font-montserrat mt-3 text-[28px] font-bold leading-tight text-white xl:text-[32px]">
            Real-time DUI checkpoint alerts across{" "}
            <span className="text-[#F57E3A]">California</span>
          </h2>
        </div>

        <AuthTestimonialMarquee />
      </div>
    </aside>
  );
}
