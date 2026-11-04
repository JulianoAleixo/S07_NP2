import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Description from "../src/components/Description";
import Divider from "../src/components/Divider";
import SocialButton from "../src/components/SocialButton";
import TechStack from "../src/components/TechStack";
import Astro from "../src/icons/Astro";
import Github from "../src/icons/Github";
import Gmail from "../src/icons/Gmail";
import Linkedin from "../src/icons/Linkedin";
import Tailwind from "../src/icons/Tailwind";
import Vercel from "../src/icons/Vercel";

const glitch = vi.hoisted(() => ({ props: {} as Record<string, unknown> }));

vi.mock("../src/components/LetterGlitch", () => ({
    default: (props: Record<string, unknown>) => {
        glitch.props = props;
        return <div data-testid="letter-glitch" />;
    },
}));

describe("SocialButton", () => {
    const renderButton = (className?: string) =>
        render(
            <SocialButton
                href="https://example.dev"
                ariaLabel="Example"
                className={className}
            >
                <svg data-testid="icon" />
            </SocialButton>,
        );

    it("is a named link that assistive technology can reach", () => {
        renderButton();

        const link = screen.getByRole("link", { name: "Example" });

        expect(link).toHaveAttribute("href", "https://example.dev");
        expect(link).not.toHaveAttribute("aria-hidden");
    });

    it("opens safely in a new tab", () => {
        renderButton();

        const link = screen.getByRole("link", { name: "Example" });

        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("renders its children and adds the custom class", () => {
        renderButton("custom-class");

        expect(screen.getByTestId("icon")).toBeInTheDocument();
        expect(screen.getByRole("link")).toHaveClass("custom-class");
    });

    it("can be reached with the keyboard", async () => {
        const user = userEvent.setup();
        renderButton();

        await user.tab();

        expect(screen.getByRole("link", { name: "Example" })).toHaveFocus();
    });
});

describe("TechStack", () => {
    it.each([
        ["Built with", "Astro"],
        ["Styled with", "TailwindCSS"],
        ["Deployed on", "Vercel"],
    ])("shows %s %s with its icon", (label, name) => {
        render(<TechStack />);

        const row = screen.getByText(label).parentElement!;

        // Compara só o nome: o <title> do ícone também entra no texto da linha.
        expect(row.querySelector(".font-medium")?.textContent).toBe(name);
        expect(row.querySelector("svg")).toBeInTheDocument();
    });
});

describe("Divider", () => {
    it("renders a single decorative line with no content", () => {
        const { container } = render(<Divider />);

        expect(container.children).toHaveLength(1);
        expect(container.firstChild).toBeEmptyDOMElement();
        expect(container.firstChild).toHaveClass("h-0.5");
    });
});

describe("Description", () => {
    it("shows the title and the areas of work", () => {
        render(<Description />);

        expect(
            screen.getByRole("heading", { name: "What I do?" }),
        ).toBeInTheDocument();
        for (const name of [
            "Web Development",
            "Mobile Development",
            "UI/UX Design & Prototyping",
            "Backend & APIs",
        ]) {
            expect(screen.getByRole("button", { name })).toBeInTheDocument();
        }
    });

    it("opens an area of work when it is clicked", async () => {
        const user = userEvent.setup();
        render(<Description />);
        const button = screen.getByRole("button", { name: "Backend & APIs" });

        await user.click(button);

        expect(button).toHaveAttribute("aria-expanded", "true");
        expect(screen.getByText("Flask RestAPI development")).toBeInTheDocument();
    });

    it("configures the animated background", () => {
        render(<Description />);

        expect(screen.getByTestId("letter-glitch")).toBeInTheDocument();
        expect(glitch.props).toEqual({
            glitchColors: ["#7c3aed", "#6d28d9", "#5b21b6"],
            glitchSpeed: 80,
            centerVignette: false,
            outerVignette: true,
            smooth: true,
        });
    });
});

describe("icons", () => {
    it.each([
        ["Astro", Astro],
        ["Tailwind", Tailwind],
        ["Vercel", Vercel],
        ["Github", Github],
        ["Linkedin", Linkedin],
        ["Gmail", Gmail],
    ])("%s renders an svg with a title and the given class", (_name, Icon) => {
        const { container } = render(<Icon className="size-5" />);
        const svg = container.querySelector("svg")!;

        expect(svg).toHaveClass("size-5");
        expect(svg.querySelector("title")).not.toBeEmptyDOMElement();
        expect(svg.querySelector("path")).toBeInTheDocument();
    });

    it("Astro, Tailwind and Vercel work without a class", () => {
        for (const Icon of [Astro, Tailwind, Vercel]) {
            const { container } = render(<Icon />);

            expect(container.querySelector("svg")).toHaveAttribute("class", "");
        }
    });
});
