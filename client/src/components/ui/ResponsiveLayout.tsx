import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveLayout({ children, className }: ResponsiveLayoutProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-7xl",
        className
      )}
    >
      {children}
    </div>
  );
}