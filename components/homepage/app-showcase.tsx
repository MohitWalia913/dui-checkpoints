"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Monitor } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const PHONE_SLIDES = [
  { src: "/one.png", alt: "DUI Checkpoints Locator splash screen" },
  { src: "/two.png", alt: "DUI Checkpoints Locator list view" },
  { src: "/three.png", alt: "DUI Checkpoints Locator locations" },
  { src: "/four.png", alt: "DUI Checkpoints Locator map view" },
  { src: "/five.png", alt: "DUI Checkpoints Locator app screen" },
] as const;

// Responsive visible slides
const getVisibleSlides = (width: number) => {
  if (width <= 480) return 1;
  if (width <= 599) return 2;
  if (width <= 767) return 3;
  if (width <= 1024) return 3;
  return 5;
};

const getSlideStepPercent = (visible: number) => {
  return 100 / visible;
};
  

export function AppShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleSlides, setVisibleSlides] = useState(3);
  const total = PHONE_SLIDES.length;
  // Always allow sliding, even if all slides are visible (for demo/UX)
  const maxIndex = total - visibleSlides >= 0 ? total - visibleSlides : 0;

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      setVisibleSlides(getVisibleSlides(width));
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setActiveIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(Math.min(Math.max(index, 0), maxIndex));
    },
    [maxIndex],
  );

  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  return (
    <section className="w-full bg-[#F5F6F8] py-16 md:py-16 lg:py-20">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-14">
        <div className="flex items-center flex-col gap-12 md:flex-row lg:gap-10 xl:gap-16 justify-between">
          <div className="max-w-[100%] w-full md:max-w-[50%] lg:max-w-[415px]">
            <h3 className="max-w-[347px] w-full font-inter text-[28px] font-bold leading-[1.24] text-[#242E4E] md:text-[32px] lg:text-[36px] lg:leading-[44.8px]">
              The App That Keeps You Ahead
            </h3>
            <p className="font-inter mt-4 text-[16px] md:text-[18px] font-normal leading-[1.6] text-[#242E4E]">
              Real-time information. Legal protection. Total peace of mind.
            </p>
            <Link
              href="/map"
              className="hover-window font-inter mt-8 inline-flex items-center gap-4 rounded-[10px] border border-white/10 bg-black px-6 py-3.5 text-white transition-opacity hover:opacity-90"
            >
              <Monitor
                className="h-8 w-8 shrink-0 stroke-[1.5]"
                aria-hidden
              />
              <span className="flex flex-col text-left leading-tight">
                <span className="text-[16px] font-normal leading-5">Use On</span>
                <span className="text-[18px] mt-[8px] font-semibold leading-6 md:text-[25px]">
                  Web Browser
                </span>
              </span>
            </Link>
          </div>

          <div className="relative  lg:max-w-[100%] w-full  md:max-w-[50%] lg:max-w-[785px]">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={goPrev}
                disabled={activeIndex === 0}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(36,46,78,0.3)] text-[#242E4E] transition-colors hover:bg-[#B8BEC7] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2} />
              </button>

              <div className="relative min-w-0 flex-1 overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{
                    transform: `translateX(-${activeIndex * (100 / visibleSlides)}%)`,
                  }}
                >
                  {PHONE_SLIDES.map(({ src, alt }, i) => (
                    <div
                      key={src}
                      className="flex w-full shrink-0 justify-center px-2"
                      style={{
                        maxWidth:
                          visibleSlides === 1
                            ? '100%'
                            : visibleSlides === 2
                            ? '25%'
                            : visibleSlides === 3
                            ? '33.33%'
                            : visibleSlides === 5
                            ? '20%'
                            : '20.33%'
                      }}
                    >
                      <Image
                        src={src}
                        alt={alt}
                        width={220}
                        height={440}
                        className={`h-auto w-auto max-w-[200px] object-contain lg:max-h-[400px] lg:w-full lg:max-w-[180px] ${
                          i >= activeIndex &&
                          i < activeIndex + visibleSlides
                            ? "opacity-100"
                            : "opacity-60"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={goNext}
                disabled={activeIndex >= maxIndex}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(36,46,78,0.3)] text-[#242E4E] transition-colors hover:bg-[#B8BEC7] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <div className="mt-6 flex justify-center gap-2">
              {PHONE_SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(Math.min(i, maxIndex))}
                  className={`h-2.5 rounded-full transition-all ${
                    i === activeIndex
                      ? "w-6 bg-[#F57E3A]"
                      : "w-2.5 bg-[#F57E3A]/35 hover:bg-[#F57E3A]/55"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === activeIndex ? "true" : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
