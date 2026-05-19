"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const TESTIMONIALS = [
  {
    quote:
      "The app alerted me about a checkpoint ahead of time. I took a different route and avoided a DUI. It's a must-have for every driver in California.",
    name: "Jessica M",
    location: "Los Angeles, CA",
    avatar: "/Jessica.png",
  },
  {
    quote:
      "Meehan Law Firm is the best in the business. Their app gives peace of mind and their legal team delivers results.",
    name: "Michael T",
    location: "Riverside, CA",
    avatar: "/Michael.png",
  },
  {
    quote:
      "I had a DUI case and didn't know where to turn. The locator app and legal resources made everything clearer when I needed help most.",
    name: "David R",
    location: "San Diego, CA",
    avatar: "/person.png",
  },
] as const;

const PARTNER_LOGOS = [
  { src: "/nocuffs.png", alt: "1-800-NoCuffs" },
  { src: "/meehan.png", alt: "Meehan Law Firm" },
  { src: "/GOTaDUI.png", alt: "GOT A DUI — Instant DUI Help" },
  { src: "/calculator.png", alt: "BAC Calculator" },
] as const;

function Stars() {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Image
          key={i}
          src="/star.png"
          alt=""
          width={20}
          height={20}
          className="h-5 w-5"
        />
      ))}
    </div>
  );
}

function TestimonialCard({
  quote,
  name,
  location,
  avatar,
}: (typeof TESTIMONIALS)[number]) {
  return (
    <article className="h-full rounded-2xl bg-white p-6 shadow-lg">
      <Stars />
      <p className="font-inter mt-4 text-[15px] font-normal leading-[1.6] text-[#5C6573]">
        {quote}
      </p>
      <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-5">
        <Image
          src={avatar}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 rounded-full object-cover"
        />
        <div>
          <p className="font-inter text-base font-semibold text-[#040F20]">
            {name}
          </p>
          <p className="font-inter text-sm font-normal text-[#5C6573]">
            {location}
          </p>
        </div>
      </div>
    </article>
  );
}

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [peekView, setPeekView] = useState(1.15);

  const total = TESTIMONIALS.length;
  const maxIndex = Math.max(0, total - 1);
  const cardWidthPercent = 100 / peekView;

  useEffect(() => {
    const mqLg = window.matchMedia("(min-width: 1024px)");
    const mqMd = window.matchMedia("(min-width: 768px)");
    const update = () => {
      if (mqLg.matches) setPeekView(2.5);
      else if (mqMd.matches) setPeekView(1.5);
      else setPeekView(1.15);
    };
    update();
    mqLg.addEventListener("change", update);
    mqMd.addEventListener("change", update);
    return () => {
      mqLg.removeEventListener("change", update);
      mqMd.removeEventListener("change", update);
    };
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(Math.min(Math.max(index, 0), maxIndex));
    },
    [maxIndex],
  );

  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  return (
    <section className="w-full bg-[#040F20] py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,400px)_1fr] lg:gap-10 xl:gap-14">
          <div className="lg:pt-4">
            <h2 className="font-inter text-[32px] font-bold leading-tight text-white sm:text-[40px] lg:text-[48px] lg:leading-[56px]">
              Trusted by Thousands. Avoid Unnecessary Delays
            </h2>
            <p className="font-inter mt-4 max-w-md text-[18px] font-normal leading-[1.6] text-white/70">
              Stay informed about DUI checkpoints and make smarter travel
              decisions across California.
            </p>
          </div>

          <div className="min-w-0 lg:-mr-6 xl:-mr-10">
            <div className="flex items-stretch gap-2 sm:gap-3">
              <button
                type="button"
                onClick={goPrev}
                disabled={activeIndex === 0}
                className="flex h-9 w-9 shrink-0 self-center items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2} />
              </button>

              <div className="min-w-0 flex-1 overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{
                    transform: `translateX(-${activeIndex * cardWidthPercent}%)`,
                  }}
                >
                  {TESTIMONIALS.map((testimonial) => (
                    <div
                      key={testimonial.name}
                      className="box-border shrink-0 pr-4"
                      style={{ width: `${cardWidthPercent}%` }}
                    >
                      <TestimonialCard {...testimonial} />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={goNext}
                disabled={activeIndex >= maxIndex}
                className="flex h-9 w-9 shrink-0 self-center items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <div className="mt-6 flex justify-center gap-2 lg:justify-start">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  className={`h-2.5 rounded-full transition-all ${
                    i === activeIndex
                      ? "w-6 bg-[#F57E3A]"
                      : "w-2.5 bg-white/30 hover:bg-white/50"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === activeIndex ? "true" : undefined}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-10 md:mt-16">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-0 md:divide-x md:divide-white/15">
            {PARTNER_LOGOS.map(({ src, alt }) => (
              <div
                key={src}
                className="flex items-center justify-center px-4 md:px-8 lg:px-12"
              >
                <Image
                  src={src}
                  alt={alt}
                  width={160}
                  height={48}
                  className="h-10 w-auto max-w-[140px] object-contain opacity-90 sm:h-12 sm:max-w-[160px] lg:max-w-[180px]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
