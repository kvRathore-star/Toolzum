"use client";

import React, { type ComponentProps, useEffect, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyModule = Record<string, any>;

let motionPromise: Promise<AnyModule> | null = null;
async function getMotion(): Promise<AnyModule> {
  if (!motionPromise) motionPromise = import("framer-motion");
  return motionPromise;
}

function LazyAnimatePresence({ children, ...props }: ComponentProps<any>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [Mod, setMod] = useState<AnyModule | null>(null);
  useEffect(() => { getMotion().then(setMod); }, []);
  if (!Mod) return <>{children}</>;
  return <Mod.AnimatePresence {...props}>{children}</Mod.AnimatePresence>;
}

function LazyMotionDiv({ children, ...props }: ComponentProps<"div"> & { initial?: any; animate?: any; exit?: any; transition?: any; onMouseEnter?: any; onMouseLeave?: any; onFocus?: any; onBlur?: any; ref?: any }) {
  const [MotionDiv, setMotionDiv] = useState<any>(null);
  useEffect(() => { getMotion().then(m => setMotionDiv(() => m.motion.div)); }, []);
  if (!MotionDiv) return <div {...props}>{children}</div>;
  return <MotionDiv {...props}>{children}</MotionDiv>;
}

export { LazyAnimatePresence as AnimatePresence, LazyMotionDiv as MotionDiv };
