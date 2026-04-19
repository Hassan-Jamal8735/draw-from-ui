"use client";

import dynamic from "next/dynamic";
import "@tldraw/tldraw/tldraw.css";
import { useEditor } from "@tldraw/tldraw";
import { getSvgAsImage } from "@/lib/getSvgAsImage";
import { blobToBase64 } from "@/lib/blobToBase64";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { PreviewPanel } from "@/components/PreviewPanel";
import { Navbar } from "@/components/Navbar";

const Tldraw = dynamic(async () => (await import("@tldraw/tldraw")).Tldraw, {
  ssr: false,
});

type Status = "idle" | "generating" | "done" | "error";

export default function Home() {
  const [html, setHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  // For drag-to-resize panel
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState(50); // percent
  const isDragging = useRef(false);

  const handleClearCanvas = () => {
    setHtml(null);
    setStatus("idle");
  };

  // Escape key to clear preview
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHtml(null);
        setStatus("idle");
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  // Panel resizing
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newLeft = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftWidth(Math.min(Math.max(newLeft, 25), 75)); // clamp 25–75%
    };
    const onMouseUp = () => { isDragging.current = false; };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#0a0a0f",
        overflow: "hidden",
      }}
    >
      {/* Top Navbar */}
      <Navbar status={status} onNewCanvas={handleClearCanvas} />

      {/* Split-Screen Studio */}
      <div
        ref={containerRef}
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Left Panel — Canvas */}
        <div
          style={{
            width: `${leftWidth}%`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Canvas label */}
          <div
            style={{
              height: "32px",
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              gap: "8px",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              background: "#0d0d14",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#8b5cf6",
              }}
            />
            <span style={{ fontSize: "11px", color: "#4a4a5e", fontWeight: 500, letterSpacing: "0.05em" }}>
              CANVAS
            </span>
          </div>

          {/* tldraw Canvas */}
          <div style={{ flex: 1, position: "relative" }}>
            <Tldraw persistenceKey="sketchui-canvas">
              <MakeRealButton
                setHtml={setHtml}
                setIsGenerating={setIsGenerating}
                setStatus={setStatus}
                isGenerating={isGenerating}
              />
            </Tldraw>
          </div>
        </div>

        {/* Draggable Divider */}
        <div
          className="panel-divider"
          onMouseDown={onMouseDown}
          style={{ cursor: "col-resize" }}
        />

        {/* Right Panel — Preview */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderLeft: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          {/* Preview label */}
          <div
            style={{
              height: "32px",
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              gap: "8px",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              background: "#0d0d14",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#06b6d4",
                boxShadow: isGenerating ? "0 0 8px #06b6d4" : "none",
              }}
            />
            <span style={{ fontSize: "11px", color: "#4a4a5e", fontWeight: 500, letterSpacing: "0.05em" }}>
              LIVE PREVIEW
            </span>
          </div>

          <div style={{ flex: 1, overflow: "hidden" }}>
            <PreviewPanel
              html={html}
              isGenerating={isGenerating}
              onRegenerate={() => {
                // Trigger a re-generation by dispatching a custom event
                window.dispatchEvent(new CustomEvent("sketchui:regenerate"));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Make Real Button — lives inside tldraw context
// ─────────────────────────────────────────────────────────
function MakeRealButton({
  setHtml,
  setIsGenerating,
  setStatus,
  isGenerating,
}: {
  setHtml: (html: string | null) => void;
  setIsGenerating: (v: boolean) => void;
  setStatus: (s: Status) => void;
  isGenerating: boolean;
}) {
  const editor = useEditor();

  const generate = useCallback(async () => {
    if (isGenerating) return;

    const shapes = Array.from(editor.currentPageShapeIds);
    if (shapes.length === 0) {
      alert("Please draw something on the canvas first!");
      return;
    }

    setIsGenerating(true);
    setStatus("generating");
    setHtml(null);

    try {
      const svg = await editor.getSvg(shapes);
      if (!svg) throw new Error("Could not capture canvas.");

      const png = await getSvgAsImage(svg, { type: "png", quality: 1, scale: 1 });
      const dataUrl = await blobToBase64(png!);

      const resp = await fetch("/api/toHtml", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });

      if (!resp.body) throw new Error("No response body from API.");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let fullMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullMessage += chunk;

        if (fullMessage.includes("<!DOCTYPE html>")) {
          const start = fullMessage.indexOf("<!DOCTYPE html>");
          const end = fullMessage.lastIndexOf("</html>");
          setHtml(end !== -1 ? fullMessage.slice(start, end + 7) : fullMessage.slice(start));
        }
      }

      // Final parse
      if (fullMessage.startsWith("Error:")) {
        throw new Error(fullMessage.replace("Error:", "").trim());
      }

      const start = fullMessage.indexOf("<!DOCTYPE html>");
      const end = fullMessage.lastIndexOf("</html>");
      if (start !== -1 && end !== -1) {
        setHtml(fullMessage.slice(start, end + 7));
      } else if (start !== -1) {
        setHtml(fullMessage.slice(start));
      } else if (fullMessage.trim()) {
        setHtml(fullMessage);
      }

      setStatus("done");
    } catch (err: unknown) {
      console.error("Generation failed:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(`Generation failed: ${message}`);
      setStatus("error");
      setHtml(null);
    } finally {
      setIsGenerating(false);
    }
  }, [editor, isGenerating, setHtml, setIsGenerating, setStatus]);

  // Listen for regenerate events from the preview panel
  useEffect(() => {
    const handler = () => generate();
    window.addEventListener("sketchui:regenerate", handler);
    return () => window.removeEventListener("sketchui:regenerate", handler);
  }, [generate]);

  return (
    <button
      id="make-real-btn"
      onClick={generate}
      disabled={isGenerating}
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 28px",
        fontSize: "14px",
        fontWeight: 600,
        borderRadius: "14px",
        border: "none",
        cursor: isGenerating ? "not-allowed" : "pointer",
        opacity: isGenerating ? 0.7 : 1,
        transition: "all 0.2s",
        background: isGenerating
          ? "rgba(139,92,246,0.3)"
          : "linear-gradient(135deg, #8b5cf6, #06b6d4)",
        color: "#fff",
        boxShadow: isGenerating
          ? "none"
          : "0 4px 24px rgba(139,92,246,0.45), 0 1px 0 rgba(255,255,255,0.1) inset",
        letterSpacing: "0.02em",
      }}
    >
      {isGenerating ? (
        <>
          <div
            style={{
              width: "16px",
              height: "16px",
              border: "2px solid rgba(255,255,255,0.3)",
              borderTopColor: "#fff",
              borderRadius: "50%",
              animation: "spin-slow 0.8s linear infinite",
            }}
          />
          Generating...
        </>
      ) : (
        <>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          </svg>
          Make Real
        </>
      )}
    </button>
  );
}
