import { defineConfig } from "cypress";
import createBundler from "@bahmutov/cypress-esbuild-preprocessor";
import { addCucumberPreprocessorPlugin } from "@badeball/cypress-cucumber-preprocessor";
import { createEsbuildPlugin } from "@badeball/cypress-cucumber-preprocessor/esbuild";
import fixCypressOnFix from "cypress-on-fix";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:4321",
    specPattern: "cypress/e2e/**/*.feature",
    reporter: "cypress-mochawesome-reporter",
    reporterOptions: {
      reportDir: "cypress/reports",
      overwrite: false,
      html: true,
      json: true,
      charts: true,
      // Gera um único index.html, com scripts, estilos e capturas dentro dele.
      // Sem isso, o relatório depende da pasta assets/ e abre em branco quando vai sozinho no e-mail.
      inlineAssets: true,
      embeddedScreenshots: true,
    },
    async setupNodeEvents(
      on: Cypress.PluginEvents,
      config: Cypress.PluginConfigOptions,
    ) {
      on = fixCypressOnFix(on);

      require("cypress-mochawesome-reporter/plugin")(on);

      await addCucumberPreprocessorPlugin(on, config);

      on(
        "file:preprocessor",
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        }),
      );

      return config;
    },
  },
});
