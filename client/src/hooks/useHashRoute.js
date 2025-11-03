// src/hooks/useHashRoute.js
import { useEffect, useState } from "react";

export default function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash || "#/");
  useEffect(() => {
    const update = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  const m = hash.match(/^#\/q\/(.+)$/);
  return m ? { name: "detail", id: m[1] } : { name: "list" };
}
