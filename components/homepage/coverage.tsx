import Image from "next/image";
import Link from "next/link";

const BULLETS = [
  "Real-time updates 24/7",
  "All counties covered",
  "Trusted by thousands of drivers",
  "Activate alerts in your area",
] as const;

export function Coverage() {
  return (
    <section className="relative w-full overflow-hidden pl-[24px] bg-[#040F20] md:pl-[40px] lg:pl-[56px]">
      <div className="grid lg:grid-cols-2">
        {/* Left — copy & CTAs */}
        <div className="relative z-10 flex flex-col justify-center !pl-[0px] px-6 py-16 md:px-10 md:py-20 lg:px-14 lg:py-24">
          <div className="calfornia-left-cil-inner-box w-full max-w-[479px] ml-auto"> 
          <span className="font-inter text-[16px] font-normal uppercase leading-6 text-[#F57E3A]">
            Statewide Coverage
          </span>

          <h3 className="font-inter mt-4 text-[28px] font-bold leading-[1.24] text-white sm:text-[32px] lg:text-[36px] lg:leading-[44.8px]">
            We Cover All of{" "}
            <span className="text-[#F57E3A]">California</span>
          </h3>

          <span className="font-inter mt-4 block max-w-md text-[18px] font-normal leading-[1.6] text-white">
            Stay informed with live DUI checkpoint data from across California.
          </span>

          <ul className="mt-8 space-y-4">
            {BULLETS.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <Image  
                  src="/tick.png"
                  alt=""
                  width={24}
                  height={24}
                  className="h-6 w-6 shrink-0"
                />
                <span className="font-inter text-[16px]  md:text-[18px]font-normal leading-[1.6] text-white">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-10  gap-[15px] flex flex-wrap items-center md:gap-[25px]">
            <Link
              href="#"
              className="transition-opacity hover:opacity-90"
              aria-label="Get it on Google Play"
            >
              <Image
                src="/googleplay.png"
                alt="Get it on Google Play"
                width={200}
                height={60}
                className="h-[60px] w-auto sm:h-[52px]"
              />
            </Link>

            <Link
              href="#"
              className="transition-opacity hover:opacity-90"
              aria-label="Download on the App Store"
            >
              <Image
                src="/appstore.png"
                alt="Download on the App Store"
                width={200}
                height={60}
                className="h-[60px] w-auto sm:h-[52px]"
              />
            </Link>
          </div>
        </div>
         </div>

        {/* Right — California map */}
        <div className="relative min-h-[320px] lg:min-h-[520px]">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#040F20] to-transparent lg:w-40"
            aria-hidden
          />
          <Image
            src="/map.png"
            alt="Map of California showing DUI checkpoint coverage"
            fill
            className="object-cover object-center lg:object-right"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
