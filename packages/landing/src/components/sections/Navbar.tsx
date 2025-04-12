import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Package } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="container mx-auto flex items-center justify-between py-4 px-4">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <div className="font-bold text-lg flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" />
          PackPal
        </div>

        {/* Navigation Links */}
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Features
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Use Cases
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Pricing
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Help
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={() =>
            (window.location.href = "https://packpal-app.axiomclub.tech/login")
          }
        >
          Sign Up
        </Button>
      </div>
    </nav>
  );
}
