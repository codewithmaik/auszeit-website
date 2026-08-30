export default function Eyebrow({ children, style }: { children: string; style?: React.CSSProperties }) {
  return (
    <span
      className="block font-sans text-[calc(0.72rem+3px)] tracking-[0.22em] uppercase text-gold underline underline-offset-4 mb-[0.9em]"
      style={style}
    >
      {children}
    </span>
  );
}
