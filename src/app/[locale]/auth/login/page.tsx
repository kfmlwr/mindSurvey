import LocaleSwitch from "~/components/LanguageSwitch";
import { ThemeToggle } from "~/components/ThemeToggle";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LocaleSwitch />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
