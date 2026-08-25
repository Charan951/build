import React, { createContext, useContext } from 'react';

/**
 * Marks the subtree as Operate mode (dashboard/portal) so shared primitives
 * like Card and Modal can pick the tighter, flatter Operate token set
 * automatically instead of every call site having to remember to override
 * Persuade-mode defaults. See DESIGN.md: "Never apply Persuade's 32-40px
 * card radii inside /dashboard or /portal."
 */
const OperateModeContext = createContext(false);

export const OperateModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <OperateModeContext.Provider value={true}>{children}</OperateModeContext.Provider>
);

export const useOperateMode = (): boolean => useContext(OperateModeContext);
