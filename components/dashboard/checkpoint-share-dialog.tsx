"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CheckpointSharePayload } from "@/lib/checkpoints/share";
import {
  getOrderedShareAppTargets,
  openShareApp,
  type ShareAppId,
  type ShareAppTarget,
} from "@/lib/checkpoints/share-apps";
import { cn } from "@/lib/utils";
import {
  Check,
  Copy,
  LayoutGrid,
  Link2,
  Mail,
  MessageCircle,
  Share2,
  User,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#1877F2" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#26A5E4" aria-hidden>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function TeamsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#5B5FC7" aria-hidden>
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
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M24 5.457v13.09a2.29 2.29 0 0 1-2.29 2.29H2.29A2.29 2.29 0 0 1 0 18.547V5.457a2.29 2.29 0 0 1 2.29-2.29h19.42A2.29 2.29 0 0 1 24 5.458z" />
      <path fill="#FFF" d="M24 5.457v13.09a2.29 2.29 0 0 1-2.29 2.29H2.29A2.29 2.29 0 0 1 0 18.547V5.457a2.29 2.29 0 0 1 2.29-2.29h19.42A2.29 2.29 0 0 1 24 5.458zm-9.73 7.057L23.2 5.91h-3.64L12.54 10.6 5.08 5.91H1.44l8.837 6.604L1.44 19.09h3.64l7.46-5.57 7.46 5.57h3.64l-8.87-6.576z" />
    </svg>
  );
}

function OutlookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#0078D4" aria-hidden>
      <path d="M24 7.387v9.226c0 .676-.549 1.225-1.225 1.225H8.225V5.162h14.55c.676 0 1.225.549 1.225 1.225v1zm-9.75 8.513H1.225A1.225 1.225 0 0 1 0 14.675V2.325C0 1.649.549 1.1 1.225 1.1h13.025c.676 0 1.225.549 1.225 1.225v13.575z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#0A66C2" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const APP_ICON_COLORS: Record<ShareAppId, string> = {
  whatsapp: "text-[#25D366]",
  telegram: "text-[#26A5E4]",
  facebook: "text-[#1877F2]",
  gmail: "text-[#EA4335]",
  outlook: "text-[#0078D4]",
  email: "text-[#0078D4]",
  teams: "text-[#5B5FC7]",
  linkedin: "text-[#0A66C2]",
  twitter: "text-black",
};

function AppBrandIcon({ id, className }: { id: ShareAppId; className?: string }) {
  const cls = cn("size-8", className);
  switch (id) {
    case "whatsapp":
      return <MessageCircle className={cn(cls, APP_ICON_COLORS.whatsapp)} aria-hidden />;
    case "telegram":
      return <TelegramIcon className={cls} />;
    case "facebook":
      return <FacebookIcon className={cls} />;
    case "gmail":
      return <GmailIcon className={cls} />;
    case "outlook":
      return <OutlookIcon className={cls} />;
    case "email":
      return <Mail className={cn(cls, APP_ICON_COLORS.email)} aria-hidden />;
    case "teams":
      return <TeamsIcon className={cls} />;
    case "linkedin":
      return <LinkedInIcon className={cls} />;
    case "twitter":
      return <XIcon className={cls} />;
    default:
      return null;
  }
}

const QUICK_SHARE: {
  initials: string;
  name: string;
  sub?: string;
  appId: ShareAppId;
  avatar: string;
}[] = [
  { initials: "GM", name: "Gmail", sub: "Quick share", appId: "gmail", avatar: "from-[#EA4335] to-[#FBBC04]" },
  { initials: "OL", name: "Outlook", appId: "outlook", avatar: "from-[#0078D4] to-[#00BCF2]" },
  { initials: "WA", name: "WhatsApp", appId: "whatsapp", avatar: "from-[#25D366] to-[#128C7E]" },
  { initials: "TM", name: "Teams", appId: "teams", avatar: "from-[#5B5FC7] to-[#464EB8]" },
];

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
      className="flex w-[76px] shrink-0 flex-col items-center gap-1.5 rounded-md px-1 py-2 transition-colors hover:bg-[#ebebeb] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0078D4]"
      onClick={() => onShare(target)}
    >
      <span className="flex size-[52px] items-center justify-center rounded-lg border border-black/[0.06] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <AppBrandIcon id={target.id} />
      </span>
      <span className="line-clamp-2 w-full text-center text-[11px] leading-[13px] text-[#1a1a1a]">
        {target.label}
      </span>
    </button>
  );
}

function QuickContactTile({
  contact,
  onShare,
}: {
  contact: (typeof QUICK_SHARE)[number];
  onShare: (appId: ShareAppId) => void;
}) {
  return (
    <button
      type="button"
      className="flex w-[72px] shrink-0 flex-col items-center gap-1 rounded-md py-1 transition-colors hover:bg-[#ebebeb] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0078D4]"
      onClick={() => onShare(contact.appId)}
    >
      <span className="relative">
        <span
          className={cn(
            "flex size-12 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white shadow-sm",
            contact.avatar,
          )}
        >
          {contact.initials}
        </span>
        <span className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full border-2 border-[#f3f3f3] bg-white shadow-sm">
          <AppBrandIcon id={contact.appId} className="size-3" />
        </span>
      </span>
      <span className="line-clamp-1 w-full text-center text-[11px] font-medium text-[#1a1a1a]">
        {contact.name}
      </span>
      {contact.sub ? (
        <span className="line-clamp-1 w-full text-center text-[10px] text-[#616161]">
          {contact.sub}
        </span>
      ) : null}
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

  const appTargets = useMemo(() => getOrderedShareAppTargets(share), [share]);

  const qrSrc = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(share.url)}`,
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

  const handleQuickShare = useCallback(
    (appId: ShareAppId) => {
      const target = appTargets.find((t) => t.id === appId);
      if (target) handleAppShare(target);
    },
    [appTargets, handleAppShare],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[min(92vh,680px)] w-[min(100vw-1.5rem,480px)] flex-col gap-0 overflow-hidden rounded-lg border border-[#e5e5e5] bg-[#f3f3f3] p-0 text-[#1a1a1a] shadow-[0_8px_40px_rgba(0,0,0,0.28)]"
      >
        <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-4">
          <div className="flex items-center gap-2.5">
            <Share2 className="size-[18px] text-[#424242]" strokeWidth={2} aria-hidden />
            <DialogTitle className="text-[15px] font-normal text-[#1a1a1a]">
              Share link
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#F57E3A] to-[#d96a2e] text-xs font-semibold text-white"
              aria-hidden
            >
              <User className="size-4" />
            </span>
            <button
              type="button"
              className="flex size-8 items-center justify-center rounded-md text-[#424242] transition-colors hover:bg-black/[0.06]"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-[18px]" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
          <div className="mb-4 flex gap-3 rounded-md border border-[#e0e0e0] bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex size-9 shrink-0 items-center justify-center text-[#616161]">
              <Link2 className="size-5" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0 flex-1 py-0.5">
              <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-[#1a1a1a]">
                {share.title}
              </p>
              <p className="mt-0.5 truncate text-[12px] text-[#616161]" title={share.url}>
                {share.url}
              </p>
            </div>
            <div className="flex shrink-0 items-start gap-1">
              <button
                type="button"
                className={cn(
                  "flex size-8 items-center justify-center rounded text-[#424242] transition-colors hover:bg-[#f0f0f0]",
                  showQr && "bg-[#e5f3ff] text-[#0078D4]",
                )}
                aria-label="QR code"
                title="QR code"
                onClick={() => setShowQr((v) => !v)}
              >
                <LayoutGrid className="size-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded text-[#424242] transition-colors hover:bg-[#f0f0f0]"
                aria-label="Copy link"
                title="Copy link"
                onClick={() => void handleCopyLink()}
              >
                {copied ? (
                  <Check className="size-4 text-[#107C10]" strokeWidth={2.5} />
                ) : (
                  <Copy className="size-4" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          {showQr ? (
            <div className="mb-4 flex justify-center rounded-md border border-[#e0e0e0] bg-white py-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrSrc}
                alt="QR code for checkpoint link"
                width={180}
                height={180}
                className="rounded"
              />
            </div>
          ) : null}

          <div className="mb-4">
            <div className="-mx-1 flex gap-0.5 overflow-x-auto pb-1 scrollbar-thin">
              {QUICK_SHARE.map((contact) => (
                <QuickContactTile
                  key={contact.appId}
                  contact={contact}
                  onShare={handleQuickShare}
                />
              ))}
            </div>
          </div>

          <div className="mb-2 h-px bg-[#e0e0e0]" />

          <p className="mb-2 text-[13px] font-semibold text-[#1a1a1a]">Share using</p>
          <div className="-mx-1 flex flex-wrap gap-y-1 overflow-x-auto pb-1">
            {appTargets.map((target) => (
              <ShareAppTile
                key={target.id}
                target={target}
                onShare={handleAppShare}
              />
            ))}
            <button
              type="button"
              className="flex w-[76px] shrink-0 flex-col items-center gap-1.5 rounded-md px-1 py-2 transition-colors hover:bg-[#ebebeb]"
              onClick={() => void handleCopyLink()}
            >
              <span className="flex size-[52px] items-center justify-center rounded-lg border border-black/[0.06] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                <Copy className="size-7 text-[#616161]" strokeWidth={1.5} />
              </span>
              <span className="line-clamp-2 w-full text-center text-[11px] leading-[13px] text-[#1a1a1a]">
                Copy link
              </span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
