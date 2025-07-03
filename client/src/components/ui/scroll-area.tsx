/**
 * ScrollArea Component
 * 
 * A simple scrollable area component using native scrolling.
 * 
 * @module ScrollArea
 */

import React from "react";
import { cn } from "@/lib/utils";

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * ScrollArea component for scrollable content
 * 
 * @param props - Component props
 * @returns JSX element containing the scrollable area
 */
export function ScrollArea({ children, className }: ScrollAreaProps) {
  return (
    <div className={cn("overflow-auto", className)}>
      {children}
    </div>
  );
}

export default ScrollArea;
