// src/components/ui/scrollable-list.tsx
import { cn } from "@/lib/utils";

type ScrollableListProps = {
    items: Array<{ id: React.Key; name: React.ReactNode; score?: number | null }>;
    className?: string;
};

export function ScrollableList({ items, className }: ScrollableListProps) {
    return (
        <div
            className={cn(
                "max-h-20 overflow-y-auto scrollbar-thin pr-2 space-y-1",
                className
            )}
        >
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
    );
}