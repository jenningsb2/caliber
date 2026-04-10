import { createContext, useContext, useState } from "react";

export type Role = "manager" | "admin";

type RoleContextType = {
  role: Role;
  setRole: (role: Role) => void;
};

const RoleContext = createContext<RoleContextType>({
  role: "manager",
  setRole: () => {},
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("manager");
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  return useContext(RoleContext);
}

export function useToggleRole() {
  const { role, setRole } = useContext(RoleContext);
  return () => setRole(role === "manager" ? "admin" : "manager");
}
