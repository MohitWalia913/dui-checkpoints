import Image from "next/image";
import Link from "next/link";
import { Monitor } from "lucide-react";

function CaliforniaGlow() {
  return (
    <svg
      className="pointer-events-none absolute left-[42%] top-1/2 z-[1] h-[88%] w-auto max-h-[500px] -translate-x-1/2 -translate-y-1/2 text-[#F57E3A] opacity-90 lg:left-[48%] lg:max-h-[540px]"
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
      {/* Full-width city background */}
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
        <div className="banner-row grid items-center grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-2 lg:gap-8 xl:gap-12">
          {/* Left — copy & CTA */}
          <div className="max-w-xl lg:py-4">
            <p className="font-inter text-[16px] font-normal uppercase leading-6 text-[#F57E3A]">
              DUI checkpoint data updated every 24 hours
            </p>

            <h1 className="font-inter w-full max-w-[482px] mt-4 text-[32px] font-semibold leading-[1.2] text-white  sm:text-[36px]  lg:text-[40px] lg:text-[48px]">
              <span className=" text-white">California DUI</span>
              <span className="text-[#F57E3A]">
                Checkpoints Locator Map
              </span>
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
                <span className="text-[18px] mt-[8px] font-semibold leading-6 md:text-[25px]">
                  Web Browser
                </span>
              </span>
            </Link>
          </div>

          {/* Right — map bg + CA glow + mockups */}
          <div className="image-box-banner relative mx-auto h-[380px] w-full max-w-[600px] sm:h-[440px] lg:mx-0 lg:ml-auto lg:h-[520px] lg:max-w-[680px]">
            {/* Map texture behind mockups */}
     

            <div
              className="pointer-events-none absolute left-1/2 top-1/2 z-[1] h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F57E3A]/25 blur-[70px] lg:h-[380px] lg:w-[380px]"
              aria-hidden
            />
            <CaliforniaGlow />

            {/* Device mockups — phone left & up, legal right & down */}
            <div className="md:absolute inset-0 z-10 flex items-end justify-center pb-2 lg:justify-end lg:pb-0">
              <div className="relative flex gap-[33px] w-full max-w-[668px] items-end justify-center lg:justify-end">
                <div className="relative">
                  <Image
                    src="/bgphone.png"
                    alt="DUI Checkpoints Locator map app on mobile"
                    width={340}
                    height={680}
                    priority
                    className="h-auto w-full drop-shadow-[0_28px_56px_rgba(0,0,0,0.5)]"
                  />
                </div>

                <div className="relative">
                  <Image
                    src="/bglegal.png"
                    alt="Legal information and DUI help resources"
                    width={290}
                    height={480}
                    priority
                    className="h-auto w-full drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
