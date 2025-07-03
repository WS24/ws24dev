/**
 * Separator Component
 * 
 * A simple horizontal separator line.
 * 
 * @module Separator
 */

import React from "react";
import { cn } from "@/lib/utils";

interface SeparatorProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

/**
 * Separator component for visual division
 * 
 * @param props - Component props
 * @returns JSX element containing the separator
 */
export function Separator({ className, orientation = "horizontal" }: SeparatorProps) {
  return (
    <div
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
    />
  );
}

export default Separator;
