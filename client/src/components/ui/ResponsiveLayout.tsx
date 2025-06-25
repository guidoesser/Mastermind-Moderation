export function ResponsiveLayout({ children, className }: ResponsiveLayoutProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 max-w-7xl",
        className
      )}
      style={{ paddingLeft: '1rem', paddingRight: '1rem' }}
    >
      {children}
    </div>
  );
}
