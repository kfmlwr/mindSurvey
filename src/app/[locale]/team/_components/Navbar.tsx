"use client";

import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";
import LocaleSwitch from "~/components/LanguageSwitch";
import { Logo } from "~/components/Logo";
import { ThemeToggle } from "~/components/ThemeToggle";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "~/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { usePathname, useRouter } from "~/i18n/navigation";

interface NavItem {
  name: string;
  link: string;
}

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Navbar");

  const NAV_ITEMS = [{ name: t("teamOverview"), link: "/team" }];

  const activeItem =
    NAV_ITEMS.find((item) => pathname.startsWith(item.link))?.name ?? "Team";

  const indicatorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = document.querySelector(
        `[data-nav-item="${activeItem}"]`,
      )!;

      if (activeEl && indicatorRef.current && menuRef.current) {
        const menuRect = menuRef.current.getBoundingClientRect();
        const itemRect = activeEl.getBoundingClientRect();

        indicatorRef.current.style.width = `${itemRect.width}px`;
        indicatorRef.current.style.left = `${itemRect.left - menuRect.left}px`;
      }
    };
    updateIndicator();
    window.addEventListener("resize", updateIndicator);

    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeItem]);

  return (
    <section className="md:py-4">
      <nav className="mx-auto flex max-w-7xl items-center justify-between md:px-6">
        {/* Left WordMark */}
        <div className="relative -ml-2 h-16 w-32">
          <Logo />
        </div>

        <NavigationMenu className="hidden lg:block">
          <NavigationMenuList
            ref={menuRef}
            className="flex items-center gap-6 rounded-4xl px-8 py-3"
          >
            {NAV_ITEMS.map((item) => (
              <NavigationMenuItem key={item.name}>
                <NavigationMenuLink
                  data-nav-item={item.name}
                  onClick={() => router.push(item.link)}
                  className={`relative cursor-pointer font-medium hover:bg-transparent ${
                    activeItem === item.name
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.name}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
            {/* Active Indicator */}
            <div
              ref={indicatorRef}
              className="absolute bottom-2 flex h-1 items-center justify-center px-2 transition-all duration-300"
            >
              <div className="bg-foreground h-0.5 w-full rounded-t-none transition-all duration-300" />
            </div>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Menu Popover */}
        <MobileNav activeItem={activeItem} navItems={NAV_ITEMS} />

        <div className="hidden items-center gap-2 lg:flex">
          <LocaleSwitch />
          <ThemeToggle />
        </div>
      </nav>
    </section>
  );
};

const AnimatedHamburger = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <div className="group relative h-6 w-6">
      <div className="absolute inset-0">
        <Menu
          className={`text-muted-foreground group-hover:text-foreground absolute transition-all duration-300 ${
            isOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
          }`}
        />
        <X
          className={`text-muted-foreground group-hover:text-foreground absolute transition-all duration-300 ${
            isOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
          }`}
        />
      </div>
    </div>
  );
};

const MobileNav = ({
  activeItem,
  navItems,
}: {
  activeItem: string;
  navItems: NavItem[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="block lg:hidden">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger>
          <AnimatedHamburger isOpen={isOpen} />
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="relative block w-screen max-w-md overflow-hidden rounded-xl p-0 lg:hidden"
        >
          <ul className="bg-background text-foreground w-full py-4">
            {navItems.map((navItem, idx) => (
              <li key={idx}>
                <a
                  href={navItem.link}
                  onClick={() => router.push(navItem.link)}
                  className={`text-foreground flex items-center border-l-[3px] px-6 py-4 text-sm font-medium transition-all duration-75 ${
                    activeItem === navItem.name
                      ? "border-foreground text-foreground"
                      : "text-muted-foreground hover:text-foreground border-transparent"
                  }`}
                >
                  {navItem.name}
                </a>
              </li>
            ))}
            <li className="flex flex-col px-7 py-2">
              <LocaleSwitch className="w-full" />
            </li>
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
};
