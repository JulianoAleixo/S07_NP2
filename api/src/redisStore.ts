import type { LikesStore } from "./store.js";

export interface RedisLike {
    sAdd(key: string, member: string): Promise<number>;
    sCard(key: string): Promise<number>;
    sIsMember(key: string, member: string): Promise<number | boolean>;
}

export const LIKES_KEY = "likes:devices";

export function createRedisStore(client: RedisLike): LikesStore {
    return {
        async get(deviceId) {
            const [count, liked] = await Promise.all([
                client.sCard(LIKES_KEY),
                client.sIsMember(LIKES_KEY, deviceId),
            ]);
            return { count, liked: Boolean(liked) };
        },
        async like(deviceId) {
            await client.sAdd(LIKES_KEY, deviceId);
            return { count: await client.sCard(LIKES_KEY), liked: true };
        },
    };
}
