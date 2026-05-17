"use client";

import { forwardRef, useEffect, useState } from "react";
import QRCode from "qrcode";
import type { Profile } from "@/lib/profile";
import { compactSummary } from "@/lib/cardInsights";

interface WalletPassProps {
  profile: Profile;
  reason: string;
  goals: string[];
}

export const WalletPass = forwardRef<HTMLDivElement, WalletPassProps>(
  function WalletPass({ profile, reason, goals }, ref) {
    const [qr, setQr] = useState<string>("");

    const allergies = profile.allergies.filter((a) => a.substance.trim());
    const name = profile.display_name.trim() || "Patient";
    const pronouns = profile.pronouns.trim();
    const filledGoals = goals.map((g) => g.trim()).filter(Boolean);

    useEffect(() => {
      const payload = compactSummary(profile, reason);
      QRCode.toDataURL(payload, {
        margin: 0,
        width: 220,
        color: { dark: "#0F2A3F", light: "#FFFFFF" },
        errorCorrectionLevel: "M",
      })
        .then(setQr)
        .catch(() => setQr(""));
    }, [profile, reason]);

    const demoBits = [
      profile.age && `${profile.age}y`,
      profile.sex_assigned_at_birth &&
        `${profile.sex_assigned_at_birth[0].toUpperCase()}${profile.sex_assigned_at_birth.slice(1)} at birth`,
    ].filter(Boolean);

    return (
      <div
        ref={ref}
        className="wallet-pass relative w-full max-w-[360px] mx-auto overflow-hidden"
        style={{
          aspectRatio: "5 / 7",
          background:
            "linear-gradient(155deg, #0F2A3F 0%, #1E4B6B 35%, #38BDF8 100%)",
          borderRadius: "24px",
          boxShadow:
            "0 24px 60px -20px rgba(15, 42, 63, 0.55), 0 8px 24px -8px rgba(15, 42, 63, 0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
          color: "white",
          padding: "20px 22px",
          display: "flex",
          flexDirection: "column",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Notch (Apple Wallet–style perforation) */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "57%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              background: "white",
              borderRadius: 999,
              marginLeft: -9,
              opacity: 0.15,
            }}
          />
          <div
            style={{
              flex: 1,
              height: 1,
              background:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.35) 0 6px, transparent 6px 12px)",
              margin: "0 8px",
            }}
          />
          <div
            style={{
              width: 18,
              height: 18,
              background: "white",
              borderRadius: 999,
              marginRight: -9,
              opacity: 0.15,
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/seagull.png"
              alt=""
              crossOrigin="anonymous"
              style={{ height: 22, width: "auto" }}
            />
            <span style={{ fontSize: 11, letterSpacing: 2, opacity: 0.85, fontWeight: 700 }}>
              SEAGULL
            </span>
          </div>
          <span style={{ fontSize: 10, letterSpacing: 1.5, opacity: 0.7 }}>
            {new Date().toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        <div style={{ fontSize: 10, letterSpacing: 2.4, opacity: 0.7, marginTop: 14, fontWeight: 700 }}>
          PREVISIT CARD
        </div>

        <div style={{ marginTop: 4, fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>
          {name}
          {pronouns && (
            <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.75, marginLeft: 8 }}>
              ({pronouns})
            </span>
          )}
        </div>
        {demoBits.length > 0 && (
          <div style={{ marginTop: 4, fontSize: 12, opacity: 0.8 }}>{demoBits.join(" · ")}</div>
        )}

        {/* Allergy band — most safety-critical, sits on the front */}
        <div
          style={{
            marginTop: 14,
            padding: "10px 12px",
            background:
              allergies.length > 0
                ? "rgba(255, 59, 48, 0.92)"
                : "rgba(255, 255, 255, 0.12)",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          <div style={{ fontSize: 9, letterSpacing: 2, fontWeight: 700, opacity: 0.92 }}>
            ALLERGIES
          </div>
          <div style={{ marginTop: 2, fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>
            {allergies.length === 0
              ? "No known allergies"
              : allergies
                  .map((a) => (a.reaction ? `${a.substance} (${a.reaction})` : a.substance))
                  .join(" · ")}
          </div>
        </div>

        {/* Reason snippet */}
        <div style={{ marginTop: 12, fontSize: 10, letterSpacing: 2, opacity: 0.7, fontWeight: 700 }}>
          TODAY
        </div>
        <div style={{ marginTop: 2, fontSize: 12, lineHeight: 1.35, opacity: 0.95 }}>
          {reason.trim() || "—"}
        </div>

        {filledGoals.length > 0 && (
          <div style={{ marginTop: 8, fontSize: 11, opacity: 0.85, lineHeight: 1.35 }}>
            {filledGoals.slice(0, 3).map((g, i) => (
              <div key={i}>
                <span style={{ fontWeight: 700, opacity: 0.9 }}>{i + 1}.</span> {g}
              </div>
            ))}
          </div>
        )}

        {/* QR — bottom strip */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: 14,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 6,
              borderRadius: 8,
              width: 76,
              height: 76,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qr}
                alt="QR"
                style={{ width: "100%", height: "100%", display: "block" }}
              />
            ) : null}
          </div>
          <div style={{ fontSize: 10, opacity: 0.75, lineHeight: 1.35 }}>
            Scan to read a one-line summary.
            <br />
            Self-report, not a medical record.
          </div>
        </div>
      </div>
    );
  }
);
