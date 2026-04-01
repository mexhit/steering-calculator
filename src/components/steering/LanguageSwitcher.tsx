"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Language } from "@/locales/translations";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const buttonStyle = (isActive: boolean): React.CSSProperties => ({
    background: isActive ? "var(--accent)" : "var(--surface2)",
    color: isActive ? "#fff" : "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: 6,
    padding: "4px 8px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  });

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        onClick={() => setLanguage("en")}
        style={buttonStyle(language === "en")}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("sq")}
        style={buttonStyle(language === "sq")}
      >
        SQ
      </button>
    </div>
  );
}
