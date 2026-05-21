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
    <article className="h-full rounded-2xl bg-white p-6 shadow-lg bg-white p-[20px] border-solid border-[#F57E3A] border-t-[0.2px] border-r-[0.2px] border-b-[0.2px] border-l-[2px] rounded-[15px]">
      <Stars />
      <p className="font-open-sans mt-4 text-[16px] font-normal leading-[1.6] text-[#7A7A7A]">
        {quote}
      </p>
      <div className="mt-[20px] flex items-center gap-3 md:mt-[30px] lg:mt-[30px]">
        <Image
          src={avatar}
          alt=""
          width={60}
          height={60}
          className="h-13 w-13 shrink-0 rounded-full object-cover"
        />
        <div>
          <p className="font-open-sans text-[20px] md:text-[22px] lg:text-[24px] font-bold text-[#000000]">
            {name}
          </p>  
          <p className="font-open-sans text-[16px] font-normal text-[#7A7A7A]">
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
    <section className="trusted-block w-full bg-[#040F20] py-16 md:py-16 lg:py-20">
      <div className="mx-auto max-w-[full] px-6 md:px-10 lg:px-14 md:!px-[0px]">
        <div className="grid items-center grid-cols-1 md:grid-cols-2 gap-[30px]">
          <div className="w-full lg:pt-0">
            <div className="grid-left-inner w-full max-w-full md:max-w-[624px] ml-auto">
            <h2 className="font-inter text-[28px] font-bold leading-tight text-white sm:text-[32px] md:text-[36px] lg:text-[40px] lg:leading-[50px] xl:text-[46px] xl:leading-[54px]">
              Trusted by Thousands. Avoid Unnecessary Delays
            </h2>
            <p className="font-inter mt-4 max-w-full text-[18px] font-normal leading-[1.6] text-white/80">
              Stay informed about DUI checkpoints and make smarter travel
              decisions across California.
            </p>
           </div>
          </div>

          <div className="w-full lg:-mr-6 xl:-mr-10">
            <div className="flex items-stretch gap-2 sm:gap-3">
              <button
                type="button"
                onClick={goPrev}
                disabled={activeIndex === 0}
                className="flex hidden  h-9 w-9 shrink-0 self-center items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2} />
              </button>

              <div className="min-w-0 flex-1 overflow-hidden">
                <div
                  className="trusted-right-box-slider flex transition-transform duration-500 ease-out"
                  style={{
                    transform: `translateX(-${activeIndex * cardWidthPercent}%)`,
                  }}
                >
                  {TESTIMONIALS.map((testimonial) => (
                    <div
                      key={testimonial.name}
                      className="box-border bordeer-box-trust-slide shrink-0 pr-4"
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
                className="flex hidden h-9 w-9 shrink-0 self-center items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <div className="mt-10 flex justify-center gap-2 lg:justify-start">
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

        <div className="mt-8 border-t border-white/10 pt-10 md:mt-10">
          <div className="four-logo flex flex-wrap items-center gap-6 md:gap-0 md:divide-x md:divide-white/15 mx-auto max-w-[1338px] px-6 md:px-10 lg:px-14">
            {PARTNER_LOGOS.map(({ src, alt }) => (
              <div
                key={src}
                className=" four-logo-inner-box flex items-center justify-center px-4 md:px-8 lg:px-[35px]"
              >
                <Image
                  src={src}
                  alt={alt}
                  width={160}
                  height={48}
                  className="h-auto w-full max-w-max object-contain opacity-90"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
