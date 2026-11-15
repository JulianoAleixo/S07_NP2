import { createMemoryStore, type LikesStore } from "./store.js";
import { createRedisStore, type RedisLike } from "./redisStore.js";

export type ConnectRedis = (url: string) => Promise<RedisLike>;

export async function createStore(
    redisUrl: string | undefined,
    connect: ConnectRedis,
): Promise<LikesStore> {
    if (!redisUrl) {
        return createMemoryStore();
    }
    return createRedisStore(await connect(redisUrl));
}
