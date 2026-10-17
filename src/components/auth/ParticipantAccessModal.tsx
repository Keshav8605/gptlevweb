"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface ParticipantAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleChange?: (role: "creator" | "recipient", name: string) => void;
  currentRole?: "creator" | "recipient" | "guest";
  currentName?: string;
}

export function ParticipantAccessModal({
  isOpen,
  onClose,
  onRoleChange,
  currentRole: propRole,
  currentName: propName,
}: ParticipantAccessModalProps) {
  const [tokenInput, setTokenInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink] = useState(() => {
    if (typeof window === "undefined") return "/?invite=sweetheart";
    return `${window.location.origin}/?invite=sweetheart`;
  });
  const [copiedLink, setCopiedLink] = useState(false);

  // Read role and name dynamically
  const [currentRole, setCurrentRole] = useState<"creator" | "recipient" | "guest">(() => {
    if (typeof window === "undefined") return propRole || "recipient";
    return propRole || (localStorage.getItem("gift_participant_role") as "creator" | "recipient") || "recipient";
  });
  const [currentName, setCurrentName] = useState<string>(() => {
    if (typeof window === "undefined") return propName || "Baby";
    return propName || localStorage.getItem("gift_participant_name") || "Baby";
  });

  useEffect(() => {
    const handleStorage = () => {
      const role = propRole || (localStorage.getItem("gift_participant_role") as "creator" | "recipient") || "recipient";
      const name = propName || localStorage.getItem("gift_participant_name") || (role === "creator" ? "Babe" : "Baby");
      setCurrentRole(role);
      setCurrentName(name);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [propRole, propName]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenInput.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.authorized) {
        if (onRoleChange) onRoleChange(data.role, data.name);
        try {
          localStorage.setItem("gift_auth_token", tokenInput.trim());
          localStorage.setItem("gift_participant_role", data.role);
          localStorage.setItem("gift_participant_name", data.name);
          setCurrentRole(data.role);
          setCurrentName(data.name);
          window.dispatchEvent(new Event("storage"));
        } catch {}
        onClose();
        setTokenInput("");
      } else {
        setErrorMsg(data.error || "Invalid invitation token or creator passcode.");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyInviteLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(inviteLink).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      });
    }
  };

  const handleQuickSwitch = (role: "creator" | "recipient") => {
    const token = role === "creator" ? "love2024" : "sweetheart";
    const name = role === "creator" ? "Babe" : "Baby";
    setTokenInput(token);
    setIsLoading(true);
    fetch("/api/auth/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.authorized) {
          if (onRoleChange) onRoleChange(data.role, data.name);
          try {
            localStorage.setItem("gift_auth_token", token);
            localStorage.setItem("gift_participant_role", data.role);
            localStorage.setItem("gift_participant_name", data.name);
            setCurrentRole(data.role);
            setCurrentName(data.name);
            window.dispatchEvent(new Event("storage"));
          } catch {}
          onClose();
        } else {
          // Direct fallback
          if (onRoleChange) onRoleChange(role, name);
          localStorage.setItem("gift_participant_role", role);
          localStorage.setItem("gift_participant_name", name);
          setCurrentRole(role);
          setCurrentName(name);
          window.dispatchEvent(new Event("storage"));
          onClose();
        }
      })
      .catch(() => {
        if (onRoleChange) onRoleChange(role, name);
        localStorage.setItem("gift_participant_role", role);
        localStorage.setItem("gift_participant_name", name);
        setCurrentRole(role);
        setCurrentName(name);
        window.dispatchEvent(new Event("storage"));
        onClose();
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md w-full z-50 bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--border-subtle)] space-y-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-[var(--pink-strong)]">
                  Couple Space Authorization
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  Participant Identity
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[var(--pale-rose)] text-[var(--pink-strong)] flex items-center justify-center cursor-pointer hover:bg-[var(--bg-blush)]"
              >
                ✕
              </button>
            </div>

            {/* Current status pill */}
            <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] flex items-center justify-between">
              <div>
                <span className="text-[var(--text-muted)] block">Currently active as:</span>
                <span className="font-bold text-[var(--pink-deep)] text-sm">
                  {currentRole === "creator" ? `Creator (${currentName}) ✏️` : `Recipient (${currentName}) ♡`}
                </span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white border border-[var(--border-subtle)] text-[var(--pink-strong)] font-semibold">
                Authorized
              </span>
            </div>

            {/* Quick Switch for Testing */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                Quick-Switch Participant (for 2-way testing):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickSwitch("recipient")}
                  className={`p-3 rounded-2xl text-xs font-semibold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    currentRole === "recipient"
                      ? "bg-[var(--pale-rose)] border-[var(--pink-strong)] text-[var(--pink-deep)]"
                      : "bg-white border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--pink-primary)]"
                  }`}
                >
                  <span className="text-lg">💌</span>
                  <span>Switch to Recipient</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSwitch("creator")}
                  className={`p-3 rounded-2xl text-xs font-semibold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    currentRole === "creator"
                      ? "bg-[var(--pale-rose)] border-[var(--pink-strong)] text-[var(--pink-deep)]"
                      : "bg-white border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--pink-primary)]"
                  }`}
                >
                  <span className="text-lg">✏️</span>
                  <span>Switch to Creator</span>
                </button>
              </div>
            </div>

            {/* Passcode verification form */}
            <form onSubmit={handleVerify} className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                Or enter Invitation Token / Creator Passcode:
              </label>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="e.g. sweetheart or love2024"
                className="w-full text-xs p-3 rounded-xl border border-[var(--border-medium)] focus:border-[var(--pink-primary)] focus:outline-none"
              />

              {errorMsg && (
                <p className="text-xs text-rose-500 font-medium">{errorMsg}</p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-[var(--text-muted)] cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !tokenInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[var(--pink-strong)] text-white text-xs font-semibold hover:bg-[var(--pink-deep)] cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Verifying..." : "Verify Access"}
                </button>
              </div>
            </form>

            {/* Direct Invitation Link Share */}
            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                Direct Recipient Access Link:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 text-[11px] p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)] select-all truncate"
                />
                <button
                  onClick={handleCopyInviteLink}
                  type="button"
                  className="px-3 py-2 rounded-xl bg-[var(--pale-rose)] text-[var(--pink-strong)] text-xs font-semibold hover:bg-[var(--bg-blush)] cursor-pointer whitespace-nowrap"
                >
                  {copiedLink ? "Copied! ✨" : "Copy Link"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
