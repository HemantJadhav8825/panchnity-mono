"use client";

import React, { useMemo } from "react";
import { IllustrationType, IllustrationProps } from "./types";
import { registry } from "./registry";
import { cn } from "@/lib/utils";

interface IllustrationGatekeeperProps extends IllustrationProps {
  type: IllustrationType;
}

/**
 * Illustration component
 * Usage: <Illustration type="auth-welcome" />
 */
export const Illustration: React.FC<IllustrationGatekeeperProps> = ({
  type,
  className,
  size,
  priority = false,
}) => {
  const Component = useMemo(() => registry[type], [type]);

  if (!Component) {
    console.warn(`[IllustrationSystem] Unknown illustration type: ${type}`);
    return null;
  }

  return (
    <div 
      className={cn("relative flex items-center justify-center overflow-hidden", className)}
      style={{ width: size, height: size }}
    >
      <Component size="100%" priority={priority} />
    </div>
  );
};
