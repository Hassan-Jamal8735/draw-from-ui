"use client";

import { useEffect, useState } from "react";

type Step = {
  icon: string;
  label: string;
  duration: number; // ms to show this step as active
};

const STEPS: Step[] = [
  { icon: "🎨", label: "Analyzing your wireframe...", duration: 2000 },
  { icon: "🧠", label: "Planning the layout...", duration: 2500 },
  { icon: "✍️", label: "Writing the HTML structure...", duration: 3000 },
  { icon: "🎨", label: "Applying Tailwind styles...", duration: 3000 },
  { icon: "✨", label: "Adding finishing touches...", duration: 99999 }, // holds until done
];

type GeneratingStateProps = {
  isGenerating: boolean;
};

export function GeneratingState({ isGenerating }: GeneratingStateProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    let stepIndex = 0;
    setCurrentStep(0);
    setProgress(5);

    const advance = () => {
      if (stepIndex < STEPS.length - 1) {
        stepIndex++;
        setCurrentStep(stepIndex);
        setProgress(Math.round(((stepIndex + 1) / STEPS.length) * 90));
      }
    };

    // Advance steps using cumulative timers
    const timers: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;
    for (let i = 0; i < STEPS.length - 1; i++) {
      cumulative += STEPS[i].duration;
      const t = setTimeout(advance, cumulative);
      timers.push(t);
    }

    return () => timers.forEach(clearTimeout);
  }, [isGenerating]);

  if (!isGenerating) return null;

  return (
    <div
      className="animate-fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: "32px",
        padding: "40px",
      }}
    >
      {/* Animated Logo */}
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "24px",
          background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))",
          border: "2px solid rgba(139,92,246,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "36px",
          animation: "pulse-glow 2s ease-in-out infinite",
        }}
      >
        ✦
      </div>

      {/* Title */}
      <div style={{ textAlign: "center" }}>
        <h3
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#f0f0ff",
            marginBottom: "6px",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          AI is Building Your UI
        </h3>
        <p style={{ fontSize: "13px", color: "#8b8ba7" }}>
          Sit tight while we transform your sketch into a stunning page
        </p>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          height: "4px",
          background: "rgba(255,255,255,0.06)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #8b5cf6, #06b6d4)",
            borderRadius: "2px",
            transition: "width 0.8s ease",
            boxShadow: "0 0 10px rgba(139,92,246,0.5)",
          }}
        />
      </div>

      {/* Steps List */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "100%",
          maxWidth: "360px",
        }}
      >
        {STEPS.map((step, i) => {
          const isDone = i < currentStep;
          const isActive = i === currentStep;
          const isPending = i > currentStep;

          return (
            <div
              key={i}
              className={isActive ? "animate-slide-in-right" : ""}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "10px",
                background: isActive
                  ? "rgba(139,92,246,0.1)"
                  : isDone
                  ? "rgba(16,185,129,0.05)"
                  : "transparent",
                border: isActive
                  ? "1px solid rgba(139,92,246,0.3)"
                  : isDone
                  ? "1px solid rgba(16,185,129,0.15)"
                  : "1px solid transparent",
                transition: "all 0.3s ease",
                opacity: isPending ? 0.35 : 1,
              }}
            >
              {/* Step Icon / Status */}
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background: isDone
                    ? "rgba(16,185,129,0.15)"
                    : isActive
                    ? "rgba(139,92,246,0.15)"
                    : "rgba(255,255,255,0.04)",
                  fontSize: "13px",
                }}
              >
                {isDone ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : isActive ? (
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      border: "2px solid #8b5cf6",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin-slow 1s linear infinite",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.15)",
                    }}
                  />
                )}
              </div>

              {/* Step Label */}
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: isActive ? 500 : 400,
                  color: isDone ? "#10b981" : isActive ? "#a78bfa" : "#4a4a5e",
                  transition: "color 0.3s",
                }}
              >
                {step.icon} {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
