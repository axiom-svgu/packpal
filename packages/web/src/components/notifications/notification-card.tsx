import { format, formatDistanceToNow } from "date-fns";
import { CheckCircle, Info, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notification } from "@/services/NotificationService";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type NotificationCardProps = {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
};

export function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationCardProps) {
  const { id, message, type, isRead, createdAt } = notification;

  const getTypeIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <XCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const formattedDate = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
  });

  const fullDate = format(new Date(createdAt), "PPpp");

  return (
    <div
      className={`flex items-start gap-3 rounded-md p-3 transition-colors ${
        isRead ? "bg-background" : "bg-accent/10"
      }`}
    >
      <div className="mt-1 flex-shrink-0">{getTypeIcon()}</div>
      <div className="flex-1 space-y-1">
        <p
          className={`text-sm ${
            isRead ? "text-muted-foreground" : "font-medium"
          }`}
        >
          {message}
        </p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-xs text-muted-foreground">{formattedDate}</p>
            </TooltipTrigger>
            <TooltipContent>
              <p>{fullDate}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex gap-1">
        {!isRead && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onMarkAsRead(id)}
            className="h-7 w-7"
            aria-label="Mark as read"
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(id)}
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          aria-label="Delete notification"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
