"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import logo from "@/app/logo.png";

type NavLink =
  | {
      kind: "page";
      href: string;
      label: string;
    }
  | {
      kind: "section";
      href: string;
      sectionId: string;
      label: string;
    };

const NAV_LINKS: NavLink[] = [
  {
    kind: "section",
    href: "/#view-map",
    sectionId: "view-map",
    label: "View Checkpoints",
  },
  {
    kind: "section",
    href: "/#report-checkpoint",
    sectionId: "report-checkpoint",
    label: "Report Checkpoints",
  },
];

function scrollToSection(sectionId: string) {
  const target = document.getElementById(sectionId);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSectionNav = (
    event: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    if (pathname !== "/") return;
    event.preventDefault();
    scrollToSection(sectionId);
    setMenuOpen(false);
  };

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (pathname !== "/") return;
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    requestAnimationFrame(() => scrollToSection(hash));
  }, [pathname]);

  return (
    <header className="relative z-50 w-full bg-[#040F20]">
      <div className="main-header-inner-row mx-auto flex h-[72px] max-w-[1338px] items-center justify-between px-6 md:px-10 lg:h-[80px] lg:px-14">
        <Link href="/" className="logo-img-box relative shrink-0" onClick={() => setMenuOpen(false)}>
          <Image
            src={logo}
            alt="DUI Checkpoints Locator — Statewide, Real-time Alerts"
            priority
            className="h-[44px] w-auto md:h-[52px] lg:h-[57px]"
          />
        </Link>

        {/* Desktop navigation */}
        <div className="nav-containerarapper hidden items-center gap-10 lg:flex">
          <nav
            className="flex items-center gap-[20px] xl:gap-[40px]"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(event) =>
                  item.kind === "section"
                    ? handleSectionNav(event, item.sectionId)
                    : setMenuOpen(false)
                }
                className="font-montserrat text-[14px] font-medium leading-[22px] text-white transition-opacity hover:opacity-80"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="two-btn flex items-center gap-[15px]">
            <Link
              href="/auth/login"
              className="same-btn"
            >
              Login
            </Link>
            <Link
              href="/auth/sign-up"
              className="same-btn same-ext-btn"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Mobile: CTA + hamburger */}
        <div className="flex items-center gap-3 lg:hidden">
          <Link
            href="/auth/sign-up"
            className=" hidden font-inter inline-flex items-center justify-center bg-[#F57E3A] px-4 py-2 text-base font-medium leading-4 text-white sm:px-5 sm:py-2.5 sm:text-[18px]"
          >
            Get Started
          </Link>

          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
            <span
              className={`absolute block h-[2px] w-6 bg-white transition-all duration-300 ease-in-out ${
                menuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-[11px]"
              }`}
            />
            <span
              className={`absolute top-1/2 block h-[2px] w-6 -translate-y-1/2 bg-white transition-all duration-300 ease-in-out ${
                menuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute block h-[2px] w-6 bg-white transition-all duration-300 ease-in-out ${
                menuOpen ? "bottom-1/2 translate-y-1/2 -rotate-45" : "bottom-[11px]"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 top-[72px] z-40 bg-[#040F20] transition-all duration-300 ease-in-out lg:hidden ${
          menuOpen
            ? "visible opacity-100"
            : "pointer-events-none invisible opacity-0"
        }`}
        aria-hidden={!menuOpen}
      >
        <nav
          className="flex flex-col gap-1 px-6 pt-6 md:px-10"
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-montserrat border-b border-white/10 py-4 text-sm font-medium leading-[22px] text-white"
              onClick={(event) => {
                if (item.kind === "section") {
                  handleSectionNav(event, item.sectionId);
                }
                setMenuOpen(false);
              }}
            >
              {item.label}
            </Link>
          ))}

          <div className="two-btn mt-8 flex flex-col gap-4">
            <Link
              href="/auth/login"
              className="same-btn  font-inter inline-flex w-full items-center justify-center border border-white px-[25px] py-[10px] text-[20.8px] font-medium leading-4 text-white"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/auth/sign-up"
              className="same-btn  same-ext-btn font-inter inline-flex w-full items-center justify-center bg-[#F57E3A] px-[25px] py-[10px] text-[20.8px] font-medium leading-4 text-white"
              onClick={() => setMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}