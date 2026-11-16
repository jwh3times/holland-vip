import React from "react";
import { accent } from "@/lib/accent";
import { cn } from "@/lib/utils";

function BentoGrid({
  className,
  children,
  ref,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
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

function BentoGridItem({
  className,
  title,
  description,
  icon,
  ref,
  ...props
}: Omit<React.HTMLAttributes<HTMLDivElement>, "title"> & {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  icon?: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      className={cn(
        "row-span-1 rounded-3xl group/bento hover:shadow-2xl transition-all duration-300 shadow-lg/60 dark:shadow-none p-6 bento-card-bg border border-line backdrop-blur-md min-h-[20rem] flex flex-col",
        className
      )}
      {...props}
    >
      <div className="group-hover/bento:translate-x-1 transition duration-300 text-body flex-grow flex flex-col gap-4">
        {icon && (
          <div
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-2xl ring-1 flex-shrink-0",
              accent.blue.iconChip
            )}
          >
            {icon}
          </div>
        )}
        <div className="font-sans font-bold text-lg text-heading flex-shrink-0">{title}</div>
        <div className="font-sans text-sm leading-relaxed text-muted flex-grow overflow-hidden">
          {description}
        </div>
      </div>
    </div>
  );
}

export { BentoGrid, BentoGridItem };
