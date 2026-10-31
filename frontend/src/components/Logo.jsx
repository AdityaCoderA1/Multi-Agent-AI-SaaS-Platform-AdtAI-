import React from 'react';
import { BrainCircuit } from 'lucide-react';

const Logo = ({ size = "default", className = "", theme = "light" }) => {
  const sizeMap = {
    small: { icon: 20, text: "text-xl" },
    default: { icon: 28, text: "text-3xl" },
    large: { icon: 48, text: "text-5xl" }
  };

  const { icon, text } = sizeMap[size] || sizeMap.default;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icon with gradient via mask */}
      <div className="relative flex items-center justify-center">
        <svg width="0" height="0">
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop stopColor="#F97316" offset="0%" />
            <stop stopColor="#FB923C" offset="100%" />
          </linearGradient>
        </svg>
        <BrainCircuit size={icon} stroke="url(#logo-gradient)" strokeWidth={2.5} />
      </div>

      {/* Text with distinct colors */}
      <div className={`font-['Space_Grotesk'] font-bold tracking-tight ${text}`}>
        <span className={theme === "light" ? "text-brand-text" : "text-white"}>adt</span>
        <span className="bg-gradient-to-r from-brand-primary to-[#FB923C] bg-clip-text text-transparent">AI</span>
      </div>
    </div>
  );
};

export default Logo;
