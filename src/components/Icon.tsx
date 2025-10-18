import React from "react";

type IconName = "attach" | "search" | "study" | "plus" | "voice";

type Props = {
  name: IconName;
  size?: number;
  stroke?: number;
  className?: string;
};

export default function Icon({ name, size = 16, stroke = 1.75, className = "" }: Props) {
  const common: React.SVGProps<SVGSVGElement> = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (name) {
    case "attach":
      return (
        <svg {...common} className={className}>
          <path d="M21.44 11.05L12.53 20.96a5 5 0 0 1-7.07 0 5 5 0 0 1 0-7.07L14.12 5.3a3.5 3.5 0 0 1 4.95 0 3.5 3.5 0 0 1 0 4.95L10.6 19.7a1.5 1.5 0 0 1-2.12 0 1.5 1.5 0 0 1 0-2.12L17.83 8.4" />
        </svg>
      );
    case "search":
      return (
        <svg {...common} className={className}>
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case "study":
      return (
        <svg {...common} className={className}>
          <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20" />
          <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common} className={className}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case "voice":
      return (
        <svg {...common} className={className}>
          <path d="M12 1v11" />
          <path d="M19 11a7 7 0 0 1-14 0" />
          <line x1="12" y1="21" x2="12" y2="23" />
        </svg>
      );
    default:
      return null;
  }
}
