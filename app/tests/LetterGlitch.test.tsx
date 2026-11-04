import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LetterGlitch from "../src/components/LetterGlitch";

type Drawn = { char: string; x: number; y: number; color: string };

const WHITE = "rgb(255, 255, 255)";
const BLACK = "rgb(0, 0, 0)";
const GLITCH_SPEED = 50;

describe("LetterGlitch", () => {
    let drawn: Drawn[];
    let context: {
        fillStyle: string;
        font: string;
        textBaseline: string;
        clearRect: ReturnType<typeof vi.fn>;
        setTransform: ReturnType<typeof vi.fn>;
        fillText: (char: string, x: number, y: number) => void;
    };
    let rect: { width: number; height: number };
    let frames: Map<number, FrameRequestCallback>;
    let nextFrameId: number;
    let cancelFrame: ReturnType<typeof vi.fn>;
    let random: ReturnType<typeof vi.spyOn>;

    const setRandom = (value: number) => random.mockReturnValue(value);

    const runFrame = () => {
        const pending = [...frames.values()];
        frames.clear();
        pending.forEach((callback) => callback(0));
    };

    /** Passa do glitchSpeed e roda um quadro, para sortear uma nova cor. */
    const glitch = () => {
        vi.advanceTimersByTime(GLITCH_SPEED);
        runFrame();
    };

    /** Roda quadros sem passar o tempo, então só a transição de cor avança. */
    const runTransition = (count = 25) => {
        for (let i = 0; i < count; i++) runFrame();
    };

    /** Última cor desenhada na última letra da grade, a que o sorteio atinge. */
    const lastLetterColor = () => drawn[drawn.length - 1].color;

    const renderGlitch = (
        props: Partial<React.ComponentProps<typeof LetterGlitch>> = {},
    ) =>
        render(
            <LetterGlitch
                glitchColors={["#000000", "#ffffff"]}
                glitchSpeed={GLITCH_SPEED}
                centerVignette={false}
                outerVignette={false}
                smooth={false}
                characters="AB"
                {...props}
            />,
        );

    beforeEach(() => {
        vi.useFakeTimers();
        drawn = [];
        context = {
            fillStyle: "",
            font: "",
            textBaseline: "",
            clearRect: vi.fn(),
            setTransform: vi.fn(),
            fillText(char, x, y) {
                drawn.push({ char, x, y, color: this.fillStyle });
            },
        };
        vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
            context as unknown as RenderingContext,
        );

        // 100 x 40 gera 10 colunas e 2 linhas: 20 letras.
        rect = { width: 100, height: 40 };
        vi.spyOn(
            HTMLElement.prototype,
            "getBoundingClientRect",
        ).mockImplementation(() => rect as DOMRect);

        frames = new Map();
        nextFrameId = 1;
        cancelFrame = vi.fn((id: number) => frames.delete(id));
        vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
            const id = nextFrameId++;
            frames.set(id, cb);
            return id;
        });
        vi.stubGlobal("cancelAnimationFrame", cancelFrame);

        // Com 0, toda letra nasce com o caractere A e a cor preta.
        random = vi.spyOn(Math, "random");
        setRandom(0);
    });

    afterEach(() => {
        // Desmonta antes de restaurar os timers: useRealTimers remove o
        // cancelAnimationFrame, que o jsdom não tem e o componente usa ao desmontar.
        cleanup();
        vi.useRealTimers();
        vi.restoreAllMocks();
        vi.stubGlobal("devicePixelRatio", 1);
    });

    describe("mounting", () => {
        it("draws one letter per grid position", () => {
            renderGlitch();

            expect(drawn).toHaveLength(20);
            expect(drawn[0]).toEqual({ char: "A", x: 0, y: 0, color: "#000000" });
            expect(drawn[19]).toEqual({
                char: "A",
                x: 90,
                y: 20,
                color: "#000000",
            });
            expect(context.font).toBe("16px monospace");
            expect(context.textBaseline).toBe("top");
        });

        it("sizes the canvas using the device pixel ratio", () => {
            vi.stubGlobal("devicePixelRatio", 2);

            const { container } = renderGlitch();
            const canvas = container.querySelector("canvas")!;

            expect(canvas.width).toBe(200);
            expect(canvas.height).toBe(80);
            expect(canvas.style.width).toBe("100px");
            expect(canvas.style.height).toBe("40px");
            expect(context.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
        });

        it("uses a ratio of 1 when the browser does not report one", () => {
            vi.stubGlobal("devicePixelRatio", 0);

            const { container } = renderGlitch();

            expect(container.querySelector("canvas")!.width).toBe(100);
        });

        it("does not fail without a 2d context", () => {
            vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(
                null,
            );

            expect(() => {
                renderGlitch();
                glitch();
            }).not.toThrow();
            expect(drawn).toHaveLength(0);
        });

        it("draws nothing when the container has no size", () => {
            rect = { width: 0, height: 0 };

            renderGlitch();
            glitch();

            expect(drawn).toHaveLength(0);
        });
    });

    describe("glitching", () => {
        it("does not redraw before glitchSpeed", () => {
            renderGlitch();
            context.clearRect.mockClear();

            vi.advanceTimersByTime(GLITCH_SPEED - 1);
            runFrame();

            expect(context.clearRect).not.toHaveBeenCalled();
        });

        it("redraws after glitchSpeed and keeps the animation running", () => {
            renderGlitch();
            context.clearRect.mockClear();

            glitch();

            expect(context.clearRect).toHaveBeenCalledTimes(1);
            expect(frames.size).toBe(1);
        });

        it("changes the character of the drawn letter", () => {
            renderGlitch();

            setRandom(0.99);
            glitch();

            expect(drawn[drawn.length - 1].char).toBe("B");
            expect(drawn[drawn.length - 2].char).toBe("A");
        });

        it("updates about 5% of the letters each time", () => {
            // 200 x 100 gera 20 colunas e 5 linhas: 100 letras, então 5 sorteios.
            rect = { width: 200, height: 100 };
            renderGlitch();
            random.mockClear();

            glitch();

            // Cada letra sorteada usa 3 números: índice, caractere e cor.
            expect(random).toHaveBeenCalledTimes(15);
        });
    });

    describe("without smooth", () => {
        it("applies the new color at once", () => {
            renderGlitch({ smooth: false });

            setRandom(0.99);
            glitch();

            expect(lastLetterColor()).toBe("#ffffff");
        });
    });

    describe("with smooth", () => {
        it("keeps the old color when the transition starts", () => {
            renderGlitch({ smooth: true });

            setRandom(0.99);
            glitch();

            // Índice 39: última letra do primeiro redesenho, antes da transição.
            expect(drawn[39].color).toBe("#000000");
        });

        it("passes through intermediate colors", () => {
            renderGlitch({ smooth: true });

            setRandom(0.99);
            glitch();
            runTransition(3);

            const [, r] = /rgb\((\d+),/.exec(lastLetterColor())!;
            expect(Number(r)).toBeGreaterThan(0);
            expect(Number(r)).toBeLessThan(255);
        });

        it("reaches the target color at the end of the transition", () => {
            renderGlitch({ smooth: true });

            setRandom(0.99);
            glitch();
            runTransition();

            expect(lastLetterColor()).toBe(WHITE);
        });

        it("can start a new transition from an rgb color", () => {
            renderGlitch({ smooth: true });

            setRandom(0.99);
            glitch();
            runTransition();
            expect(lastLetterColor()).toBe(WHITE);

            // Índice ainda na última letra, mas a cor sorteada agora é a preta.
            random
                .mockReturnValueOnce(0.99)
                .mockReturnValueOnce(0.99)
                .mockReturnValueOnce(0);
            glitch();
            runTransition();

            expect(lastLetterColor()).toBe(BLACK);
        });

        it("stops redrawing once the transition has finished", () => {
            renderGlitch({ smooth: true });

            setRandom(0.99);
            glitch();
            runTransition();
            context.clearRect.mockClear();

            runTransition(3);

            expect(context.clearRect).not.toHaveBeenCalled();
        });

        it("accepts short hex colors", () => {
            renderGlitch({ smooth: true, glitchColors: ["#000", "#fff"] });

            setRandom(0.99);
            glitch();
            runTransition();

            expect(lastLetterColor()).toBe(WHITE);
        });

        it("keeps an invalid color without failing or redrawing", () => {
            renderGlitch({ smooth: true, glitchColors: ["nope", "#ffffff"] });

            setRandom(0.99);
            glitch();
            context.clearRect.mockClear();
            runTransition();

            expect(context.clearRect).not.toHaveBeenCalled();
            expect(lastLetterColor()).toBe("nope");
        });
    });

    describe("resizing", () => {
        it("rebuilds the grid 100 ms after the window changes", () => {
            renderGlitch();

            rect = { width: 200, height: 40 };
            drawn = [];
            fireEvent(window, new Event("resize"));

            vi.advanceTimersByTime(99);
            expect(drawn).toHaveLength(0);

            vi.advanceTimersByTime(1);
            // 200 x 40 gera 20 colunas e 2 linhas, então a última letra fica em x = 190.
            expect(drawn[drawn.length - 1]).toMatchObject({ x: 190, y: 20 });
        });

        it("waits for the last event when resizing many times", () => {
            renderGlitch();
            context.setTransform.mockClear();

            fireEvent(window, new Event("resize"));
            vi.advanceTimersByTime(50);
            fireEvent(window, new Event("resize"));
            vi.advanceTimersByTime(100);

            expect(context.setTransform).toHaveBeenCalledTimes(1);
        });

        it("replaces the running animation with a single new one", () => {
            renderGlitch();
            const running = [...frames.keys()][0];

            fireEvent(window, new Event("resize"));
            vi.advanceTimersByTime(100);

            expect(cancelFrame).toHaveBeenCalledWith(running);
            expect(frames.size).toBe(1);
        });
    });

    describe("unmounting", () => {
        it("cancels the animation and stops listening to resize", () => {
            const { unmount } = renderGlitch();
            const running = [...frames.keys()][0];

            unmount();
            drawn = [];
            fireEvent(window, new Event("resize"));
            vi.advanceTimersByTime(100);

            expect(cancelFrame).toHaveBeenCalledWith(running);
            expect(frames.size).toBe(0);
            expect(drawn).toHaveLength(0);
        });

        it("cancels a resize that was still pending", () => {
            const { unmount } = renderGlitch();

            fireEvent(window, new Event("resize"));
            unmount();

            expect(() => {
                act(() => {
                    vi.advanceTimersByTime(200);
                });
            }).not.toThrow();
            expect(frames.size).toBe(0);
        });
    });

    describe("vignettes", () => {
        const overlays = (container: HTMLElement) =>
            container.querySelectorAll(".pointer-events-none");

        it("renders none when both are off", () => {
            const { container } = renderGlitch();

            expect(overlays(container)).toHaveLength(0);
        });

        it("renders the outer vignette", () => {
            const { container } = renderGlitch({ outerVignette: true });

            expect(overlays(container)).toHaveLength(1);
            expect(overlays(container)[0].className).toContain(
                "rgba(23,23,23,1)_100%",
            );
        });

        it("renders the center vignette", () => {
            const { container } = renderGlitch({ centerVignette: true });

            expect(overlays(container)).toHaveLength(1);
            expect(overlays(container)[0].className).toContain(
                "rgba(23,23,23,0.8)_0%",
            );
        });
    });

    it("uses the default colors and characters when none are given", () => {
        render(
            <LetterGlitch
                glitchSpeed={GLITCH_SPEED}
                centerVignette={false}
                outerVignette={true}
                smooth={false}
            />,
        );

        expect(drawn[0].color).toBe("#2b4539");
        expect(drawn[0].char).toBe("A");
    });
});
