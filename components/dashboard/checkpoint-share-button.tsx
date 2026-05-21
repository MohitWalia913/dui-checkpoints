"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buildCheckpointShareContent, getCheckpointSharePath } from "@/lib/checkpoints/share";
import {
  buildShareAppTargets,
  openShareApp,
  type ShareAppId,
} from "@/lib/checkpoints/share-apps";
import type { Checkpoint } from "@/lib/checkpoints/types";
import { cn } from "@/lib/utils";
import { Check, Copy, Mail, MessageCircle, Share2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type ShareCheckpoint = Pick<
  Checkpoint,
  "id" | "Location" | "City" | "County" | "State" | "Date" | "Time"
>;

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function TeamsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.625 8.25h-3.375V5.25A2.252 2.252 0 0 0 15 3h-6a2.252 2.252 0 0 0-2.25 2.25v3H3.375A2.252 2.252 0 0 0 1.125 10.5v9.75A2.252 2.252 0 0 0 3.375 22.5h6.75A2.252 2.252 0 0 0 12.375 20.25v-3H15a2.252 2.252 0 0 0 2.25-2.25v-3h3.375A2.252 2.252 0 0 0 22.875 10.5V8.25Zm-9 9H5.25v-6h6.375v6Zm7.875-6.75H14.25V6.75h3.375v4.5Z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 5.457v13.09a2.29 2.29 0 0 1-2.29 2.29H2.29A2.29 2.29 0 0 1 0 18.547V5.457a2.29 2.29 0 0 1 2.29-2.29h19.42A2.29 2.29 0 0 1 24 5.458zm-9.73 7.057L23.2 5.91h-3.64L12.54 10.6 5.08 5.91H1.44l8.837 6.604L1.44 19.09h3.64l7.46-5.57 7.46 5.57h3.64l-8.87-6.576z" />
    </svg>
  );
}

const APP_ICONS: Record<
  ShareAppId,
  React.ComponentType<{ className?: string }>
> = {
  whatsapp: ({ className }) => (
    <MessageCircle className={cn(className, "text-[#25D366]")} aria-hidden />
  ),
  telegram: ({ className }) => (
    <TelegramIcon className={cn(className, "text-[#26A5E4]")} />
  ),
  facebook: ({ className }) => (
    <FacebookIcon className={cn(className, "text-[#1877F2]")} />
  ),
  gmail: ({ className }) => (
    <GmailIcon className={cn(className, "text-[#EA4335]")} />
  ),
  email: ({ className }) => (
    <Mail className={cn(className, "text-[#F57E3A]")} aria-hidden />
  ),
  teams: ({ className }) => (
    <TeamsIcon className={cn(className, "text-[#5B5FC7]")} />
  ),
  twitter: ({ className }) => <XIcon className={className} />,
};

export function CheckpointShareButton({
  checkpoint,
  className,
  variant = "default",
}: {
  checkpoint: ShareCheckpoint;
  className?: string;
  variant?: "default" | "compact";
}) {
  const [pageUrl, setPageUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const origin = window.location.origin;
    setPageUrl(`${origin}${getCheckpointSharePath(checkpoint.id)}`);
  }, [checkpoint.id]);

  const share = useMemo(
    () =>
      pageUrl ? buildCheckpointShareContent(checkpoint, pageUrl) : null,
    [checkpoint, pageUrl],
  );

  const appTargets = useMemo(
    () => (share ? buildShareAppTargets(share) : []),
    [share],
  );

  const handleAppShare = useCallback(
    (appId: ShareAppId) => {
      const target = appTargets.find((t) => t.id === appId);
      if (!target) return;
      try {
        openShareApp(target);
      } catch {
        window.open(target.webUrl, "_blank", "noopener,noreferrer");
      }
    },
    [appTargets],
  );

  const handleCopyLink = useCallback(async () => {
    if (!share) return;
    try {
      await navigator.clipboard.writeText(share.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", share.url);
    }
  }, [share]);

  const triggerClass =
    variant === "compact"
      ? "font-montserrat inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:border-[#F57E3A]/40 hover:text-[#F57E3A]"
      : "font-montserrat inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#F57E3A]/40 hover:bg-white/[0.08]";

  const iconSize = variant === "compact" ? "size-3.5" : "size-4";

  if (!share) {
    return (
      <button type="button" disabled className={cn(triggerClass, className)}>
        <Share2 className={iconSize} aria-hidden />
        Share
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(triggerClass, className)}
        aria-label="Share checkpoint"
      >
        <Share2 className={iconSize} aria-hidden />
        Share
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-[100] min-w-[220px] border-white/10 bg-[#0a1628] text-white"
      >
        {appTargets.map((target) => {
          const Icon = APP_ICONS[target.id];
          return (
            <DropdownMenuItem
              key={target.id}
              className="cursor-pointer gap-2 focus:bg-[#F57E3A]/15 focus:text-white"
              onSelect={(e) => {
                e.preventDefault();
                handleAppShare(target.id);
              }}
            >
              <Icon className="size-4" />
              {target.label}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem
          className="cursor-pointer gap-2 focus:bg-[#F57E3A]/15 focus:text-white"
          onSelect={(e) => {
            e.preventDefault();
            void handleCopyLink();
          }}
        >
          {copied ? (
            <Check className="size-4 text-emerald-400" aria-hidden />
          ) : (
            <Copy className="size-4 text-white/70" aria-hidden />
          )}
          {copied ? "Link copied!" : "Copy link"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
