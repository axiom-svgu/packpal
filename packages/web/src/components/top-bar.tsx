import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationPopover } from "@/components/notifications/notification-popover";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AppSidebar } from "@/components/app-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Define the application pages and their details
const pages = [
  {
    title: "Dashboard",
    url: "/dashboard",
    keywords: ["home", "main", "overview"],
  },
  { title: "Members", url: "/members", keywords: ["users", "team", "people"] },
  {
    title: "To Pack",
    url: "/to-pack",
    keywords: ["items", "packing", "prepare"],
  },
  { title: "Packed", url: "/packed", keywords: ["ready", "completed", "done"] },
  { title: "Delivered", url: "/delivered", keywords: ["shipped", "sent"] },
  {
    title: "Packing Lists",
    url: "/packing-lists",
    keywords: ["inventory", "lists"],
  },
  {
    title: "Assign Items",
    url: "/assign-items",
    keywords: ["allocate", "distribute"],
  },
  {
    title: "Manage Roles",
    url: "/manage-roles",
    keywords: ["permissions", "access"],
  },
  {
    title: "Create Event/Trip",
    url: "/create-event",
    keywords: ["new", "plan", "schedule"],
  },
  { title: "Settings", url: "/settings", keywords: ["preferences", "config"] },
  {
    title: "Notifications",
    url: "/notifications",
    keywords: ["alerts", "messages"],
  },
  { title: "Profile", url: "/profile", keywords: ["account", "user"] },
  {
    title: "Manage Categories",
    url: "/manage-categories",
    keywords: ["groups", "types", "classify"],
  },
  { title: "My Items", url: "/my-items", keywords: ["personal", "assigned"] },
  {
    title: "Suggest Items",
    url: "/suggest-items",
    keywords: ["recommend", "propose"],
  },
];

export function TopBar() {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [showSearch, setShowSearch] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "U";

  // Handle search open keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle navigation to the selected page
  const handleSelect = (url: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate(url);
  };

  const SearchComponent = (
    <div
      className={cn(
        "flex items-center w-full max-w-md relative transition-all duration-200",
        {
          "opacity-0 pointer-events-none w-0": isMobile && !showSearch,
          "opacity-100 pointer-events-auto": !isMobile || showSearch,
        }
      )}
    >
      <Popover open={searchOpen} onOpenChange={setSearchOpen}>
        <PopoverTrigger asChild>
          <div className="w-full relative">
            <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="Search (⌘+K)..."
              className="pl-8 rounded-full bg-muted/50 border-none focus-visible:ring-1"
              onClick={() => setSearchOpen(true)}
              readOnly
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[300px] md:w-[500px]" align="center">
          <Command>
            <CommandInput
              placeholder="Search pages..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              autoFocus
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Pages">
                {pages
                  .filter(
                    (page) =>
                      page.title
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      page.keywords.some((keyword) =>
                        keyword
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                  )
                  .map((page) => (
                    <CommandItem
                      key={page.url}
                      onSelect={() => handleSelect(page.url)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span>{page.title}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );

  const MobileSearchToggle = isMobile && (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setShowSearch(!showSearch)}
      className="md:hidden"
    >
      {showSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
    </Button>
  );
  return (
    <div className="w-full flex justify-center bg-white shadow-sm">
      <header className="w-full max-w-7xl flex h-16 shrink-0 items-center justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-700">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <AppSidebar />
              </SheetContent>
            </Sheet>
          </div>

          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6 text-primary" />
            <span className="hidden sm:inline-block text-gray-800 text-lg">
              PackPal
            </span>
          </Link>
        </div>

        <div className="flex-1 max-w-md mx-4">{SearchComponent}</div>

        <div className="flex items-center gap-3">
          {MobileSearchToggle}

          <NotificationPopover />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full p-0"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link to="/profile">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  Profile
                </DropdownMenuItem>
              </Link>
              <Link to="/settings">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-500"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </div>
  );
}
