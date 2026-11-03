const BASE = "/api/likes";

export type LikesState = { count: number; liked: boolean };

export async function fetchLikes(deviceId: string): Promise<LikesState> {
    const res = await fetch(`${BASE}?deviceId=${encodeURIComponent(deviceId)}`);
    if (!res.ok) throw new Error("Failed to load likes");
    return res.json();
}

export async function sendLike(deviceId: string): Promise<LikesState> {
    const res = await fetch(BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
    });
    if (!res.ok) throw new Error("Failed to send like");
    return res.json();
}
