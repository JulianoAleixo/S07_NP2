import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LikeButton from "../src/components/LikeButton";

const motionMock = vi.hoisted(() => ({
    inView: false,
    start: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("framer-motion", async (importOriginal) => {
    const actual = await importOriginal<typeof import("framer-motion")>();
    return {
        ...actual,
        useInView: () => motionMock.inView,
        useAnimation: () => {
            const controls = actual.useAnimation();
            controls.start = motionMock.start;
            return controls;
        },
    };
});

const jsonResponse = (body: unknown) => ({
    ok: true,
    json: async () => body,
});

describe("LikeButton", () => {
    const fetchMock = vi.fn();

    const flush = () => act(async () => {
        await vi.advanceTimersByTimeAsync(0);
    });

    const renderLoaded = async (state: { count: number; liked: boolean }) => {
        fetchMock.mockResolvedValueOnce(jsonResponse(state));
        const view = render(<LikeButton />);
        await flush();
        return view;
    };

    const button = () => screen.getByRole("button");
    const heart = () => button().querySelector("svg")!;

    beforeEach(() => {
        vi.useFakeTimers();
        fetchMock.mockReset();
        vi.stubGlobal("fetch", fetchMock);
        localStorage.clear();
        motionMock.inView = false;
        motionMock.start.mockClear();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("loading", () => {
        it("shows 0 Likes and stays disabled until the request finishes", () => {
            fetchMock.mockReturnValue(new Promise(() => {}));

            render(<LikeButton />);

            expect(button()).toHaveTextContent("0 Likes");
            expect(button()).toBeDisabled();
        });

        it("shows the count from the server and enables the button", async () => {
            await renderLoaded({ count: 5, liked: false });

            expect(button()).toHaveTextContent("5 Likes");
            expect(button()).toBeEnabled();
            expect(heart()).toHaveAttribute("fill", "none");
        });

        it("formats the count using the locale", async () => {
            await renderLoaded({ count: 1234, liked: false });

            expect(button()).toHaveTextContent(
                `${(1234).toLocaleString()} Likes`,
            );
        });

        it("disables the button and fills the heart when already liked", async () => {
            await renderLoaded({ count: 5, liked: true });

            expect(button()).toBeDisabled();
            expect(heart()).toHaveAttribute("fill", "#7C3AED");
        });

        it("shows 0 and stays enabled when loading fails", async () => {
            fetchMock.mockResolvedValueOnce({ ok: false });

            render(<LikeButton />);
            await flush();

            expect(button()).toHaveTextContent("0 Likes");
            expect(button()).toBeEnabled();
        });
    });

    describe("deviceId", () => {
        it("creates an id, stores it and reuses it when liking", async () => {
            await renderLoaded({ count: 0, liked: false });

            const id = localStorage.getItem("deviceId");
            expect(id).toBeTruthy();
            expect(fetchMock.mock.calls[0][0]).toContain(id);

            fetchMock.mockResolvedValueOnce(
                jsonResponse({ count: 1, liked: true }),
            );
            fireEvent.click(button());
            await flush();

            expect(fetchMock.mock.calls[1][1].body).toBe(
                JSON.stringify({ deviceId: id }),
            );
        });

        it("reuses an id that already exists", async () => {
            localStorage.setItem("deviceId", "existing-id");

            await renderLoaded({ count: 0, liked: false });

            expect(localStorage.getItem("deviceId")).toBe("existing-id");
            expect(fetchMock.mock.calls[0][0]).toContain("existing-id");
        });
    });

    describe("clicking", () => {
        it("increments right away and disables the button while waiting", async () => {
            await renderLoaded({ count: 5, liked: false });
            fetchMock.mockReturnValueOnce(new Promise(() => {}));

            fireEvent.click(button());

            expect(button()).toHaveTextContent("6 Likes");
            expect(button()).toBeDisabled();
            expect(heart()).toHaveAttribute("fill", "#7C3AED");
        });

        it("uses the final count from the server", async () => {
            await renderLoaded({ count: 5, liked: false });
            fetchMock.mockResolvedValueOnce(
                jsonResponse({ count: 42, liked: true }),
            );

            fireEvent.click(button());
            await flush();

            expect(button()).toHaveTextContent("42 Likes");
            expect(button()).toBeDisabled();
        });

        it("undoes the like when the request fails", async () => {
            await renderLoaded({ count: 5, liked: false });
            fetchMock.mockResolvedValueOnce({ ok: false });

            fireEvent.click(button());
            await flush();

            expect(button()).toHaveTextContent("5 Likes");
            expect(button()).toBeEnabled();
            expect(heart()).toHaveAttribute("fill", "none");
        });

        it("plays the pop animation for 280 ms", async () => {
            await renderLoaded({ count: 5, liked: false });
            fetchMock.mockResolvedValueOnce(
                jsonResponse({ count: 6, liked: true }),
            );

            fireEvent.click(button());
            expect(heart()).toHaveClass("animate-pop");

            await act(async () => {
                await vi.advanceTimersByTimeAsync(279);
            });
            expect(heart()).toHaveClass("animate-pop");

            await act(async () => {
                await vi.advanceTimersByTimeAsync(1);
            });
            expect(heart()).not.toHaveClass("animate-pop");
        });
    });

    describe("attention animation", () => {
        const advance = (ms: number) => act(async () => {
            await vi.advanceTimersByTimeAsync(ms);
        });

        it("starts 600 ms after being on screen", async () => {
            motionMock.inView = true;
            await renderLoaded({ count: 5, liked: false });

            await advance(599);
            expect(motionMock.start).not.toHaveBeenCalled();

            await advance(1);
            expect(motionMock.start).toHaveBeenCalledTimes(1);
        });

        it("does not start when off screen", async () => {
            await renderLoaded({ count: 5, liked: false });

            await advance(1000);

            expect(motionMock.start).not.toHaveBeenCalled();
        });

        it("does not start when already liked", async () => {
            motionMock.inView = true;
            await renderLoaded({ count: 5, liked: true });

            await advance(1000);

            expect(motionMock.start).not.toHaveBeenCalled();
        });

        it("does not start while still loading", async () => {
            motionMock.inView = true;
            fetchMock.mockReturnValue(new Promise(() => {}));
            render(<LikeButton />);

            await advance(1000);

            expect(motionMock.start).not.toHaveBeenCalled();
        });

        it("is cancelled when the component unmounts", async () => {
            motionMock.inView = true;
            const { unmount } = await renderLoaded({
                count: 5,
                liked: false,
            });

            unmount();
            await advance(1000);

            expect(motionMock.start).not.toHaveBeenCalled();
        });
    });
});
