export default function Eyebrow({ children }: { children: string }) {
  return (
    <span className="block font-sans text-[0.72rem] tracking-[0.22em] uppercase text-gold mb-[0.9em]">
      {children}
    </span>
  );
}
