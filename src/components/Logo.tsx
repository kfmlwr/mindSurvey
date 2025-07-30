import Image from "next/image";

export function Logo() {
  return (
    <>
      <Image
        src="/mindclip_logo.png"
        alt="Mindclip Logo"
        fill
        className="object-contain dark:hidden"
      />
      <Image
        src="/mindclip_logo_dark.png"
        alt="Mindclip Logo"
        fill
        className="hidden object-contain dark:block"
      />
    </>
  );
}
