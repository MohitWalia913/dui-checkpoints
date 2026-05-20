"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LEGAL_FIRM_NAME,
  LEGAL_HELP_PHONE_DISPLAY,
  legalHelpTelHref,
} from "@/lib/dashboard/help-constants";
import { cn } from "@/lib/utils";
import { Car, Phone, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const UBER_URL = "https://m.uber.com/ul/";
const LYFT_URL = "https://ride.lyft.com/";

export function SidebarHelpCtas() {
  const [duiOpen, setDuiOpen] = useState(false);
  const [rideOpen, setRideOpen] = useState(false);
  const tel = legalHelpTelHref();

  return (
    <>
      <div className="flex flex-col gap-2 px-2 pb-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
        <p className="font-montserrat px-2 text-[10px] font-semibold uppercase tracking-wider text-white/45 group-data-[collapsible=icon]:hidden">
          Quick help
        </p>
        <button
          type="button"
          onClick={() => setDuiOpen(true)}
          className={cn(
            "font-montserrat flex w-full items-stretch gap-0 overflow-hidden rounded-xl text-left transition-all duration-200",
            "border border-[#F57E3A]/40 bg-[#F57E3A] hover:brightness-105 active:scale-[0.99]",
            "group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0",
          )}
          aria-label="Find a DUI — speak with a lawyer"
        >
          <span className="flex w-11 shrink-0 items-center justify-center bg-[#040F20]/25 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:bg-transparent">
            <Phone className="size-4 text-white" aria-hidden />
          </span>
          <span className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 py-2.5 pr-3 pl-2 group-data-[collapsible=icon]:hidden">
            <span className="text-[10px] font-medium leading-tight text-white/90">
              Call us now to speak with a lawyer
            </span>
            <span className="text-sm font-bold leading-tight text-white">
              Got a DUI?
            </span>
            <span className="text-[10px] font-medium text-white/85">
              Call us anytime 24/7
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setRideOpen(true)}
          className={cn(
            "font-montserrat flex w-full items-stretch gap-0 overflow-hidden rounded-xl text-left transition-all duration-200",
            "border border-white/15 bg-[#0a1628] hover:border-[#F57E3A]/35 hover:bg-[#0d1a30]",
            "group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0",
          )}
          aria-label="Find a ride — Uber or Lyft"
        >
          <span className="flex w-11 shrink-0 items-center justify-center bg-[#F57E3A] group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:bg-[#F57E3A]/90">
            <Car className="size-4 text-white" aria-hidden />
          </span>
          <span className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 py-2.5 pr-3 pl-2 group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold leading-tight text-[#F57E3A]">
              Find a ride
            </span>
            <span className="text-[10px] font-medium text-white/65">
              Open Uber or Lyft
            </span>
          </span>
        </button>
      </div>

      <Dialog open={duiOpen} onOpenChange={setDuiOpen}>
        <DialogContent className="z-[20001] border-white/10 bg-[#0a1628] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Got a DUI?</DialogTitle>
            <DialogDescription className="text-white/65">
              Speak with an attorney at {LEGAL_FIRM_NAME}. Available 24/7 for
              urgent matters.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="font-inter text-sm leading-relaxed text-white/75">
              If you&apos;ve been arrested or charged, do not delay. A qualified
              DUI lawyer can protect your license, challenge evidence, and
              explain your options.
            </p>
            {tel ? (
              <a
                href={tel}
                className="font-montserrat flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F57E3A] text-sm font-bold text-white transition-opacity hover:opacity-95"
              >
                <Phone className="size-4" aria-hidden />
                Call {LEGAL_FIRM_NAME}
              </a>
            ) : (
              <p className="font-inter rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                Set{" "}
                <code className="rounded bg-black/20 px-1 text-xs">
                  NEXT_PUBLIC_LEGAL_HELP_PHONE
                </code>{" "}
                in your environment to enable calling.
              </p>
            )}
            {LEGAL_HELP_PHONE_DISPLAY ? (
              <p className="font-montserrat text-center text-sm text-white/50">
                {LEGAL_HELP_PHONE_DISPLAY}
              </p>
            ) : null}
            <Link
              href="/dashboard/legal"
              className="font-montserrat block text-center text-sm font-semibold text-[#F57E3A] hover:underline"
              onClick={() => setDuiOpen(false)}
            >
              Read legal information →
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={rideOpen} onOpenChange={setRideOpen}>
        <DialogContent className="z-[20001] border-white/10 bg-[#0a1628] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Users className="size-5 text-[#F57E3A]" aria-hidden />
              Find a ride
            </DialogTitle>
            <DialogDescription className="text-white/65">
              Open Uber or Lyft in a new tab to request a safe ride home.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={UBER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-montserrat flex flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-black px-4 py-4 text-center text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.99]"
            >
              <span className="text-lg tracking-tight">Uber</span>
              <span className="text-xs font-medium text-white/70">Open app</span>
            </a>
            <a
              href={LYFT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-montserrat flex flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-[#FF00BF] px-4 py-4 text-center text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.99]"
            >
              <span className="text-lg tracking-tight">Lyft</span>
              <span className="text-xs font-medium text-white/90">Open app</span>
            </a>
          </div>
          <p className="font-inter text-center text-xs text-white/45">
            You will leave DUI Checkpoints Locator. Uber and Lyft are
            third-party services.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
