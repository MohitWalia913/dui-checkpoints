"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function WebBrowserCta({ className = "" }: { className?: string }) {
  const pathname = usePathname();

  return (
    <Link
      href="/#view-map"
      onClick={(event) => {
        if (pathname !== "/") return;
        event.preventDefault();
        document
          .getElementById("view-map")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
      className={`hover-window group font-inter mt-8 inline-flex items-center gap-3 rounded-[10px] border border-black bg-white px-5 py-2.5 text-[#242E4E] shadow-[0_2px_10px_rgba(0,0,0,0.15)] transition-all hover:border-[#F57E3A] hover:text-white ${className}`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-visible px-0.5 pt-1.5">
        <Image
          src="/browser.png"
          alt=""
          width={36}
          height={36}
          className="h-8 w-8 object-contain object-top brightness-0 transition-[filter] group-hover:invert"
          aria-hidden
        />
      </span>
      <span className="text-base font-semibold leading-none md:text-lg">
        Web Browser
      </span>
    </Link>
  );
}
