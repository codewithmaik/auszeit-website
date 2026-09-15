export default function Eyebrow({
  children,
  style,
  tone = "light",
}: {
  children: string;
  style?: React.CSSProperties;
  /** "light" = auf hellem Grund (Standard), "dark" = auf --color-forest (z. B. PageHero) —
   * ein einzelner Gold-Ton kommt auf keinem der beiden Hintergründe auf die von
   * WCAG AA geforderten 4.5:1 Kontrast, siehe --color-gold-ink/--color-gold-bright. */
  tone?: "light" | "dark";
}) {
  return (
    <span
      className={`block font-sans text-[calc(0.72rem+3px)] tracking-[0.22em] uppercase underline underline-offset-4 mb-[0.9em] ${
        tone === "dark" ? "text-gold-bright" : "text-gold-ink"
      }`}
      style={style}
    >
      {children}
    </span>
  );
}
