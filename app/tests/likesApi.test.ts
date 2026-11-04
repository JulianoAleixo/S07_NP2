import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchLikes, sendLike } from "../src/lib/likesApi";

describe("likesApi", () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
        fetchMock.mockReset();
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.stubGlobal("fetch", undefined);
    });

    describe("fetchLikes", () => {
        it("requests the likes with an encoded deviceId and returns the state", async () => {
            fetchMock.mockResolvedValue({
                ok: true,
                json: async () => ({ count: 3, liked: true }),
            });

            const state = await fetchLikes("a b/c&d");

            expect(fetchMock).toHaveBeenCalledWith(
                "/api/likes?deviceId=a%20b%2Fc%26d",
            );
            expect(state).toEqual({ count: 3, liked: true });
        });

        it("throws when the response is not ok", async () => {
            fetchMock.mockResolvedValue({ ok: false });

            await expect(fetchLikes("device")).rejects.toThrow(
                "Failed to load likes",
            );
        });
    });

    describe("sendLike", () => {
        it("posts the deviceId as JSON and returns the state", async () => {
            fetchMock.mockResolvedValue({
                ok: true,
                json: async () => ({ count: 4, liked: true }),
            });

            const state = await sendLike("device");

            expect(fetchMock).toHaveBeenCalledWith("/api/likes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ deviceId: "device" }),
            });
            expect(state).toEqual({ count: 4, liked: true });
        });

        it("throws when the response is not ok", async () => {
            fetchMock.mockResolvedValue({ ok: false });

            await expect(sendLike("device")).rejects.toThrow(
                "Failed to send like",
            );
        });
    });
});
