"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // PWA é um bônus de conveniência (RNF01); falha no registro não deve quebrar o app.
      });
    }
  }, []);
  return null;
}
