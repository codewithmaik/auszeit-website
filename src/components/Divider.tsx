export default function Divider({ center = false }: { center?: boolean }) {
  return (
    <hr
      className={`w-[46px] h-px bg-gold border-none my-[18px] ${center ? "mx-auto" : ""}`}
    />
  );
}
