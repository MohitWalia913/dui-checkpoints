"use client";

import { setOnboardingComplete, isOnboardingComplete } from "@/lib/dashboard/onboarding-storage";
import { cn } from "@/lib/utils";
import {
  Bell,
  Check,
  ChevronRight,
  MapPin,
  Shield,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import logo from "@/app/logo.png";

const STEPS = [
  {
    id: 1,
    title: "Stay informed",
    description:
      "Get real-time updates on DUI checkpoints across California. Plan your route and make safer decisions.",
    icon: MapPin,
  },
  {
    id: 2,
    title: "Never miss an alert",
    description:
      "View upcoming checkpoints on an interactive map or browse the list. Save important ones for quick access from your dashboard.",
    icon: Bell,
  },
  {
    id: 3,
    title: "Know your rights",
    description:
      "Learn about your legal rights during a DUI stop and what penalties you might face. Stay informed, stay safe.",
    icon: Shield,
  },
] as const;

export function DashboardOnboarding({ userEmail }: { userEmail: string }) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (!userEmail) return;
    setVisible(!isOnboardingComplete(userEmail));
  }, [userEmail]);

  const finish = useCallback(() => {
    setOnboardingComplete(userEmail);
    setVisible(false);
  }, [userEmail]);

  const skip = useCallback(() => {
    finish();
  }, [finish]);

  if (!mounted || !visible) return null;

  const step = STEPS[stepIndex];
  const Icon = step.icon;
  const isLast = stepIndex === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[30000] flex flex-col bg-[#040F20]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 top-0 h-80 w-80 rounded-full bg-[#F57E3A]/10 blur-[100px]" />
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-[#F57E3A]/8 blur-[90px]" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={finish}>
          <Image
            src={logo}
            alt="DUI Checkpoints Locator"
            className="h-8 w-auto max-w-[180px] object-contain object-left"
            priority
          />
        </Link>
        <button
          type="button"
          onClick={skip}
          className="font-montserrat text-sm font-semibold text-white/70 transition-colors hover:text-white"
        >
          Skip
        </button>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-10 sm:px-10">
        <div
          key={stepIndex}
          className={cn("w-full max-w-md text-center transition-all duration-500 ease-out")}
        >
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-lg backdrop-blur-sm sm:h-28 sm:w-28">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F57E3A]/15 sm:h-[72px] sm:w-[72px]">
              <Icon className="size-9 text-[#F57E3A] sm:size-10" strokeWidth={1.5} aria-hidden />
            </div>
          </div>

          <h1
            id="onboarding-title"
            className="font-montserrat text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            {step.title}
          </h1>
          <p className="font-inter mx-auto mt-4 max-w-md text-base leading-relaxed text-white/75">
            {step.description}
          </p>
        </div>

        <div className="mt-12 flex w-full max-w-md flex-col items-center gap-8">
          <div className="flex items-center gap-2" role="tablist" aria-label="Onboarding progress">
            {STEPS.map((s, i) => (
              <span
                key={s.id}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === stepIndex
                    ? "w-8 bg-white"
                    : "w-2 bg-white/25 hover:bg-white/40",
                )}
                aria-current={i === stepIndex ? "step" : undefined}
              />
            ))}
          </div>

          {isLast ? (
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={finish}
                className="font-montserrat inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white px-6 text-sm font-bold text-[#040F20] transition-transform hover:scale-[1.02] active:scale-[0.99] sm:flex-initial sm:min-w-[200px]"
              >
                <Check className="size-5" aria-hidden />
                Get started
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1))}
              className="font-montserrat flex h-12 w-full max-w-xs items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-[#F57E3A]/40 hover:bg-white/10"
            >
              Continue
              <ChevronRight className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
