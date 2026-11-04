import { describe, expect, it } from "vitest";
import { createMemoryStore } from "../src/store.js";

describe("createMemoryStore", () => {
    it("starts with zero likes and the device not liked", async () => {
        const store = createMemoryStore();

        expect(await store.get("device-a")).toEqual({ count: 0, liked: false });
    });

    it("counts a like and marks the device as liked", async () => {
        const store = createMemoryStore();

        expect(await store.like("device-a")).toEqual({ count: 1, liked: true });
        expect(await store.get("device-a")).toEqual({ count: 1, liked: true });
    });

    it("does not count a second like from the same device", async () => {
        const store = createMemoryStore();

        await store.like("device-a");

        expect(await store.like("device-a")).toEqual({ count: 1, liked: true });
        expect(await store.get("device-a")).toEqual({ count: 1, liked: true });
    });

    it("shares the total between devices but keeps liked per device", async () => {
        const store = createMemoryStore();

        await store.like("device-a");
        await store.like("device-b");

        expect(await store.get("device-a")).toEqual({ count: 2, liked: true });
        expect(await store.get("device-c")).toEqual({ count: 2, liked: false });
    });

    it("keeps separate stores isolated", async () => {
        const first = createMemoryStore();
        const second = createMemoryStore();

        await first.like("device-a");

        expect(await second.get("device-a")).toEqual({
            count: 0,
            liked: false,
        });
    });
});
