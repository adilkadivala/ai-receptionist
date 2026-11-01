"use client";

import { cn } from "@receptionist/ui/lib/utils";
import { motion } from "motion/react";
import { type KeyboardEvent, useRef, useState } from "react";
import { dashboardPreview, type PreviewPage, previewPages } from "@/content/dashboard-preview";
import { previewPageViews } from "./dashboard-preview-pages";
import { LiveDot } from "./live-dot";

const { business, firstPage, status } = dashboardPreview;

/**
 * The hero's product shot: the dashboard's tab bar and one of its pages, drawn in HTML with sample data. The tabs
 * work (click, or the arrow keys once one has focus) and swap the page below with a quick crossfade. Every page is
 * laid out in the same grid cell, so the frame is as tall as the tallest and the hero never jumps.
 */
export function DashboardPreview() {
  const [current, setCurrent] = useState<PreviewPage>(firstPage);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  // The tabs pattern: arrows move to the next or previous tab and show it, Home and End jump to the ends.
  function onKeyDown(event: KeyboardEvent, index: number) {
    const last = previewPages.length - 1;
    const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const target = (next + previewPages.length) % previewPages.length;
    const page = previewPages[target];
    if (page) setCurrent(page);
    tabs.current[target]?.focus();
  }

  return (
    <figure>
      <figcaption className="sr-only">Example of the dashboard, with sample data. Pick a page to see it.</figcaption>
      <div
        role="tablist"
        aria-label="Dashboard pages"
        className="inline-flex flex-wrap justify-center gap-0.5 rounded-[12px] bg-card p-1 shadow-[0_8px_24px_-12px_color-mix(in_oklch,var(--foreground)_35%,transparent)]"
      >
        {previewPages.map((page, index) => {
          const selected = page === current;
          return (
            <button
              key={page}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`preview-tab-${index}`}
              aria-selected={selected}
              aria-controls={`preview-page-${index}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setCurrent(page)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                "relative inline-flex h-8 items-center rounded-[9px] px-3 text-[13px] text-foreground/70 transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                selected && "font-medium text-foreground",
              )}
            >
              {/* The highlight slides from tab to tab. */}
              {selected && (
                <motion.span
                  layoutId="preview-tab"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  className="absolute inset-0 rounded-[9px] bg-hero"
                />
              )}
              <span className="relative">{page}</span>
            </button>
          );
        })}
      </div>

      <div className="mx-auto mt-7 max-w-[1060px] rounded-t-[20px] border border-b-0 border-primary-foreground/30 bg-primary-foreground/15 p-2.5 pb-0">
        <div className="overflow-hidden rounded-t-[12px] bg-card text-start">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-[18px] py-3.5">
            <p className="flex items-center gap-2.5">
              <span className="text-sm font-semibold">{business}</span>
              <span className="hidden text-[13px] text-muted-foreground sm:inline">{current}</span>
            </p>
            <span className="inline-flex h-6.5 shrink-0 items-center gap-1.5 rounded-full bg-success-soft px-2.5 text-xs font-medium whitespace-nowrap text-success-foreground">
              <LiveDot />
              {status}
            </span>
          </div>

          <div className="grid">
            {previewPages.map((page, index) => {
              const View = previewPageViews[page];
              const active = page === current;
              return (
                <div
                  key={page}
                  role="tabpanel"
                  id={`preview-page-${index}`}
                  aria-labelledby={`preview-tab-${index}`}
                  tabIndex={active ? 0 : -1}
                  className={cn(
                    "col-start-1 row-start-1 outline-none transition-[opacity,visibility] duration-300 ease-out focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
                    active ? "visible opacity-100" : "invisible opacity-0",
                  )}
                >
                  <View />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </figure>
  );
}
