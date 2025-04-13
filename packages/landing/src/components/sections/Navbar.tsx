import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Menu, Package, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  return (
    <nav className="container mx-auto flex items-center justify-between py-4 px-4">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <div
          className="font-bold text-lg flex items-center gap-2 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Package className="w-6 h-6 text-primary" />
          PackPal
        </div>

        {/* Desktop Navigation Links */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle() + " cursor-pointer"}
                onClick={() => scrollToSection("features")}
              >
                Features
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle() + " cursor-pointer"}
                onClick={() => scrollToSection("testimonials")}
              >
                Testimonials
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle() + " cursor-pointer"}
                onClick={() => scrollToSection("cta")}
              >
                Get Started
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Desktop Buttons */}
      <div className="hidden md:flex items-center gap-4">
        <Button
          onClick={() =>
            (window.location.href = "https://packpal-app.axiomclub.tech/login")
          }
        >
          Sign Up
        </Button>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[350px]">
            <div className="flex flex-col gap-8 py-4">
              <div className="flex justify-between items-center">
                <div className="font-bold text-lg flex items-center gap-2">
                  <Package className="w-6 h-6 text-primary" />
                  PackPal
                </div>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetClose>
              </div>

              <div className="flex flex-col gap-6">
                <Button
                  variant="ghost"
                  className="justify-start px-2"
                  onClick={() => scrollToSection("features")}
                >
                  Features
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start px-2"
                  onClick={() => scrollToSection("testimonials")}
                >
                  Testimonials
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start px-2"
                  onClick={() => scrollToSection("cta")}
                >
                  Get Started
                </Button>
              </div>

              <Button
                className="mt-4"
                onClick={() =>
                  (window.location.href =
                    "https://packpal-app.axiomclub.tech/login")
                }
              >
                Sign Up
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
