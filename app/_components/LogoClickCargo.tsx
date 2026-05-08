import Image from "next/image";
import iconImg from "@/app/assets/icon-bg-transparent.png";

export default function LogoClickCargo({ size = 42 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <Image src={iconImg} alt="ClickCargo" width={size} height={size} />
      <div className="flex flex-col leading-none">
        <span className="font-bold tracking-wide" style={{ fontSize: "1.05rem", letterSpacing: "0.04em" }}>
          <span style={{ color: "#2DD4BF" }}>CLICK</span>
          <span className="text-white">CARGO</span>
        </span>
        <span
          className="uppercase tracking-widest"
          style={{ fontSize: "0.52rem", color: "#2DD4BF", opacity: 0.75, marginTop: "2px" }}
        >
          Red integral de cargas
        </span>
      </div>
    </div>
  );
}
