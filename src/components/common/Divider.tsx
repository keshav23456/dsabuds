interface DividerProps {
  orientation?: "horizontal" | "vertical";
  text?: string;
  className?: string;
}

export const Divider = ({
  orientation = "horizontal",
  text,
  className = "",
}: DividerProps) => {
  if (orientation === "vertical") {
    return <div className={`w-0.5 bg-neutral-800 ${className}`} />;
  }

  if (text) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="flex-1 h-0.5 bg-neutral-800" />
        <span className="text-sm text-content">{text}</span>
        <div className="flex-1 h-0.5 bg-neutral-800" />
      </div>
    );
  }

  return <div className={`w-full h-0.5 bg-neutral-800 ${className}`} />;
};
