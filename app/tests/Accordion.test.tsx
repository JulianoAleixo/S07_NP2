import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Monitor, Server } from "lucide-react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Accordion from "../src/components/Accordion";

const items = [
    { icon: Monitor, label: "First", content: ["First A", "First B"] },
    { icon: Server, label: "Second", content: ["Second A"] },
];

describe("Accordion", () => {
    const toggle = (name: string) => screen.getByRole("button", { name });
    // O corpo do item é o bloco que recebe maxHeight e opacity.
    const panelOf = (text: string) =>
        screen.getByText(text).closest("ul")!.parentElement!.parentElement!;

    beforeEach(() => {
        // O jsdom não calcula layout, então scrollHeight seria sempre 0.
        vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(
            120,
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("starts with every item closed", () => {
        render(<Accordion items={items} />);

        expect(toggle("First")).toHaveAttribute("aria-expanded", "false");
        expect(toggle("Second")).toHaveAttribute("aria-expanded", "false");
        expect(panelOf("First A")).toHaveStyle({ maxHeight: "0px", opacity: 0 });
    });

    it("renders every line of content", () => {
        render(<Accordion items={items} />);

        expect(screen.getAllByRole("listitem")).toHaveLength(3);
    });

    it("opens an item using its measured height", async () => {
        const user = userEvent.setup();
        render(<Accordion items={items} />);

        await user.click(toggle("First"));

        expect(toggle("First")).toHaveAttribute("aria-expanded", "true");
        expect(panelOf("First A")).toHaveStyle({
            maxHeight: "120px",
            opacity: 1,
        });
    });

    it("closes the open item when another one opens", async () => {
        const user = userEvent.setup();
        render(<Accordion items={items} />);

        await user.click(toggle("First"));
        await user.click(toggle("Second"));

        expect(toggle("First")).toHaveAttribute("aria-expanded", "false");
        expect(toggle("Second")).toHaveAttribute("aria-expanded", "true");
        expect(panelOf("First A")).toHaveStyle({ maxHeight: "0px" });
        expect(panelOf("Second A")).toHaveStyle({ maxHeight: "120px" });
    });

    it("closes an item when it is clicked again", async () => {
        const user = userEvent.setup();
        render(<Accordion items={items} />);

        await user.click(toggle("First"));
        await user.click(toggle("First"));

        expect(toggle("First")).toHaveAttribute("aria-expanded", "false");
        expect(panelOf("First A")).toHaveStyle({ maxHeight: "0px" });
    });
});
