"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CheckpointSharePayload } from "@/lib/checkpoints/share";
import {
  buildShareAppTargets,
  openShareApp,
  type ShareAppId,
  type ShareAppTarget,
} from "@/lib/checkpoints/share-apps";
import { cn } from "@/lib/utils";
import { Check, Copy, Link2, Mail, MessageCircle, QrCode, Share2, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
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

const APP_TILE_STYLES: Record<ShareAppId, string> = {
  whatsapp: "bg-[#25D366] text-white",
  telegram: "bg-[#26A5E4] text-white",
  facebook: "bg-[#1877F2] text-white",
  gmail: "bg-white text-[#EA4335] ring-1 ring-black/10",
  email: "bg-[#F57E3A] text-white",
  teams: "bg-[#5B5FC7] text-white",
  twitter: "bg-black text-white",
};

function AppTileIcon({
  id,
  className,
}: {
  id: ShareAppId;
  className?: string;
}) {
  const iconClass = cn("size-7", className);
  switch (id) {
    case "whatsapp":
      return <MessageCircle className={iconClass} aria-hidden />;
    case "telegram":
      return <TelegramIcon className={iconClass} />;
    case "facebook":
      return <FacebookIcon className={iconClass} />;
    case "gmail":
      return <GmailIcon className={iconClass} />;
    case "email":
      return <Mail className={iconClass} aria-hidden />;
    case "teams":
      return <TeamsIcon className={iconClass} />;
    case "twitter":
      return <XIcon className={iconClass} />;
    default:
      return null;
  }
}

function ShareAppTile({
  target,
  onShare,
}: {
  target: ShareAppTarget;
  onShare: (target: ShareAppTarget) => void;
}) {
  return (
    <button
      type="button"
      className="group flex flex-col items-center gap-2 rounded-lg p-2 transition-colors hover:bg-black/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0078D4]"
      onClick={() => onShare(target)}
    >
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-xl shadow-sm",
          APP_TILE_STYLES[target.id],
        )}
      >
        <AppTileIcon id={target.id} />
      </span>
      <span className="max-w-[72px] truncate text-center text-[11px] leading-tight text-neutral-700">
        {target.label}
      </span>
    </button>
  );
}

export function CheckpointShareDialog({
  open,
  onOpenChange,
  share,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  share: CheckpointSharePayload;
}) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const appTargets = useMemo(() => buildShareAppTargets(share), [share]);

  const qrSrc = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(share.url)}`,
    [share.url],
  );

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(share.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", share.url);
    }
  }, [share.url]);

  const handleAppShare = useCallback(
    (target: ShareAppTarget) => {
      try {
        openShareApp(target);
      } catch {
        window.open(target.webUrl, "_blank", "noopener,noreferrer");
      }
      onOpenChange(false);
    },
    [onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[min(90vh,640px)] gap-0 overflow-hidden rounded-xl border border-black/10 bg-[#f9f9f9] p-0 text-neutral-900 shadow-2xl sm:max-w-[420px]"
      >
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <Share2 className="size-5 text-neutral-700" aria-hidden />
            <DialogTitle className="font-montserrat text-base font-semibold text-neutral-900">
              Share link
            </DialogTitle>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-neutral-600 transition-colors hover:bg-black/5"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4 px-4 py-4">
          <div className="flex gap-3 rounded-lg border border-black/10 bg-white p-3 shadow-sm">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
              <Link2 className="size-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-montserrat line-clamp-2 text-sm font-semibold text-neutral-900">
                {share.title}
              </p>
              <p
                className="font-inter mt-0.5 truncate text-xs text-neutral-500"
                title={share.url}
              >
                {share.url}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                className={cn(
                  "flex size-9 items-center justify-center rounded-md border border-black/10 bg-neutral-50 text-neutral-700 transition-colors hover:bg-neutral-100",
                  showQr && "bg-[#0078D4]/10 text-[#0078D4]",
                )}
                aria-label="Show QR code"
                title="QR code"
                onClick={() => setShowQr((v) => !v)}
              >
                <QrCode className="size-4" />
              </button>
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-md border border-black/10 bg-neutral-50 text-neutral-700 transition-colors hover:bg-neutral-100"
                aria-label="Copy link"
                title="Copy link"
                onClick={() => void handleCopyLink()}
              >
                {copied ? (
                  <Check className="size-4 text-emerald-600" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>
          </div>

          {showQr ? (
            <div className="flex justify-center rounded-lg border border-black/10 bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrSrc}
                alt="QR code for checkpoint link"
                width={160}
                height={160}
                className="rounded-md"
              />
            </div>
          ) : null}

          <div>
            <p className="font-montserrat mb-3 text-sm font-semibold text-neutral-800">
              Share using
            </p>
            <div className="grid max-h-[220px] grid-cols-4 gap-1 overflow-y-auto pr-1 sm:grid-cols-4">
              {appTargets.map((target) => (
                <ShareAppTile
                  key={target.id}
                  target={target}
                  onShare={handleAppShare}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
