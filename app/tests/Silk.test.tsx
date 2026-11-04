import ReactThreeTestRenderer from "@react-three/test-renderer";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { Mesh, ShaderMaterial } from "three";
import Silk, { type SilkProps } from "../src/components/Silk";

const canvas = vi.hoisted(() => ({
    children: null as unknown,
    props: {} as Record<string, unknown>,
}));

// O Canvas real exige WebGL, que o jsdom não tem. Capturamos a cena dele e a
// executamos no renderizador de testes do próprio react-three, sem WebGL.
vi.mock("@react-three/fiber", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@react-three/fiber")>();
    return {
        ...actual,
        Canvas: ({
            children,
            ...props
        }: {
            children: ReactNode;
        } & Record<string, unknown>) => {
            canvas.children = children;
            canvas.props = props;
            return null;
        },
    };
});

const renderScene = async (
    props: SilkProps = {},
    size?: { width: number; height: number },
) => {
    render(<Silk {...props} />);
    const scene = await ReactThreeTestRenderer.create(
        canvas.children as React.ReactElement,
        size,
    );
    const mesh = scene.scene.children[0].instance as unknown as Mesh;
    const material = mesh.material as ShaderMaterial;
    return { scene, mesh, uniforms: material.uniforms };
};

describe("Silk", () => {
    beforeAll(() => {
        // O renderizador do react-three usa act, e o React pede este aviso ligado.
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    });

    it("configures the canvas to keep animating", () => {
        render(<Silk />);

        expect(canvas.props).toEqual({ dpr: [1, 2], frameloop: "always" });
    });

    it("scales the plane to the size of the viewport", async () => {
        // Sem o ajuste, a escala ficaria 1 x 1. Em tela 2:1, a viewport também é 2:1.
        const { mesh } = await renderScene({}, { width: 800, height: 400 });

        expect(mesh.scale.y).toBeGreaterThan(0);
        expect(mesh.scale.y).not.toBe(1);
        expect(mesh.scale.x / mesh.scale.y).toBeCloseTo(2);
        expect(mesh.scale.z).toBe(1);
    });

    it("derives the uniforms from the props", async () => {
        const { uniforms } = await renderScene({
            speed: 2,
            scale: 3,
            noiseIntensity: 0.5,
            rotation: 1,
            color: "#ff0000",
        });

        expect(uniforms.uSpeed.value).toBe(2);
        expect(uniforms.uScale.value).toBe(3);
        expect(uniforms.uNoiseIntensity.value).toBe(0.5);
        expect(uniforms.uRotation.value).toBe(1);
        expect(uniforms.uColor.value.r).toBeCloseTo(1);
        expect(uniforms.uColor.value.g).toBeCloseTo(0);
        expect(uniforms.uColor.value.b).toBeCloseTo(0);
    });

    it("uses the default props", async () => {
        const { uniforms } = await renderScene();

        expect(uniforms.uSpeed.value).toBe(5);
        expect(uniforms.uScale.value).toBe(1);
        expect(uniforms.uNoiseIntensity.value).toBe(1.5);
        expect(uniforms.uRotation.value).toBe(0);
        expect(uniforms.uColor.value.r).toBeCloseTo(0x7b / 255);
        expect(uniforms.uColor.value.g).toBeCloseTo(0x74 / 255);
        expect(uniforms.uColor.value.b).toBeCloseTo(0x81 / 255);
    });

    it("advances uTime on each frame", async () => {
        const { scene, uniforms } = await renderScene();

        expect(uniforms.uTime.value).toBe(0);

        await scene.advanceFrames(2, 0.5);

        // 2 quadros x 0,1 x 0,5 de delta.
        expect(uniforms.uTime.value).toBeCloseTo(0.1);
    });
});
