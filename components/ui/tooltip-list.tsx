// components/ui/tooltip-list.tsx
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Item = {
    id: React.Key;
    name: React.ReactNode;
    score?: number | null;
};

type TooltipListProps = {
    items: Item[];
    children: React.ReactNode;
    className?: string;
};

export function TooltipList({ items, children, className }: TooltipListProps) {
    if (!items.length) return <>{children}</>;

    return (
        <TooltipProvider>
            <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent
                    className={cn(
                        "max-w-md p-3 bg-background border rounded-md shadow-lg",
                        "max-h-[60vh] overflow-y-auto scrollbar-thin",
                        className
                    )}
                    side="top"
                    align="start"
                >
                    <div className="space-y-1.5">
                        {items.map((it) => (
                            <div key={it.id} className="text-sm">
                                <span className="font-medium">{it.name}</span>
                                {it.score != null && (
                                    <span className="text-muted-foreground ml-2">
                                        ({it.score.toFixed(2)})
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}