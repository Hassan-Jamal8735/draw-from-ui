"use client";

import { useEffect, useRef, useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-cshtml";
import "prismjs/themes/prism-tomorrow.css";
import { GeneratingState } from "./GeneratingState";

type DeviceMode = "desktop" | "tablet" | "mobile";

const deviceWidths: Record<DeviceMode, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

const deviceIcons: Record<DeviceMode, React.ReactNode> = {
  desktop: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  tablet: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <circle cx="12" cy="18" r="1" />
    </svg>
  ),
  mobile: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <circle cx="12" cy="18" r="1" />
    </svg>
  ),
};

type PreviewPanelProps = {
  html: string | null;
  isGenerating: boolean;
  onRegenerate: () => void;
};

export function PreviewPanel({ html, isGenerating, onRegenerate }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [toast, setToast] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (activeTab === "code" && html) {
      requestAnimationFrame(() => Prism.highlightAll());
    }
  }, [html, activeTab]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleCopy = async () => {
    if (!html) return;
    await navigator.clipboard.writeText(html);
    showToast("✓ HTML copied to clipboard!");
  };

  const handleDownload = () => {
    if (!html) return;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sketchui-design.html";
    a.click();
    URL.revokeObjectURL(url);
    showToast("✓ File downloaded!");
  };

  const handleOpenTab = () => {
    if (!html) return;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const hasContent = html && html.trim().length > 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0d0d14",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          height: "48px",
          background: "#111118",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
          gap: "12px",
        }}
      >
        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px" }}>
          {(["preview", "code"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "4px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
                transition: "all 0.2s",
                background:
                  activeTab === tab
                    ? "rgba(139,92,246,0.2)"
                    : "rgba(255,255,255,0.04)",
                color: activeTab === tab ? "#a78bfa" : "#8b8ba7",
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Device switcher (only in preview mode) */}
        {activeTab === "preview" && hasContent && (
          <div
            style={{
              display: "flex",
              gap: "2px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "8px",
              padding: "3px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {(["desktop", "tablet", "mobile"] as DeviceMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setDeviceMode(mode)}
                title={mode.charAt(0).toUpperCase() + mode.slice(1)}
                style={{
                  width: "28px",
                  height: "24px",
                  borderRadius: "5px",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    deviceMode === mode ? "rgba(139,92,246,0.2)" : "transparent",
                  color: deviceMode === mode ? "#a78bfa" : "#4a4a5e",
                  transition: "all 0.2s",
                }}
              >
                {deviceIcons[mode]}
              </button>
            ))}
          </div>
        )}

        {/* Export Actions */}
        {hasContent && (
          <div style={{ display: "flex", gap: "6px", marginLeft: "auto" }}>
            <ActionButton onClick={handleCopy} title="Copy HTML">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </ActionButton>
            <ActionButton onClick={handleDownload} title="Download HTML">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Download
            </ActionButton>
            <ActionButton onClick={handleOpenTab} title="Open in new tab">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
              </svg>
              Open
            </ActionButton>
            <ActionButton onClick={onRegenerate} title="Re-generate" accent>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Regenerate
            </ActionButton>
          </div>
        )}
      </div>

      {/* Panel Body */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {/* Generating State Overlay */}
        {isGenerating && !hasContent && (
          <GeneratingState isGenerating={isGenerating} />
        )}

        {/* Empty / Idle State */}
        {!isGenerating && !hasContent && (
          <div
            className="animate-fade-in"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: "16px",
              padding: "40px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "20px",
                background: "rgba(255,255,255,0.03)",
                border: "1px dashed rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                color: "#4a4a5e",
              }}
            >
              👁
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#4a4a5e", marginBottom: "6px" }}>
                Preview will appear here
              </h3>
              <p style={{ fontSize: "13px", color: "#2e2e3e" }}>
                Draw something on the canvas and click{" "}
                <span style={{ color: "#8b5cf6" }}>✦ Make Real</span>
              </p>
            </div>

            {/* Hint cards */}
            <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap", justifyContent: "center" }}>
              {["🖼 Landing Pages", "📊 Dashboards", "🧩 Components", "💳 Pricing Tables"].map((hint) => (
                <div
                  key={hint}
                  style={{
                    fontSize: "12px",
                    color: "#4a4a5e",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "8px",
                    padding: "5px 10px",
                  }}
                >
                  {hint}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Preview iframe */}
        {hasContent && activeTab === "preview" && !isGenerating && (
          <div
            className="animate-fade-in"
            style={{
              height: "100%",
              display: "flex",
              justifyContent: "center",
              background: deviceMode !== "desktop" ? "#0a0a0f" : "transparent",
              padding: deviceMode !== "desktop" ? "16px" : "0",
              overflow: "auto",
            }}
          >
            <iframe
              ref={iframeRef}
              srcDoc={html}
              style={{
                width: deviceWidths[deviceMode],
                height: deviceMode !== "desktop" ? "100%" : "100%",
                border: deviceMode !== "desktop" ? "1px solid rgba(255,255,255,0.1)" : "none",
                borderRadius: deviceMode !== "desktop" ? "12px" : "0",
                boxShadow: deviceMode !== "desktop" ? "0 0 40px rgba(0,0,0,0.5)" : "none",
                flexShrink: 0,
                background: "#fff",
              }}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        )}

        {/* Streaming indicator — AI responding but content is building */}
        {isGenerating && hasContent && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(139,92,246,0.15)",
              border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: "20px",
              padding: "4px 12px",
              fontSize: "12px",
              color: "#a78bfa",
              zIndex: 10,
            }}
          >
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#8b5cf6",
                animation: "pulse-glow 1.5s infinite",
              }}
            />
            Streaming...
          </div>
        )}

        {/* Generating + has content: show the streaming iframe */}
        {isGenerating && hasContent && activeTab === "preview" && (
          <iframe
            srcDoc={html}
            style={{ width: "100%", height: "100%", border: "none", background: "#fff" }}
            sandbox="allow-scripts allow-same-origin"
          />
        )}

        {/* Code Tab */}
        {hasContent && activeTab === "code" && (
          <div
            style={{
              height: "100%",
              overflow: "auto",
              background: "#0d1117",
            }}
          >
            <pre className="p-4" style={{ margin: 0, fontSize: "12px", lineHeight: "1.6" }}>
              <code className="language-markup">{html}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  title,
  accent = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        padding: "4px 10px",
        fontSize: "12px",
        fontWeight: 500,
        borderRadius: "6px",
        border: `1px solid ${accent ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"}`,
        background: accent ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)",
        color: accent ? "#a78bfa" : "#8b8ba7",
        cursor: "pointer",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = accent ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.08)";
        el.style.color = accent ? "#c4b5fd" : "#f0f0ff";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = accent ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)";
        el.style.color = accent ? "#a78bfa" : "#8b8ba7";
      }}
    >
      {children}
    </button>
  );
}
