import { useEffect } from "react";

// Inputs that keep their own Enter behaviour (buttons, checkboxes, files ...)
const OWN_ENTER = new Set([
  "hidden",
  "submit",
  "button",
  "reset",
  "image",
  "checkbox",
  "radio",
  "file",
  "range",
  "color",
]);

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

// A field the user can actually type in or choose from
function isUsable(el: Element): el is Field {
  if (el instanceof HTMLInputElement) {
    if (OWN_ENTER.has(el.type) || el.readOnly) return false;
  } else if (el instanceof HTMLTextAreaElement) {
    if (el.readOnly) return false;
  } else if (!(el instanceof HTMLSelectElement)) {
    return false;
  }
  if (el.disabled) return false;
  // Hidden fields (display: none, collapsed panels) have no offsetParent
  return el.offsetParent !== null || getComputedStyle(el).position === "fixed";
}

// Enter in a text field moves to the next field. In the last field Enter
// does what it always did: it submits the form.
export function moveToNextField(e: KeyboardEvent) {
  if (e.key !== "Enter" || e.defaultPrevented || e.isComposing) return;
  if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
  const target = e.target;
  if (!(target instanceof HTMLInputElement) || OWN_ENTER.has(target.type))
    return;
  const form = target.form;
  if (!form) return;

  const fields = Array.from(form.elements).filter(isUsable);
  const index = fields.indexOf(target);
  const next = fields[index + 1];
  if (index === -1 || !next) return;

  e.preventDefault();
  next.focus();
  if (next instanceof HTMLInputElement || next instanceof HTMLTextAreaElement) {
    try {
      next.select();
    } catch {
      // some input types (email, number) cannot select text; focus is enough
    }
  }
}

// Call once near the top of the app: it covers every form on the site
export function useEnterToNextField() {
  useEffect(() => {
    document.addEventListener("keydown", moveToNextField);
    return () => document.removeEventListener("keydown", moveToNextField);
  }, []);
}