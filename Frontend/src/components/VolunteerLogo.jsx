import React from "react";

export function VolunteerLogo({ className = "", size = "md" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-20 w-20",
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M50 85 C50 85, 20 60, 20 40 C20 25, 30 15, 45 15 C50 15, 50 20, 50 20 C50 20, 50 15, 55 15 C70 15, 80 25, 80 40 C80 60, 50 85, 50 85 Z"
          fill="none"
          stroke="#dc2626"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M35 65 C35 70, 40 75, 50 75 C60 75, 65 70, 65 65"
          fill="none"
          stroke="#dc2626"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <circle cx="50" cy="35" r="8" fill="#1e40af" />

        <path
          d="M50 43 C50 43, 45 55, 45 65 C45 65, 50 70, 50 70 C50 70, 55 65, 55 65 C55 55, 50 43, 50 43 Z"
          fill="#1e40af"
        />
        <path
          d="M42 45 C38 40, 35 35, 35 30"
          fill="none"
          stroke="#1e40af"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M58 45 C62 40, 65 35, 65 30"
          fill="none"
          stroke="#1e40af"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function VolunteerText({ className = "", size = "md" }) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  return (
    <span
      className={`font-bold text-foreground ${sizeClasses[size]} ${className}`}
    >
      VOLUNTEER
    </span>
  );
}

export function VolunteerLogoWithText({
  className = "",
  logoSize = "md",
  textSize = "md",
  showText = true,
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <VolunteerLogo size={logoSize} />
      {showText && <VolunteerText size={textSize} />}
    </div>
  );
}

export default VolunteerLogoWithText;
