import { createContext, useContext, type ReactNode } from 'react';

/**
 * Additional delay handed down by a `Stagger` wrapper. Kept in context rather
 * than injected as a prop so it survives arbitrary nesting - a `Reveal` three
 * layers inside a `Stagger` child still lines up with its siblings.
 */
const StaggerDelayContext = createContext(0);

export function StaggerDelayProvider({ delay, children }: { delay: number; children: ReactNode }) {
  return <StaggerDelayContext.Provider value={delay}>{children}</StaggerDelayContext.Provider>;
}

export function useStaggerDelay(): number {
  return useContext(StaggerDelayContext);
}
