"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  LEGAL_FIRM_NAME,
  LEGAL_HELP_PHONE_DISPLAY,
  legalHelpTelHref,
} from "@/lib/dashboard/help-constants";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Car,
  ChevronDown,
  Phone,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const SECTIONS = [
  {
    id: "next",
    title: "What to do next",
    icon: Shield,
    iconBg: "bg-[#F57E3A]/15 text-[#F57E3A]",
    body: (
      <>
        <p>
          If you are stopped at a checkpoint, remain calm and polite. You may
          decline field sobriety tests in many situations, but laws vary — this
          app is not legal advice. When in doubt, invoke your right to speak with
          an attorney before answering substantive questions.
        </p>
        <p className="mt-3">
          Keep your license, registration, and insurance accessible. Note the
          location, agency name, and time of the stop for your records.
        </p>
      </>
    ),
  },
  {
    id: "avoid",
    title: "What not to do or say",
    icon: AlertTriangle,
    iconBg: "bg-[#F57E3A]/15 text-[#F57E3A]",
    body: (
      <>
        <p>
          Do not argue aggressively with officers, flee, or refuse a lawful
          chemical test without understanding your state&apos;s implied consent
          rules — penalties can include license suspension.
        </p>
        <p className="mt-3">
          Avoid volunteering unnecessary information. Do not admit to drinking
          or using substances without speaking to counsel.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    title: "Know your rights",
    icon: Car,
    iconBg: "bg-emerald-500/15 text-emerald-300",
    body: (
      <>
        <p>
          You have the right to remain silent and the right to an attorney. You
          may ask if you are free to leave. Checkpoints must follow constitutional
          guidelines; if you believe your rights were violated, document details
          and contact qualified legal counsel promptly.
        </p>
        <p className="mt-3">
          Educational summary only — not a substitute for advice from{" "}
          {LEGAL_FIRM_NAME} or another licensed attorney in your jurisdiction.
        </p>
      </>
    ),
  },
] as const;

export function LegalPageContent() {
  const [openId, setOpenId] = useState<string | null>("next");
  const tel = legalHelpTelHref();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6 md:p-8">
      <header>
        <p className="font-montserrat text-sm font-semibold uppercase tracking-wider text-[#F57E3A]">
          Resources
        </p>
        <h1 className="font-montserrat mt-2 text-3xl font-bold text-white md:text-4xl">
          Legal information
        </h1>
        <p className="font-inter mt-3 text-base leading-relaxed text-white/70">
          Important information about DUI stops, penalties, and staying safe.
          Tap a topic below to expand. This content is educational, not legal
          advice.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isOpen = openId === section.id;

          return (
            <Collapsible
              key={section.id}
              open={isOpen}
              onOpenChange={(open) => setOpenId(open ? section.id : null)}
            >
              <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-sm backdrop-blur-sm transition-colors hover:border-white/15">
                <CollapsibleTrigger
                  className={cn(
                    "font-montserrat flex w-full items-center gap-4 px-4 py-4 text-left text-base font-semibold text-white transition-colors",
                    "hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F57E3A]/50",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-lg",
                      section.iconBg,
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="flex-1">{section.title}</span>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-white/50 transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                    aria-hidden
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden">
                  <div className="font-inter border-t border-white/10 px-4 pb-4 pt-2 text-sm leading-relaxed text-white/75">
                    {section.body}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-xl md:p-8">
        <h2 className="font-montserrat text-xl font-bold text-white">
          Need legal help?
        </h2>
        <p className="font-inter mt-3 text-sm leading-relaxed text-white/75">
          If you&apos;ve been arrested for DUI, contact{" "}
          <span className="font-semibold text-white">{LEGAL_FIRM_NAME}</span>{" "}
          immediately for expert legal representation.
        </p>
        {tel ? (
          <a
            href={tel}
            className="font-montserrat mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F57E3A] text-sm font-bold text-white transition-opacity hover:opacity-95 sm:inline-flex sm:w-auto sm:min-w-[240px] sm:px-8"
          >
            <Phone className="size-4" aria-hidden />
            Contact {LEGAL_FIRM_NAME}
          </a>
        ) : (
          <p className="font-inter mt-4 text-sm text-amber-200/90">
            Add{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
              NEXT_PUBLIC_LEGAL_HELP_PHONE
            </code>{" "}
            to enable the call button.
          </p>
        )}
        {LEGAL_HELP_PHONE_DISPLAY ? (
          <p className="font-montserrat mt-3 text-sm text-white/50">
            {LEGAL_HELP_PHONE_DISPLAY}
          </p>
        ) : null}
        <p className="font-inter mt-6 text-xs text-white/45">
          Prefer the app flow? Use{" "}
          <Link href="/dashboard" className="font-semibold text-[#F57E3A] hover:underline">
            Find a DUI
          </Link>{" "}
          in the sidebar for quick access to counsel.
        </p>
      </section>
    </div>
  );
}
