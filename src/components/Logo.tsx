import Image from "next/image";

export function Logo() {
  return (
    <Image
      src="/mindclip_logo.png"
      alt="Mindclip Logo"
      fill
      className="object-contain"
    />
  );
}
