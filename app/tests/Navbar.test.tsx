import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { motionValue } from "framer-motion";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Navbar from "../src/components/Navbar";

const scroll = vi.hoisted(() => ({
    scrollY: undefined as unknown as ReturnType<typeof motionValue<number>>,
}));

vi.mock("framer-motion", async (importOriginal) => {
    const actual = await importOriginal<typeof import("framer-motion")>();
    return { ...actual, useScroll: () => ({ scrollY: scroll.scrollY }) };
});

class ControllableObserver {
    static instances: ControllableObserver[] = [];
    target?: Element;
    disconnected = false;

    constructor(private callback: (entries: { isIntersecting: boolean }[]) => void) {
        ControllableObserver.instances.push(this);
    }

    observe(target: Element) {
        this.target = target;
    }

    disconnect() {
        this.disconnected = true;
    }

    trigger(isIntersecting: boolean) {
        act(() => this.callback([{ isIntersecting }]));
    }

    static forSection(id: string) {
        return ControllableObserver.instances.find(
            (observer) => observer.target?.id === id,
        )!;
    }
}

const addSections = () => {
    for (const id of ["home", "projects", "contact"]) {
        const section = document.createElement("section");
        section.id = id;
        document.body.appendChild(section);
    }
};

describe("Navbar", () => {
    const originalWidth = window.innerWidth;

    // O primeiro link de cada nome é o da barra de desktop.
    const desktopLink = (name: string) =>
        screen.getAllByRole("link", { name })[0];
    const desktopNav = () => screen.getAllByRole("navigation")[0];

    beforeEach(() => {
        ControllableObserver.instances = [];
        vi.stubGlobal("IntersectionObserver", ControllableObserver);
        scroll.scrollY = motionValue(0);
        addSections();
    });

    afterEach(() => {
        document.querySelectorAll("section").forEach((el) => el.remove());
        window.innerWidth = originalWidth;
        vi.restoreAllMocks();
    });

    it("renders each link in the desktop bar and in the mobile dock", () => {
        render(<Navbar />);

        for (const [name, href] of [
            ["Home", "#home"],
            ["Projects", "#projects"],
            ["Contact", "#contact"],
        ]) {
            const links = screen.getAllByRole("link", { name });
            expect(links).toHaveLength(2);
            links.forEach((link) => expect(link).toHaveAttribute("href", href));
        }
    });

    describe("active section", () => {
        it("starts on Home", () => {
            render(<Navbar />);

            expect(desktopLink("Home")).toHaveClass("text-white");
            expect(desktopLink("Projects")).toHaveClass("text-neutral-400");
        });

        it("changes when another section enters the screen", () => {
            render(<Navbar />);

            ControllableObserver.forSection("projects").trigger(true);

            expect(desktopLink("Projects")).toHaveClass("text-white");
            expect(desktopLink("Home")).toHaveClass("text-neutral-400");
        });

        it("does not change when a section is not intersecting", () => {
            render(<Navbar />);

            ControllableObserver.forSection("projects").trigger(false);

            expect(desktopLink("Home")).toHaveClass("text-white");
        });

        it("ignores sections that are not on the page", () => {
            document.getElementById("contact")!.remove();

            render(<Navbar />);

            expect(ControllableObserver.instances).toHaveLength(2);
        });

        it("disconnects the observers on unmount", () => {
            const { unmount } = render(<Navbar />);

            unmount();

            expect(ControllableObserver.instances).toHaveLength(3);
            ControllableObserver.instances.forEach((observer) =>
                expect(observer.disconnected).toBe(true),
            );
        });
    });

    describe("clicking a link", () => {
        it("prevents the default jump and scrolls smoothly to the section", () => {
            const scrollIntoView = vi.fn();
            document.getElementById("projects")!.scrollIntoView =
                scrollIntoView;
            render(<Navbar />);

            // fireEvent retorna false quando preventDefault foi chamado.
            const notPrevented = fireEvent.click(desktopLink("Projects"));

            expect(notPrevented).toBe(false);
            expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
        });

        it("also scrolls from the mobile dock", () => {
            const scrollIntoView = vi.fn();
            document.getElementById("contact")!.scrollIntoView = scrollIntoView;
            render(<Navbar />);

            fireEvent.click(screen.getAllByRole("link", { name: "Contact" })[1]);

            expect(scrollIntoView).toHaveBeenCalledTimes(1);
        });

        it("does nothing when the section does not exist", () => {
            document.getElementById("projects")!.remove();
            render(<Navbar />);

            expect(fireEvent.click(desktopLink("Projects"))).toBe(false);
        });
    });

    describe("scrolling", () => {
        it("has no blur at the top of the page", () => {
            render(<Navbar />);

            expect(desktopNav().style.backdropFilter).toBe("none");
        });

        it("applies the blur after scrolling and removes it when back at the top", async () => {
            render(<Navbar />);

            act(() => scroll.scrollY.set(100));
            await waitFor(() =>
                expect(desktopNav().style.backdropFilter).toBe("blur(14px)"),
            );

            act(() => scroll.scrollY.set(0));
            await waitFor(() =>
                expect(desktopNav().style.backdropFilter).toBe("none"),
            );
        });

        it("keeps no blur below the threshold of 24 px", async () => {
            render(<Navbar />);

            act(() => scroll.scrollY.set(24));
            await new Promise((resolve) => setTimeout(resolve, 50));

            expect(desktopNav().style.backdropFilter).toBe("none");
        });

        it("shrinks to the pill width after the scroll threshold", async () => {
            window.innerWidth = 1440;
            render(<Navbar />);

            await waitFor(() =>
                expect(desktopNav().style.width).toBe("1440px"),
            );

            act(() => scroll.scrollY.set(240));

            await waitFor(() => expect(desktopNav().style.width).toBe("460px"));
        });
    });

    describe("resizing", () => {
        it("removes the listener on unmount", () => {
            const remove = vi.spyOn(window, "removeEventListener");
            const { unmount } = render(<Navbar />);

            unmount();

            expect(remove).toHaveBeenCalledWith("resize", expect.any(Function));
        });

        it("uses the new width of the window", async () => {
            window.innerWidth = 1000;
            render(<Navbar />);
            await waitFor(() =>
                expect(desktopNav().style.width).toBe("1000px"),
            );

            window.innerWidth = 800;
            fireEvent(window, new Event("resize"));

            await waitFor(() => expect(desktopNav().style.width).toBe("800px"));
        });
    });
});
