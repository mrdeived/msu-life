"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function NavigationProgress() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const [visible, setVisible] = useState(false);

  // Show bar when any internal link is clicked
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      // Only internal, non-hash links
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      // Don't show if navigating to the same page
      if (href === pathname) return;
      setVisible(true);
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname]);

  // Hide bar when navigation completes (pathname changes)
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      setVisible(false);
    }
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-msu-red/20 overflow-hidden pointer-events-none">
      <div className="absolute h-full w-2/5 bg-msu-red rounded-full nav-progress-bar" />
    </div>
  );
}
