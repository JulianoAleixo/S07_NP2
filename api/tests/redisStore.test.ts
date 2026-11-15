import { describe, expect, it } from "vitest";
import {
    LIKES_KEY,
    createRedisStore,
    type RedisLike,
} from "../src/redisStore.js";

function createFakeRedis(): RedisLike & { sets: Map<string, Set<string>> } {
    const sets = new Map<string, Set<string>>();
    const setOf = (key: string) => {
        if (!sets.has(key)) sets.set(key, new Set());
        return sets.get(key)!;
    };

    return {
        sets,
        async sAdd(key, member) {
            const set = setOf(key);
            const before = set.size;
            set.add(member);
            return set.size - before;
        },
        async sCard(key) {
            return setOf(key).size;
        },
        async sIsMember(key, member) {
            return setOf(key).has(member) ? 1 : 0;
        },
    };
}

describe("createRedisStore", () => {
    it("starts with zero likes and the device not liked", async () => {
        const store = createRedisStore(createFakeRedis());

        expect(await store.get("device-a")).toEqual({ count: 0, liked: false });
    });

    it("counts a like and marks the device as liked", async () => {
        const store = createRedisStore(createFakeRedis());

        expect(await store.like("device-a")).toEqual({ count: 1, liked: true });
        expect(await store.get("device-a")).toEqual({ count: 1, liked: true });
    });

    it("does not count a second like from the same device", async () => {
        const store = createRedisStore(createFakeRedis());

        await store.like("device-a");

        expect(await store.like("device-a")).toEqual({ count: 1, liked: true });
        expect(await store.get("device-a")).toEqual({ count: 1, liked: true });
    });

    it("shares the total between devices but keeps liked per device", async () => {
        const store = createRedisStore(createFakeRedis());

        await store.like("device-a");
        await store.like("device-b");

        expect(await store.get("device-a")).toEqual({ count: 2, liked: true });
        expect(await store.get("device-c")).toEqual({ count: 2, liked: false });
    });

    it("keeps the likes in the Redis set, so a new store sees them", async () => {
        const client = createFakeRedis();
        await createRedisStore(client).like("device-a");

        const restarted = createRedisStore(client);

        expect(await restarted.get("device-a")).toEqual({ count: 1, liked: true });
        expect(client.sets.get(LIKES_KEY)).toEqual(new Set(["device-a"]));
    });

    it("accepts a boolean reply from SISMEMBER", async () => {
        const base = createFakeRedis();
        const store = createRedisStore({
            sAdd: base.sAdd,
            sCard: base.sCard,
            sIsMember: async (key, member) => (await base.sIsMember(key, member)) === 1,
        });

        await store.like("device-a");

        expect(await store.get("device-a")).toEqual({ count: 1, liked: true });
        expect(await store.get("device-b")).toEqual({ count: 1, liked: false });
    });

    it("propagates a Redis failure instead of hiding it", async () => {
        const client = createFakeRedis();
        client.sCard = async () => {
            throw new Error("redis down");
        };
        const store = createRedisStore(client);

        await expect(store.get("device-a")).rejects.toThrow("redis down");
        await expect(store.like("device-a")).rejects.toThrow("redis down");
    });
});
