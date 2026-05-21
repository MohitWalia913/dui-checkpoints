import Image from "next/image";
import Link from "next/link";
import { Monitor } from "lucide-react";

function CaliforniaGlow() {
  return (
    <svg
      className="pointer-events-none absolute left-1/2 top-[46%] z-[1] h-[min(88%,520px)] w-auto max-h-[520px] -translate-x-1/2 -translate-y-1/2 text-[#F57E3A] opacity-90"
      viewBox="0 0 100 160"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <path
        d="M62 4c6 2 10 8 12 16 2 10 2 20 0 30-2 12-6 24-10 34-4 10-10 20-18 28-6 6-14 10-22 10-8 0-16-2-22-8-6-6-10-14-14-24-3-10-5-22-4-34 1-14 5-28 12-40 6-10 16-18 28-22 4-1 8-1 12 0 3 1 6 2 8 4z"
        stroke="currentColor"
        strokeWidth="1.5"
        style={{
          filter:
            "drop-shadow(0 0 6px #F57E3A) drop-shadow(0 0 18px rgba(245,126,58,0.55))",
        }}
      />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="banner-main relative w-full overflow-hidden bg-[#040F20]">
      <Image
        src="/herobg.png"
        alt=""
        fill
        priority
        className="object-cover object-[70%_center] lg:object-right"
        sizes="100vw"
      />
      <div
        className="text-box absolute inset-0 bg-gradient-to-r from-[#040F20] from-0% via-[#040F20]/92 via-42% to-[#040F20]/20 to-100%"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 py-12 md:px-10 md:py-16 lg:px-14 lg:py-20">
        <div className="banner-row grid grid-cols-1 items-center gap-12 md:grid-cols-2 lg:grid-cols-2 lg:gap-8 xl:gap-12">
          <div className="max-w-xl lg:py-4">
            <p className="font-inter text-[16px] font-normal uppercase leading-6 text-[#F57E3A]">
              DUI checkpoint data updated every 24 hours
            </p>

            <h1 className="font-inter mt-4 w-full max-w-[482px] text-[32px] font-semibold leading-[1.2] text-white sm:text-[36px] lg:text-[40px] lg:text-[48px]">
              <span className="text-white">California DUI</span>
              <span className="text-[#F57E3A]">Checkpoints Locator Map</span>
              <span className="text-white">&amp; Real-Time Database</span>
            </h1>

            <p className="font-inter mt-6 max-w-lg text-[18px] font-normal leading-[1.6] text-white">
              Stay informed with real-time DUI checkpoints and incident mapping
              across California.
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
                <span className="mt-[8px] text-[18px] font-semibold leading-6 md:text-[25px]">
                  Web Browser
                </span>
              </span>
            </Link>
          </div>

          {/* Right — CA glow + overlapping mockups (Figma proportions) */}
          <div className="image-box-banner relative mx-auto h-[400px] w-full max-w-[560px] sm:h-[460px] lg:mx-0 lg:ml-auto lg:h-[540px] lg:max-w-[620px]">
            <div
              className="pointer-events-none absolute left-1/2 top-[46%] z-[1] h-[min(72%,380px)] w-[min(72%,380px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F57E3A]/25 blur-[70px] lg:h-[400px] lg:w-[400px]"
              aria-hidden
            />
            <CaliforniaGlow />

            <div className="absolute inset-0 z-10 flex items-center justify-center lg:justify-end">
              <div className="relative h-[360px] w-[min(100%,500px)] sm:h-[400px] sm:w-[520px] lg:h-[480px] lg:w-[560px]">
                {/* Legal card — smaller, behind, bottom-right overlap */}
                <Image
                  src="/bglegal.png"
                  alt="Legal information and DUI help resources"
                  width={232}
                  height={384}
                  priority
                  className="absolute bottom-4 right-0 z-10 h-auto w-[46%] min-w-[168px] max-w-[232px] drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)] sm:bottom-6 sm:w-[44%] lg:bottom-8 lg:max-w-[238px]"
                />

                {/* Phone — primary, larger, front-left */}
                <Image
                  src="/bgphone.png"
                  alt="DUI Checkpoints Locator map app on mobile"
                  width={355}
                  height={710}
                  priority
                  className="absolute bottom-0 left-0 z-20 h-auto w-[68%] min-w-[220px] max-w-[355px] drop-shadow-[0_28px_56px_rgba(0,0,0,0.5)] sm:w-[66%] lg:max-w-[360px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
