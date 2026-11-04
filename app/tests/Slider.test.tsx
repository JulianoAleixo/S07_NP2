import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Slider from "../src/components/Slider";

const items = [
    { image: "/a.svg", alt: "Alt A", text: "Text A" },
    { image: "/b.svg", text: "Text B" },
    { image: "/c.svg" },
];

describe("Slider", () => {
    const track = (container: HTMLElement) =>
        container.querySelector<HTMLElement>("[style]")!;

    it("duplicates the items so the loop has no gap", () => {
        const { container } = render(<Slider items={items} />);

        expect(container.querySelectorAll("img")).toHaveLength(6);
        expect(screen.getAllByText("Text A")).toHaveLength(2);
    });

    it("prefers alt, then text, then an empty description", () => {
        const { container } = render(<Slider items={items} />);
        const images = container.querySelectorAll("img");

        expect(images[0]).toHaveAttribute("alt", "Alt A");
        expect(images[1]).toHaveAttribute("alt", "Text B");
        expect(images[2]).toHaveAttribute("alt", "");
    });

    it("only renders text for items that have it", () => {
        const { container } = render(<Slider items={items} />);

        expect(container.querySelectorAll("span")).toHaveLength(4);
    });

    it("uses 25 seconds by default", () => {
        const { container } = render(<Slider items={items} />);

        expect(track(container).style.getPropertyValue("--duration")).toBe(
            "25s",
        );
    });

    it("accepts a custom duration", () => {
        const { container } = render(<Slider items={items} duration={30} />);

        expect(track(container).style.getPropertyValue("--duration")).toBe(
            "30s",
        );
    });

    it("adds a custom class to the root", () => {
        const { container } = render(
            <Slider items={items} className="custom-class" />,
        );

        expect(container.firstChild).toHaveClass("custom-class");
    });
});
