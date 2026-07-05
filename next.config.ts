import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Erlaubt den Zugriff auf die Dev-Ressourcen (HMR) vom lokalen WLAN aus,
  // damit die Seite auch auf dem Handy im selben Netzwerk funktioniert.
  allowedDevOrigins: ["192.168.2.38"],
};

export default nextConfig;
