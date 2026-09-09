"use client";

import React, { type ComponentProps, useEffect, useState } from "react";
import type { AnimatePresence as AnimatePresenceComponent, MotionProps } from "framer-motion";

type MotionModule = typeof import("framer-motion");

let motionPromise: Promise<MotionModule> | null = null;
async function getMotion(): Promise<MotionModule> {
  if (!motionPromise) motionPromise = import("framer-motion");
  return motionPromise;
}

function LazyAnimatePresence({ children, ...props }: ComponentProps<typeof AnimatePresenceComponent>) {
  const [Mod, setMod] = useState<MotionModule | null>(null);
  useEffect(() => { getMotion().then(setMod); }, []);
  if (!Mod) return <>{children}</>;
  return <Mod.AnimatePresence {...props}>{children}</Mod.AnimatePresence>;
}

function LazyMotionDiv({ children, ...props }: ComponentProps<"div"> & MotionProps) {
  const [MotionDiv, setMotionDiv] = useState<MotionModule["motion"]["div"] | null>(null);
  useEffect(() => { getMotion().then(m => setMotionDiv(() => m.motion.div)); }, []);
  if (!MotionDiv) return <div {...props}>{children}</div>;
  return <MotionDiv {...props}>{children}</MotionDiv>;
}

export { LazyAnimatePresence as AnimatePresence, LazyMotionDiv as MotionDiv };
