import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp, isValidDeviceId } from "../src/app.js";
import { createMemoryStore, type LikesStore } from "../src/store.js";

describe("isValidDeviceId", () => {
    it.each([
        ["1 character", "a"],
        ["100 characters", "a".repeat(100)],
    ])("accepts a string with %s", (_label, id) => {
        expect(isValidDeviceId(id)).toBe(true);
    });

    it.each([
        ["an empty string", ""],
        ["101 characters", "a".repeat(101)],
        ["undefined", undefined],
        ["a number", 123],
        ["an array", ["a"]],
    ])("rejects %s", (_label, id) => {
        expect(isValidDeviceId(id)).toBe(false);
    });
});

describe("API routes", () => {
    let app: ReturnType<typeof createApp>;

    beforeEach(() => {
        app = createApp(createMemoryStore());
    });

    describe("GET /api/health", () => {
        it("reports the service as ok", async () => {
            const res = await request(app).get("/api/health");

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ status: "ok" });
        });
    });

    describe("GET /api/likes", () => {
        it("returns the state of a valid device", async () => {
            const res = await request(app)
                .get("/api/likes")
                .query({ deviceId: "device-a" });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ count: 0, liked: false });
        });

        it("returns 400 without deviceId", async () => {
            const res = await request(app).get("/api/likes");

            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: "invalid deviceId" });
        });

        it("returns 400 when deviceId is repeated and arrives as an array", async () => {
            const res = await request(app).get(
                "/api/likes?deviceId=a&deviceId=b",
            );

            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: "invalid deviceId" });
        });
    });

    describe("POST /api/likes", () => {
        it("registers a like that is visible afterwards on GET", async () => {
            const post = await request(app)
                .post("/api/likes")
                .send({ deviceId: "device-a" });

            expect(post.status).toBe(200);
            expect(post.body).toEqual({ count: 1, liked: true });

            const get = await request(app)
                .get("/api/likes")
                .query({ deviceId: "device-a" });

            expect(get.body).toEqual({ count: 1, liked: true });
        });

        it("is idempotent for the same device", async () => {
            await request(app).post("/api/likes").send({ deviceId: "device-a" });

            const res = await request(app)
                .post("/api/likes")
                .send({ deviceId: "device-a" });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ count: 1, liked: true });
        });

        it("accepts a deviceId at the 100 character limit", async () => {
            const res = await request(app)
                .post("/api/likes")
                .send({ deviceId: "a".repeat(100) });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ count: 1, liked: true });
        });

        it("returns 400 without a body and does not count a like", async () => {
            const res = await request(app).post("/api/likes");

            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: "invalid deviceId" });

            const get = await request(app)
                .get("/api/likes")
                .query({ deviceId: "device-a" });

            expect(get.body.count).toBe(0);
        });

        it("returns 400 when deviceId is above the limit and does not count a like", async () => {
            const res = await request(app)
                .post("/api/likes")
                .send({ deviceId: "a".repeat(101) });

            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: "invalid deviceId" });

            const get = await request(app)
                .get("/api/likes")
                .query({ deviceId: "device-a" });

            expect(get.body.count).toBe(0);
        });

        it("returns 400 for malformed JSON", async () => {
            const res = await request(app)
                .post("/api/likes")
                .set("Content-Type", "application/json")
                .send("{not json");

            expect(res.status).toBe(400);
        });
    });

    describe("when the store fails", () => {
        const failingStore: LikesStore = {
            get: vi.fn().mockRejectedValue(new Error("store down")),
            like: vi.fn().mockRejectedValue(new Error("store down")),
        };

        it("returns 500 on GET", async () => {
            const res = await request(createApp(failingStore))
                .get("/api/likes")
                .query({ deviceId: "device-a" });

            expect(res.status).toBe(500);
        });

        it("returns 500 on POST", async () => {
            const res = await request(createApp(failingStore))
                .post("/api/likes")
                .send({ deviceId: "device-a" });

            expect(res.status).toBe(500);
        });
    });
});
