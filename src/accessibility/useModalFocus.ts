import { useEffect, useRef } from "react";

const FOCUSABLE = "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

export function useModalFocus(open: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open || !containerRef.current) return;
    const activeElement = document.activeElement as HTMLElement | null;
    const previous = activeElement && typeof activeElement.focus === "function" ? activeElement : null;
    const container = containerRef.current;
    const focusable = () => Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
      .filter((element) => element.getAttribute("aria-hidden") !== "true");
    const initial = container.querySelector<HTMLElement>("[data-modal-autofocus]") || focusable()[0];
    initial?.focus();

    // Trapping Tab is not enough: a screen-reader user can still swipe out of the dialog
    // into the page behind it. Take the rest of the app out of the accessibility tree for
    // as long as the dialog is open, and put it back exactly as it was on close.
    const overlay = container.closest<HTMLElement>('[role="dialog"]') || container;
    const siblings = Array.from(overlay.parentElement?.children || [])
      .filter((element): element is HTMLElement => element instanceof HTMLElement && element !== overlay);
    const restore = siblings.map((element) => ({
      element,
      hidden: element.getAttribute("aria-hidden"),
      inert: element.hasAttribute("inert"),
    }));
    siblings.forEach((element) => {
      element.setAttribute("aria-hidden", "true");
      element.setAttribute("inert", "");
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) { event.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      restore.forEach(({ element, hidden, inert }) => {
        if (hidden == null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", hidden);
        if (!inert) element.removeAttribute("inert");
      });
      // Returning focus to <body> means "start again from the top" for a keyboard user.
      // Fall back to the page heading when there was no meaningful trigger to return to.
      if (previous && previous !== document.body) previous.focus();
      else {
        const heading = document.querySelector<HTMLElement>("main, [role='main'], h1");
        if (heading) { heading.setAttribute("tabindex", "-1"); heading.focus(); }
      }
    };
  }, [open]);

  return containerRef;
}
