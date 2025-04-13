import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { Wifi, WifiOff } from "lucide-react";

interface RealtimeStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  showBadge?: boolean;
  showIcon?: boolean;
  compact?: boolean;
}

export function RealtimeStatus({
  showBadge = true,
  showIcon = true,
  compact = false,
  className,
  ...props
}: RealtimeStatusProps) {
  // Static component with no hooks - this will prevent infinite loops
  const connected = false;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2", className)} {...props}>
            {showIcon && (
              <div className="flex items-center">
                {connected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-gray-400" />
                )}
              </div>
            )}

            {showBadge && !compact && (
              <Badge
                variant={connected ? "default" : "secondary"}
                className={cn("text-xs", connected ? "bg-green-500" : "")}
              >
                {connected ? "Real-time Connected" : "Disabled"}
              </Badge>
            )}

            {showBadge && compact && (
              <Badge
                variant={connected ? "default" : "secondary"}
                className={cn("text-xs", connected ? "bg-green-500" : "")}
              >
                {connected ? "RT" : "Disabled"}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>Real-time updates temporarily disabled</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
