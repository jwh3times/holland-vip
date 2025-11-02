import React from "react";
import { cn } from "@/lib/utils";

const BentoGrid = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "grid md:grid-rows-[auto] grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto transition-colors duration-300",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
BentoGrid.displayName = "BentoGrid";

const BentoGridItem = React.forwardRef<
  HTMLDivElement,
  {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    icon?: React.ReactNode;
  }
>(({ className, title, description, icon }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "row-span-1 rounded-3xl group/bento hover:shadow-2xl transition-all duration-300 shadow-lg/60 dark:shadow-none p-6 bento-card-bg border border-white/70 dark:border-slate-700/60 backdrop-blur-md min-h-[20rem] flex flex-col",
        className
      )}
    >
      <div className="group-hover/bento:translate-x-1 transition duration-300 text-body flex-grow flex flex-col gap-4">
        {icon && (
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-300 dark:bg-blue-500/15 ring-1 ring-blue-500/20 dark:ring-blue-500/25 flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="font-sans font-bold text-lg text-heading flex-shrink-0">
          {title}
        </div>
        <div className="font-sans text-sm leading-relaxed text-muted flex-grow overflow-hidden">
          {description}
        </div>
      </div>
    </div>
  );
});
BentoGridItem.displayName = "BentoGridItem";

export { BentoGrid, BentoGridItem };


