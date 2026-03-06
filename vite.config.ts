import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { eventsApiPlugin } from "./src/mocks/eventsApiPlugin";

export default defineConfig({
  plugins: [react(), eventsApiPlugin()]
});
