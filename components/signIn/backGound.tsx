"use client";
import { cn } from "@/utils/cn";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "transition-bg relative flex h-[100vh] flex-col items-center justify-center bg-zinc-50 text-slate-950 dark:bg-zinc-900",
          className,
        )}
        {...props}
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={
            {
              "--aurora":
                "repeating-linear-gradient(100deg,#8b5cf6_0%,#8b5cf6_7%,#8b5cf6_10%,var(--transparent)_12%,#8b5cf6_16%)",
              "--dark-gradient":
                "repeating-linear-gradient(100deg,#8b5cf6_10%,#8b5cf6_7%,var(--transparent)_10%,var(--transparent)_12%,#8b5cf6_16%)",
              "--white-gradient":
                "repeating-linear-gradient(12deg,#fff_10%,#fff_7%,transparent_10%,transparent_12%,#fff_16%)",

              "--orange-300": "#fdba74",
              "--orange-400": "#fb923c",
              "--orange-500": "#f97316",
              "--indigo-300": "#a5b4fc",
              "--violet-200": "#1c1917",
              "--black": "#1D1D1F",
              "--white": "#fff",
              "--transparent": "transparent",
            } as React.CSSProperties
          }
        >
          <div
            //   I'm sorry but this is what peak developer performance looks like // trigger warning
            className={cn(
              `after:animate-aurora pointer-events-none absolute opacity-[25%] -inset-[19px] [background-image:var(--white-gradient),var(--aurora)] [background-size:300%,_60%] [background-position:50%_50%,50%_50%] blur-[12px] invert filter will-change-transform [--aurora:repeating-linear-gradient(100deg,#fc7348_20%,#fc7348_15%,var(--orange-300)_20%,var(--violet-200)_25%,var(--orange-400)_30%)] [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)] [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] after:[background-size:200%,_100%] after:[background-attachment:fixed] after:mix-blend-difference after:content-[""] dark:[background-image:var(--dark-gradient),var(--aurora)] dark:invert-0 after:dark:[background-image:var(--dark-gradient),var(--aurora)]`,

              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_130%_0%,black_0%,var(--transparent)_70%)]`,
            )}
          ></div>
        </div>
        {children}
      </div>
    </main>
  );
};
