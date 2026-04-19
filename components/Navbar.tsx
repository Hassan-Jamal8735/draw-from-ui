"use client";

type NavbarProps = {
  status: "idle" | "generating" | "done" | "error";
  onNewCanvas: () => void;
};

const statusConfig = {
  idle: { label: "Ready", color: "#8b8ba7", dot: "#4a4a5e" },
  generating: { label: "Generating...", color: "#a78bfa", dot: "#8b5cf6" },
  done: { label: "Done ✓", color: "#10b981", dot: "#10b981" },
  error: { label: "Failed", color: "#f87171", dot: "#ef4444" },
};

export function Navbar({ status, onNewCanvas }: NavbarProps) {
  const cfg = statusConfig[status];

  return (
    <header
      style={{
        height: "52px",
        background: "#111118",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        flexShrink: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "15px",
          }}
        >
          ✦
        </div>
        <span
          style={{
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            fontWeight: 700,
            fontSize: "17px",
            background: "linear-gradient(135deg, #a78bfa, #06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          SketchUI
        </span>
        <span
          style={{
            fontSize: "11px",
            color: "#4a4a5e",
            fontWeight: 500,
            marginLeft: "4px",
            letterSpacing: "0.05em",
          }}
        >
          AI Design Studio
        </span>
      </div>

      {/* Center — Status Indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "20px",
          padding: "4px 14px",
        }}
      >
        <div
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: cfg.dot,
            boxShadow: status === "generating" ? `0 0 8px ${cfg.dot}` : "none",
            animation: status === "generating" ? "pulse-glow 1.5s infinite" : "none",
          }}
        />
        <span style={{ fontSize: "12px", color: cfg.color, fontWeight: 500 }}>
          {cfg.label}
        </span>
      </div>

      {/* Right Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            fontSize: "11px",
            color: "#4a4a5e",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "8px",
            padding: "4px 10px",
          }}
        >
          Press <kbd style={{ fontFamily: "monospace", color: "#8b8ba7", fontSize: "11px" }}>Esc</kbd> to clear
        </div>
        <button
          onClick={onNewCanvas}
          style={{
            background: "rgba(139, 92, 246, 0.1)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            color: "#a78bfa",
            borderRadius: "8px",
            padding: "5px 14px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(139, 92, 246, 0.2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(139, 92, 246, 0.1)";
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Canvas
        </button>
      </div>
    </header>
  );
}
