import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Hero from "../src/components/Hero";
import { techItems } from "../src/constants/techItems";

const silk = vi.hoisted(() => ({ props: {} as Record<string, unknown> }));

vi.mock("../src/components/Silk", () => ({
    default: (props: Record<string, unknown>) => {
        silk.props = props;
        return <div data-testid="silk" />;
    },
}));

describe("Hero", () => {
    // Precisa ser o primeiro teste: o lazy guarda o módulo depois de carregá-lo,
    // e os próximos renders já encontram o Silk pronto.
    it("loads the Silk background lazily with its settings", async () => {
        render(<Hero />);

        expect(screen.queryByTestId("silk")).not.toBeInTheDocument();
        expect(await screen.findByTestId("silk")).toBeInTheDocument();
        expect(silk.props).toEqual({
            speed: 5,
            scale: 1,
            color: "#7B7481",
            noiseIntensity: 1.5,
            rotation: 0,
        });
    });

    it("shows the name and the role", () => {
        render(<Hero />);

        expect(screen.getByText("Hi, I'm Juliano Aleixo")).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
            "SoftwareEngineer",
        );
    });

    it.each([
        ["LinkedIn", "linkedin.com"],
        ["GitHub", "github.com"],
        ["Send email", "mail.google.com"],
    ])("exposes the %s link to assistive technology", (name, domain) => {
        render(<Hero />);

        expect(screen.getByRole("link", { name })).toHaveAttribute(
            "href",
            expect.stringContaining(domain),
        );
    });

    it("shows every technology in the slider", () => {
        render(<Hero />);

        for (const { text } of techItems) {
            expect(screen.getAllByText(text).length).toBeGreaterThan(0);
        }
    });

    it("identifies the section for the navigation", () => {
        const { container } = render(<Hero />);

        expect(container.querySelector("section")).toHaveAttribute("id", "home");
    });
});
