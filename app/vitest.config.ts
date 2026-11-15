import { defineConfig } from "vitest/config";

export default defineConfig({
    esbuild: { jsx: "automatic" },
    test: {
        reporters: ["default", "junit"],
        outputFile: { junit: "reports/junit.xml" },
        environment: "jsdom",
        setupFiles: ["./tests/setup.ts"],
        include: ["tests/**/*.test.{ts,tsx}"],
        coverage: {
            provider: "v8",
            include: ["src/**/*.{ts,tsx}"],
            thresholds: {
                lines: 90,
                functions: 90,
                branches: 90,
                statements: 90,
            },
        },
    },
});