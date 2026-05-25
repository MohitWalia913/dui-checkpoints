"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

function displayName(user: SupabaseUser): string {
  const meta = user.user_metadata as { full_name?: string; name?: string };
  const fromMeta = meta?.full_name ?? meta?.name;
  if (fromMeta && String(fromMeta).trim()) return String(fromMeta).trim();
  const email = user.email ?? "";
  return email.split("@")[0] || "Account";
}

const profileMenuItemClass =
  "cursor-pointer gap-2 text-white focus:!bg-[#F57E3A]/15 focus:!text-white data-[highlighted]:!bg-[#F57E3A]/15 data-[highlighted]:!text-white [&_svg]:text-[#F57E3A]";

type HeaderAuthActionsProps = {
  layout?: "desktop" | "mobile" | "mobile-bar";
  onNavigate?: () => void;
};

export function HeaderAuthActions({
  layout = "desktop",
  onNavigate,
}: HeaderAuthActionsProps) {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    onNavigate?.();
    router.push("/auth/login");
  };

  if (!ready) {
    return (
      <div
        className={cn(
          layout === "mobile" && "mt-8 h-[88px]",
          layout === "desktop" && "h-[41px] w-[200px]",
          layout === "mobile-bar" && "h-9 w-20",
        )}
        aria-hidden
      />
    );
  }

  if (!user) {
    if (layout === "mobile") {
      return (
        <div className="two-btn mt-8 flex flex-col gap-4">
          <Link
            href="/auth/login"
            className="same-btn font-inter inline-flex w-full items-center justify-center border border-white px-[25px] py-[10px] text-[20.8px] font-medium leading-4 text-white"
            onClick={onNavigate}
          >
            Login
          </Link>
          <Link
            href="/auth/sign-up"
            className="same-btn same-ext-btn font-inter inline-flex w-full items-center justify-center bg-[#F57E3A] px-[25px] py-[10px] text-[20.8px] font-medium leading-4 text-white"
            onClick={onNavigate}
          >
            Get Started
          </Link>
        </div>
      );
    }

    if (layout === "mobile-bar") {
      return (
        <Link
          href="/auth/sign-up"
          className="font-inter inline-flex items-center justify-center bg-[#F57E3A] px-4 py-2 text-base font-medium leading-4 text-white sm:px-5 sm:py-2.5 sm:text-[18px]"
        >
          Get Started
        </Link>
      );
    }

    return (
      <div className="two-btn flex items-center gap-[15px]">
        <Link href="/auth/login" className="same-btn">
          Login
        </Link>
        <Link href="/auth/sign-up" className="same-btn same-ext-btn">
          Get Started
        </Link>
      </div>
    );
  }

  if (layout === "mobile-bar") {
    return (
      <Link
        href="/dashboard"
        className="font-inter inline-flex items-center justify-center rounded border border-[#F57E3A] bg-[#F57E3A] px-4 py-2 text-sm font-medium text-white"
      >
        Dashboard
      </Link>
    );
  }

  if (layout === "mobile") {
    return (
      <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6">
        <Link
          href="/dashboard"
          className="same-btn same-ext-btn font-inter inline-flex w-full items-center justify-center bg-[#F57E3A] px-[25px] py-[10px] text-[20.8px] font-medium leading-4 text-white"
          onClick={onNavigate}
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard"
          className="font-montserrat flex items-center gap-2 py-3 text-sm font-medium text-white"
          onClick={onNavigate}
        >
          <User className="size-4 text-[#F57E3A]" aria-hidden />
          My Profile
        </Link>
        <button
          type="button"
          onClick={() => void logout()}
          className="font-montserrat flex items-center gap-2 py-3 text-left text-sm font-medium text-white/80"
        >
          <LogOut className="size-4 text-[#F57E3A]" aria-hidden />
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="two-btn flex items-center gap-[15px]">
      <Link href="/dashboard" className="same-btn same-ext-btn">
        Dashboard
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="same-btn header-profile-btn shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#F57E3A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#040F20]"
          aria-label="Profile menu"
        >
          <User
            className="pointer-events-none shrink-0 text-white"
            size={22}
            strokeWidth={2}
            aria-hidden
          />
          <span className="sr-only">Profile</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="min-w-[180px] rounded-lg border border-white/10 bg-[#0a1628] font-montserrat text-white"
        >
          <div className="border-b border-white/10 px-3 py-2">
            <p className="truncate text-xs font-semibold text-white">
              {displayName(user)}
            </p>
            {user.email ? (
              <p className="truncate text-[11px] text-white/55">{user.email}</p>
            ) : null}
          </div>
          <DropdownMenuItem
            className={profileMenuItemClass}
            onSelect={() => {
              onNavigate?.();
              router.push("/dashboard/settings");
            }}
          >
            <User className="text-[#F57E3A]" aria-hidden />
            My Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem
            className={profileMenuItemClass}
            onSelect={() => void logout()}
          >
            <LogOut className="text-[#F57E3A]" aria-hidden />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
