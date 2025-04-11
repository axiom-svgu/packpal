import { Package, Github } from "lucide-react";

const socialLinks = [
  {
    icon: Github,
    href: "https://github.com/axiom-svgu/packpal",
    label: "View our GitHub repository",
  },
];

export default function Footer() {
  return (
    <footer className="border-t bg-secondary/10">
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Logo and brand */}
          <div className="flex items-center gap-2">
            <Package className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl">PackPal</span>
          </div>

          {/* Description */}
          <p className="text-muted-foreground max-w-md">
            Streamline your group packing and logistics with smart checklists
            and real-time collaboration.
          </p>

          {/* Social Links */}
          <div className="flex gap-6">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index}
                  href={social.href}
                  className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-secondary/50 rounded-full"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                >
                  <Icon className="size-5" />
                </a>
              );
            })}
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PackPal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
