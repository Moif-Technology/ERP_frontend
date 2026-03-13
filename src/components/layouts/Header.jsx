import React from "react";
import { colors, borderRadius, typography } from "../../constants/theme";
import SearchIcon from "../../assets/iconsax-search.svg";
import AdminIcon from "../../assets/Group 1.svg";

export default function Header() {
  return (
    <header
      style={{
            position: "fixed",       // <-- fixed
            top: 0,
    left: 0,
    right: 0,
        height: "30px",
        width: "100%",
        background: colors.surface,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        boxShadow: "0 3px 10px rgba(0, 0, 0, 0.12)", // stronger, more noticeable shadow
        fontFamily: typography.fontFamily.sans,
        fontSize: "0.82rem",           // ← base text size reduced
        color: colors.neutral[700],
        zIndex: 1000,
      }}
    >
      {/* Left - Logo */}
      <div
        style={{
          fontWeight: "600",
          fontSize: "0.95rem",         // smaller logo
          letterSpacing: "-0.3px",
          whiteSpace: "nowrap",
        }}
      >
        logo
      </div>

      {/* Center - Search */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: "340px",
            maxWidth: "100%",
            height: "22px",
            display: "flex",
            alignItems: "center",
            background: colors.input.background,
            border: `1px solid ${colors.neutral[300]}`,
            borderRadius: borderRadius.full,
            padding: "0 9px",
          }}
        >
          <img
            src={SearchIcon}
            alt="Search"
            style={{ width: "13px", height: "13px", marginRight: "7px" }}
          />

          <input
            type="text"
            placeholder="Search here"
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              width: "100%",
              fontSize: "0.78rem",       // ← even smaller inside input
              color: colors.neutral[600],
              padding: "0",
            }}
          />
        </div>
      </div>

      {/* Right Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          fontSize: "0.rem",          // ← smaller text
          color: colors.neutral[600],
        }}
      >
        <span>Station : 10</span>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "3px 9px",
            border: `1px solid ${colors.neutral[300]}`,
            borderRadius: borderRadius.full,
            background: colors.neutral[50],
            fontWeight: "400",
            fontSize: "0.60rem",
          }}
        >
          <img
            src={AdminIcon}
            alt="Admin"
            style={{ width: "16px", height: "16px" }}
          />
          <span>ADMIN</span>
        </div>

        <span style={{ cursor: "pointer", fontSize: "14px" }}>⋮</span>
      </div>
    </header>
  );
}