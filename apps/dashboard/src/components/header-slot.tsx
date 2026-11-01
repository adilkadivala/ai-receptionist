import { createContext, type ReactNode, useContext } from "react";
import { createPortal } from "react-dom";

const HeaderSlotContext = createContext<HTMLElement | null>(null);

export const HeaderSlotProvider = HeaderSlotContext.Provider;

/** Puts a page's own controls, such as its date range, into the site header. */
export function HeaderActions({ children }: { children: ReactNode }) {
  const slot = useContext(HeaderSlotContext);
  return slot ? createPortal(children, slot) : null;
}
