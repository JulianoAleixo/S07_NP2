export type LikesState = { count: number; liked: boolean };

export interface LikesStore {
    get(deviceId: string): Promise<LikesState>;
    like(deviceId: string): Promise<LikesState>;
}

export function createMemoryStore(): LikesStore {
    let count = 0;
    const devices = new Set<string>();

    return {
        async get(deviceId) {
            return { count, liked: devices.has(deviceId) };
        },
        async like(deviceId) {
            if (!devices.has(deviceId)) {
                devices.add(deviceId);
                count++;
            }
            return { count, liked: true };
        },
    };
}