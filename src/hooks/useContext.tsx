// ValueContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

// 1. Define the context shape
type ValueContextType = {
  value: string;
  setValue: (newValue: string) => void;
};

// 2. Create the context
const ValueContext = createContext<ValueContextType | undefined>(undefined);

// 3. Provide the context
export const ValueProvider = ({ children }: { children: ReactNode }) => {
  const [value, setValue] = useState("task");

  return (
    <ValueContext.Provider value={{ value, setValue }}>
      {children}
    </ValueContext.Provider>
  );
};

// 4. Use the context in components
export const useValue = () => {
  const context = useContext(ValueContext);
  if (!context) {
    throw new Error("useValue must be used within a ValueProvider");
  }
  return context;
};
