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
      previous?.focus();
    };
  }, [open]);

  return containerRef;
}
