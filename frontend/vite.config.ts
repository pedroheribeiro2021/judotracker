/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Novo deploy → o service worker atualiza sozinho no próximo acesso.
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon-180x180.png"],
      manifest: {
        name: "JudoTracker",
        short_name: "JudoTracker",
        description:
          "Acompanhamento de atletas de judô: pesagens, treinos, competições e graduações.",
        lang: "pt-BR",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#f8fafc",
        theme_color: "#4f46e5",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Só o "casco" do app vai para o cache (JS/CSS/HTML/ícones). Os dados
        // vêm do GraphQL em outro domínio e nunca são cacheados.
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webmanifest}"],
        globIgnores: ["**/images/**"],
        navigateFallback: "/index.html",
        // O bundle principal passa de 1 MB.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  server: { port: 5173 },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
  },
});
