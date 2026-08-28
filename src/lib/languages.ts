export type LanguageOption = {
  /** Value sent to the AI as the translation target. */
  name: string;
  /** Label shown to the user, in that language. */
  label: string;
  /** BCP-47 primary subtags that should map to this language. */
  codes: string[];
};

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { name: "English", label: "English", codes: ["en"] },
  { name: "Spanish", label: "Español", codes: ["es"] },
  { name: "French", label: "Français", codes: ["fr"] },
  { name: "German", label: "Deutsch", codes: ["de"] },
  { name: "Italian", label: "Italiano", codes: ["it"] },
  { name: "Portuguese", label: "Português", codes: ["pt"] },
  { name: "Dutch", label: "Nederlands", codes: ["nl"] },
  { name: "Polish", label: "Polski", codes: ["pl"] },
  { name: "Russian", label: "Русский", codes: ["ru"] },
  { name: "Turkish", label: "Türkçe", codes: ["tr"] },
  { name: "Arabic", label: "العربية", codes: ["ar"] },
  { name: "Hindi", label: "हिन्दी", codes: ["hi"] },
  { name: "Japanese", label: "日本語", codes: ["ja"] },
  { name: "Korean", label: "한국어", codes: ["ko"] },
  {
    name: "Chinese (Simplified)",
    label: "简体中文",
    codes: ["zh", "zh-cn", "zh-hans", "zh-sg"],
  },
  {
    name: "Chinese (Traditional)",
    label: "繁體中文",
    codes: ["zh-tw", "zh-hk", "zh-hant", "zh-mo"],
  },
  { name: "Thai", label: "ไทย", codes: ["th"] },
  { name: "Vietnamese", label: "Tiếng Việt", codes: ["vi"] },
  { name: "Indonesian", label: "Bahasa Indonesia", codes: ["id", "in"] },
];

export const DEFAULT_LANGUAGE = "English";

const LANGUAGE_STORAGE_KEY = "mv:target-language";

function matchLocale(locale: string): string | null {
  const lower = locale.toLowerCase();
  const primary = lower.split("-")[0];

  // Exact / region-specific match first (matters for zh-TW vs zh-CN).
  for (const option of LANGUAGE_OPTIONS) {
    if (option.codes.some((code) => code === lower)) return option.name;
  }
  for (const option of LANGUAGE_OPTIONS) {
    if (option.codes.some((code) => code === primary)) return option.name;
  }
  return null;
}

/** Language names the app supports, for validation. */
export function isSupportedLanguage(value: unknown): value is string {
  return (
    typeof value === "string" && LANGUAGE_OPTIONS.some((o) => o.name === value)
  );
}

/**
 * Resolve the translation language for this visitor: a previously saved
 * choice wins, otherwise we detect from the browser/device locale, and
 * English is the fallback. Browser-only — call from useEffect.
 */
export function resolveDefaultLanguage(): string {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;

  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isSupportedLanguage(saved)) return saved;
  } catch {
    // localStorage can be blocked; fall through to detection.
  }

  const locales: string[] = [
    ...(Array.isArray(navigator.languages) ? navigator.languages : []),
    navigator.language,
  ].filter(Boolean) as string[];

  for (const locale of locales) {
    const match = matchLocale(locale);
    if (match) return match;
  }
  return DEFAULT_LANGUAGE;
}

export function saveLanguagePreference(language: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore storage failures — the in-memory choice still applies.
  }
}
