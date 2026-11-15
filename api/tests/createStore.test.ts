import { describe, expect, it, vi } from "vitest";
import { createStore } from "../src/createStore.js";
import type { RedisLike } from "../src/redisStore.js";

function createFakeRedis(): RedisLike {
    const members = new Set<string>();
    return {
        async sAdd(_key, member) {
            const before = members.size;
            members.add(member);
            return members.size - before;
        },
        async sCard() {
            return members.size;
        },
        async sIsMember(_key, member) {
            return members.has(member) ? 1 : 0;
        },
    };
}

describe("createStore", () => {
    it.each([
        ["undefined", undefined],
        ["an empty string", ""],
    ])("uses the in-memory store and does not connect when REDIS_URL is %s", async (_label, url) => {
        const connect = vi.fn();

        const store = await createStore(url, connect);

        expect(connect).not.toHaveBeenCalled();
        expect(await store.like("device-a")).toEqual({ count: 1, liked: true });
    });

    it("connects to the given URL and stores the likes in Redis", async () => {
        const client = createFakeRedis();
        const connect = vi.fn().mockResolvedValue(client);

        const store = await createStore("redis://db:6379", connect);
        await store.like("device-a");

        expect(connect).toHaveBeenCalledWith("redis://db:6379");
        expect(await client.sCard("likes:devices")).toBe(1);
        expect(await store.get("device-a")).toEqual({ count: 1, liked: true });
    });

    it("fails when the Redis connection fails", async () => {
        const connect = vi.fn().mockRejectedValue(new Error("connection refused"));

        await expect(createStore("redis://db:6379", connect)).rejects.toThrow(
            "connection refused",
        );
    });
});
