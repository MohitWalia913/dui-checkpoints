"use client";

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
}: (typeof AUTH_TESTIMONIALS)[number]) {
  return (
    <article className="shrink-0 rounded-2xl border border-white/10 bg-white p-6 shadow-[0_16px_40px_rgba(0,0,0,0.3)]">
      <p className="font-montserrat text-[15px] font-medium leading-[1.65] text-[#5C6573]">
        {quote}
      </p>
      <div className="mt-4">
        <Stars />
      </div>
      <div className="mt-4 flex items-center gap-3 border-t border-[#E8EAED] pt-4">
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

const EDGE_MASK =
  "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)";

export function AuthTestimonialMarquee() {
  return (
    <div className="relative w-full">
      {/* Edge fade overlays (reinforces mask on dark bg) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-[#040F20] to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-[#040F20] to-transparent"
        aria-hidden
      />

      <div
        role="region"
        aria-label="Customer reviews"
        className="max-h-[min(520px,58vh)] overflow-y-auto overscroll-contain px-0.5 py-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{
          maskImage: EDGE_MASK,
          WebkitMaskImage: EDGE_MASK,
        }}
      >
        <div className="flex flex-col gap-5">
          {AUTH_TESTIMONIALS.map((item) => (
            <TestimonialCard key={item.name} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
