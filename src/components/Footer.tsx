import { Link } from "~/i18n/navigation";

export default function Footer() {
  return (
    <footer className="text-muted-foreground mt-auto w-full py-4 text-sm">
      <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center md:flex-row">
        <p>&copy; {new Date().getFullYear()} Mindclip. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:underline">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
