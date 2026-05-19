"use client";

import Image from "next/image";
import { AUTH_TESTIMONIALS } from "@/components/auth/constants";
import { cn } from "@/lib/utils";

const MARQUEE_ITEMS = [...AUTH_TESTIMONIALS, ...AUTH_TESTIMONIALS];

const EDGE_MASK =
  "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)";

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
  className,
}: (typeof AUTH_TESTIMONIALS)[number] & { className?: string }) {
  return (
    <article
      className={cn(
        "w-[min(340px,78vw)] shrink-0 rounded-2xl border border-white/10 bg-white p-6 shadow-[0_16px_40px_rgba(0,0,0,0.3)] sm:w-[360px]",
        className,
      )}
    >
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

export function AuthTestimonialMarquee() {
  return (
    <div
      className="relative w-full overflow-hidden py-4"
      role="region"
      aria-label="Customer reviews"
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#040F20] via-[#040F20]/80 to-transparent sm:w-28"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#040F20] via-[#040F20]/80 to-transparent sm:w-28"
        aria-hidden
      />

      <div
        className="overflow-hidden"
        style={{
          maskImage: EDGE_MASK,
          WebkitMaskImage: EDGE_MASK,
        }}
      >
        <div className="flex w-max animate-auth-marquee gap-5 motion-reduce:animate-none hover:[animation-play-state:paused]">
          {MARQUEE_ITEMS.map((item, index) => (
            <TestimonialCard key={`${item.name}-${index}`} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
