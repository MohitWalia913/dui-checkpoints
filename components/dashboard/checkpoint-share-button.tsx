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
  facebookShareUrl,
  getCheckpointSharePath,
  twitterShareUrl,
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
  Smartphone,
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

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
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
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setPageUrl(
      `${window.location.origin}${getCheckpointSharePath(checkpoint.id)}`,
    );
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, [checkpoint.id]);

  const share = useMemo(
    () =>
      pageUrl
        ? buildCheckpointShareContent(checkpoint, pageUrl)
        : null,
    [checkpoint, pageUrl],
  );

  const openWindow = useCallback((url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  const handleNativeShare = useCallback(async () => {
    if (!share || !navigator.share) return;
    try {
      await navigator.share({
        title: share.title,
        text: share.text,
        url: share.url,
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Share failed", err);
      }
    }
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(triggerClass, className)}
        disabled={!share}
        aria-label="Share checkpoint"
      >
        <Share2 className={variant === "compact" ? "size-3.5" : "size-4"} aria-hidden />
        Share
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-[100] min-w-[200px] border-white/10 bg-[#0a1628] text-white"
      >
        {canNativeShare ? (
          <>
            <DropdownMenuItem
              className="cursor-pointer gap-2 focus:bg-[#F57E3A]/15 focus:text-white"
              onSelect={() => void handleNativeShare()}
            >
              <Smartphone className="size-4 text-[#F57E3A]" aria-hidden />
              Share to apps…
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
          </>
        ) : null}

        <DropdownMenuItem
          className="cursor-pointer gap-2 focus:bg-[#F57E3A]/15 focus:text-white"
          onSelect={() => share && openWindow(whatsAppShareUrl(share.text))}
        >
          <MessageCircle className="size-4 text-[#25D366]" aria-hidden />
          WhatsApp
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer gap-2 focus:bg-[#F57E3A]/15 focus:text-white"
          onSelect={() => share && openWindow(facebookShareUrl(share.url))}
        >
          <FacebookIcon className="size-4 text-[#1877F2]" />
          Facebook
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer gap-2 focus:bg-[#F57E3A]/15 focus:text-white"
          onSelect={() =>
            share && openWindow(twitterShareUrl(share.text, share.url))
          }
        >
          <XIcon className="size-4" />
          X (Twitter)
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer gap-2 focus:bg-[#F57E3A]/15 focus:text-white"
          onSelect={() =>
            share &&
            openWindow(emailShareUrl(share.title, share.text))
          }
        >
          <Mail className="size-4 text-[#F57E3A]" aria-hidden />
          Email
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem
          className="cursor-pointer gap-2 focus:bg-[#F57E3A]/15 focus:text-white"
          onSelect={() => void handleCopyLink()}
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
