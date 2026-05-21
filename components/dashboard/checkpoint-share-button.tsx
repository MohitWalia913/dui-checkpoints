"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  buildCheckpointShareContent,
  emailShareUrl,
  facebookAppShareUrl,
  facebookShareUrl,
  getCheckpointSharePath,
  isSystemShareAvailable,
  launchProtocolUrl,
  openAppOrWebShare,
  shareViaSystemSheet,
  teamsAppShareUrl,
  teamsComposeUrl,
  twitterShareUrl,
  whatsAppAppShareUrl,
  whatsAppShareUrl,
} from "@/lib/checkpoints/share";
import type { Checkpoint } from "@/lib/checkpoints/types";
import { cn } from "@/lib/utils";
import {
  Check,
  Copy,
  Mail,
  MessageCircle,
  Share2,
  LayoutGrid,
} from "lucide-react";
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

const menuLinkClass =
  "flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-[#F57E3A]/15 focus:text-white";

function ShareMenuLink({
  href,
  children,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
      <a href={href} target="_blank" rel="noopener noreferrer" className={menuLinkClass}>
        {icon}
        {children}
      </a>
    </DropdownMenuItem>
  );
}

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
  const [teamsReady, setTeamsReady] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    const origin = window.location.origin;
    setPageUrl(`${origin}${getCheckpointSharePath(checkpoint.id)}`);
    setCanNativeShare(isSystemShareAvailable());
  }, [checkpoint.id]);

  const share = useMemo(
    () =>
      pageUrl ? buildCheckpointShareContent(checkpoint, pageUrl) : null,
    [checkpoint, pageUrl],
  );

  const handleNativeShare = useCallback(() => {
    if (!share) return;
    void shareViaSystemSheet({
      title: share.title,
      summary: share.summary,
      text: share.text,
      url: share.url,
    });
  }, [share]);

  const handleWhatsAppShare = useCallback(() => {
    if (!share) return;
    openAppOrWebShare({
      appUrl: whatsAppAppShareUrl(share.text),
      webUrl: whatsAppShareUrl(share.text),
    });
  }, [share]);

  const handleFacebookShare = useCallback(() => {
    if (!share) return;
    openAppOrWebShare({
      appUrl: facebookAppShareUrl(share.url),
      webUrl: facebookShareUrl(share.url),
    });
  }, [share]);

  const handleTeamsShare = useCallback(async () => {
    if (!share) return;
    try {
      await navigator.clipboard.writeText(share.text);
      setTeamsReady(true);
      window.setTimeout(() => setTeamsReady(false), 3000);
    } catch {
      // continue — Teams may still open with message in URL
    }
    openAppOrWebShare({
      appUrl: teamsAppShareUrl(share.text),
      webUrl: teamsComposeUrl(share.text),
    });
  }, [share]);

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

  if (!share) {
    return (
      <button type="button" disabled className={cn(triggerClass, className)}>
        <Share2 className="size-4" aria-hidden />
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
        <Share2 className={variant === "compact" ? "size-3.5" : "size-4"} aria-hidden />
        Share
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-[100] min-w-[220px] border-white/10 bg-[#0a1628] text-white"
      >
        {canNativeShare ? (
          <>
            <DropdownMenuItem
              className="cursor-pointer gap-2 focus:bg-[#F57E3A]/15 focus:text-white"
              onSelect={(e) => {
                e.preventDefault();
                void handleNativeShare();
              }}
            >
              <LayoutGrid className="size-4 text-[#F57E3A]" aria-hidden />
              Share to apps…
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
          </>
        ) : null}

        <DropdownMenuItem
          className="cursor-pointer gap-2 focus:bg-[#F57E3A]/15 focus:text-white"
          onSelect={(e) => {
            e.preventDefault();
            handleWhatsAppShare();
          }}
        >
          <MessageCircle className="size-4 text-[#25D366]" aria-hidden />
          WhatsApp
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer gap-2 focus:bg-[#F57E3A]/15 focus:text-white"
          onSelect={(e) => {
            e.preventDefault();
            void handleTeamsShare();
          }}
        >
          <TeamsIcon className="size-4 text-[#5B5FC7]" />
          <span className="flex flex-col">
            <span>Microsoft Teams</span>
            {teamsReady ? (
              <span className="text-[10px] font-normal text-emerald-400">
                Message copied — paste if needed (Ctrl+V)
              </span>
            ) : null}
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer gap-2 focus:bg-[#F57E3A]/15 focus:text-white"
          onSelect={(e) => {
            e.preventDefault();
            handleFacebookShare();
          }}
        >
          <FacebookIcon className="size-4 text-[#1877F2]" />
          Facebook
        </DropdownMenuItem>

        <ShareMenuLink
          href={twitterShareUrl(share.summary, share.url)}
          icon={<XIcon className="size-4" />}
        >
          X (Twitter)
        </ShareMenuLink>

        <DropdownMenuItem
          className="cursor-pointer gap-2 focus:bg-[#F57E3A]/15 focus:text-white"
          onSelect={(e) => {
            e.preventDefault();
            launchProtocolUrl(emailShareUrl(share.title, share.text));
          }}
        >
          <Mail className="size-4 text-[#F57E3A]" aria-hidden />
          Email
        </DropdownMenuItem>

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
