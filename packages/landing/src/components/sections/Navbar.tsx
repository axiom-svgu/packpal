import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  return (
    <nav className="container mx-auto flex items-center justify-between py-4 px-4">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <div className="font-bold text-lg flex items-center gap-2">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Scaffold
        </div>

        {/* Navigation Links */}
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  "cursor-pointer flex items-center gap-1"
                )}
              >
                Product <ChevronDown className="w-4 h-4" />
              </NavigationMenuLink>
              {/* Dropdown/Megamenu content would go here */}
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Why us
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                About us
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Cases
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Blog
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex items-center gap-4">
        {/* Book a Demo Button */}
        <Button
          variant="outline"
          onClick={() =>
            (window.location.href = "https://packpal-app.axiomclub.tech")
          }
        >
          Dashboard
        </Button>
      </div>
    </nav>
  );
}
