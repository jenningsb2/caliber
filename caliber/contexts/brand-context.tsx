import { createContext, useContext, useState } from "react";
import type { Brand } from "../constants/mock-data";

type BrandContextType = {
  brand: Brand;
  setBrand: (brand: Brand) => void;
};

const BrandContext = createContext<BrandContextType>({
  brand: "potbelly",
  setBrand: () => {},
});

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrand] = useState<Brand>("potbelly");
  return <BrandContext.Provider value={{ brand, setBrand }}>{children}</BrandContext.Provider>;
}

export function useBrand() {
  return useContext(BrandContext);
}

export function useToggleBrand() {
  const { brand, setBrand } = useContext(BrandContext);
  return () => setBrand(brand === "potbelly" ? "tacobell" : "potbelly");
}
