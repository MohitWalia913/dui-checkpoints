import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-[#040F20]">
      <div className="mx-auto max-w-[1440px] px-6 py-14 md:px-10 md:py-16 lg:px-14">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {/* Logo & description */}
          <div className="max-w-sm">
            <Link href="/" className="inline-block">
              <Image
                src="/footerlogo.png"
                alt="DUI Checkpoint Locator — Statewide, Real-time Alerts"
                width={280}
                height={72}
                className="h-auto w-full max-w-[280px]"
              />
            </Link>
            <p className="font-inter mt-6 text-[18px] font-normal leading-[1.6] text-white">
              Real-Time DUI Checkpoints Locator Across California.
            </p>
          </div>

          {/* App links */}
          <div>
            <h3 className="font-inter text-[24px] font-semibold leading-[1.6] text-white">
              Coming Soon...
            </h3>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap lg:flex-col">
              <Link
                href="#"
                className="inline-block transition-opacity hover:opacity-90"
                aria-label="Get it on Google Play"
              >
                <Image
                  src="/googleplay.png"
                  alt="Get it on Google Play"
                  width={180}
                  height={54}
                  className="h-[48px] w-auto sm:h-[52px]"
                />
              </Link>
              <Link
                href="#"
                className="inline-block transition-opacity hover:opacity-90"
                aria-label="Download on the App Store"
              >
                <Image
                  src="/appstore.png"
                  alt="Download on the App Store"
                  width={180}
                  height={54}
                  className="h-[48px] w-auto sm:h-[52px]"
                />
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-inter text-[24px] font-semibold leading-[1.6] text-white">
              Contact Information
            </h3>
            <Link
              href="mailto:hello@californiaduicheckpoints.com"
              className="font-inter mt-6 inline-flex items-center gap-3 text-[18px] font-normal leading-[1.6] text-white underline underline-offset-4 transition-opacity hover:opacity-80"
            >
              <Image
                src="/mail.png"
                alt=""
                width={24}
                height={24}
                className="h-6 w-6 shrink-0"
              />
              hello@californiaduicheckpoints.com
            </Link>
          </div>
        </div>

        <div className="mt-12 border-t border-white/15 pt-8">
          <p className="font-inter text-center text-sm font-normal leading-normal text-white/80">
            © 2026 Meehan Law Firm. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
