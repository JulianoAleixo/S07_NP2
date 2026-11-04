import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Footer from "../src/components/Footer";

vi.mock("../src/components/LikeButton", () => ({
    default: () => <button>like button</button>,
}));

describe("Footer", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("shows the current year in the copyright", () => {
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(new Date(2031, 5, 15));

        render(<Footer />);

        expect(screen.getByText(/Copyright/)).toHaveTextContent(
            "Copyright © 2031 Juliano Aleixo. All rights reserved.",
        );
    });

    it.each([
        ["LinkedIn", "linkedin.com"],
        ["GitHub", "github.com"],
        ["Send email", "mail.google.com"],
    ])("exposes the %s link to assistive technology", (name, domain) => {
        render(<Footer />);

        expect(screen.getByRole("link", { name })).toHaveAttribute(
            "href",
            expect.stringContaining(domain),
        );
    });

    it("includes the like button and the tech stack", () => {
        render(<Footer />);

        expect(
            screen.getByRole("button", { name: "like button" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Built with")).toBeInTheDocument();
    });
});
