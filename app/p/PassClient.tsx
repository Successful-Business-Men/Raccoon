"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Wallet, AlertCircle } from "lucide-react";
import { WalletPass } from "@/components/WalletPass";
import { emptyProfile, type Profile } from "@/lib/profile";

interface PassPayload {
  profile: Profile;
  reason: string;
  goals: string[];
}

function decodePayload(): PassPayload | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const data = params.get("d");
  if (!data) return null;
  try {
    const json = atob(data.replace(/-/g, "+").replace(/_/g, "/"));
    const obj = JSON.parse(decodeURIComponent(escape(json)));
    return {
      profile: { ...emptyProfile(), ...(obj.profile || {}) },
      reason: String(obj.reason || ""),
      goals: Array.isArray(obj.goals) ? obj.goals.map(String) : [],
    };
  } catch {
    return null;
  }
}

export function PassClient() {
  const [payload, setPayload] = useState<PassPayload | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const passRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPayload(decodePayload());
    setReady(true);
  }, []);

  async function downloadImage() {
    if (!passRef.current || busy) return;
    setBusy(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(passRef.current, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: "transparent",
      });
      const a = document.createElement("a");
      a.download = `previsit-pass-${new Date().toISOString().slice(0, 10)}.png`;
      a.href = dataUrl;
      a.click();
    } catch {
      // best-effort
    } finally {
      setBusy(false);
    }
  }

  async function addToAppleWallet() {
    if (!payload || busy) return;
    setBusy(true);
    setWalletError(null);
    try {
      const res = await fetch("/api/wallet/pkpass", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setWalletError(
          data?.error ||
            "Apple Wallet pass signing isn't set up on this deployment. Save the image instead."
        );
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      // iOS Safari recognises application/vnd.apple.pkpass and prompts Add to Wallet.
      window.location.href = url;
    } catch (e: any) {
      setWalletError(e?.message || "Network error.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return null;

  if (!payload) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-[#0F2A3F] text-white">
        <div className="max-w-sm text-center">
          <div className="text-meta uppercase tracking-[0.2em] opacity-70">
            Previsit Pass
          </div>
          <h1 className="mt-3 text-xl font-bold">No pass data in this link.</h1>
          <p className="mt-3 text-sm opacity-80">
            This page opens from the QR code on a Seagull Previsit Card. Try
            re-scanning the QR code directly from the card.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen px-4 py-8 sm:py-12 flex flex-col items-center justify-center gap-6"
      style={{
        background:
          "radial-gradient(120% 80% at 50% 0%, #1E4B6B 0%, #0B1B2A 60%, #050D17 100%)",
      }}
    >
      <div className="text-meta uppercase tracking-[0.24em] text-white/70 font-bold">
        Previsit Pass
      </div>

      <div ref={passRef}>
        <WalletPass
          profile={payload.profile}
          reason={payload.reason}
          goals={payload.goals}
        />
      </div>

      <div className="w-full max-w-[360px] flex flex-col gap-3">
        <button
          onClick={addToAppleWallet}
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 rounded-btn bg-black text-white px-5 py-3 text-body font-bold border border-white/15 disabled:opacity-60"
        >
          <Wallet className="h-5 w-5" /> Add to Apple Wallet
        </button>
        <button
          onClick={downloadImage}
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 rounded-btn bg-white/10 text-white px-5 py-3 text-body font-bold border border-white/20 disabled:opacity-60"
        >
          <Download className="h-5 w-5" /> Save image
        </button>
        {walletError && (
          <div className="rounded-btn bg-amber-500/15 border border-amber-300/40 text-amber-100 text-meta px-4 py-3 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>{walletError}</div>
          </div>
        )}
        <div className="text-center text-meta text-white/60 leading-snug">
          Self-report. Not a medical record.
        </div>
      </div>
    </main>
  );
}
