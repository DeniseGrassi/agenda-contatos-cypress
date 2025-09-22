import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
        baseUrl: "https://ebac-agenda-contatos-tan.vercel.app/",
        specPattern: "cypress/e2e/**/*.cy.ts",
        supportFile: "cypress/support/e2e.ts",
        viewportWidth: 1280,
        viewportHeight: 800,
        video: true,
        screenshotOnRunFailure: true,
        retries: { runMode: 2, openMode: 0 },
        setupNodeEvents(on, config) {
            // plugins se necessário
        }
    }
});
