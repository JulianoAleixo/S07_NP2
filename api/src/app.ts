import express from "express";
import type { LikesStore } from "./store.ts";

const MAX_DEVICE_ID_LENGTH = 100;

export function isValidDeviceId(id: unknown): id is string {
    return (
        typeof id === "string" &&
        id.length > 0 &&
        id.length <= MAX_DEVICE_ID_LENGTH
    );
}

export function createApp(store: LikesStore) {
    const app = express();
    app.use(express.json());

    app.get("/api/health", (_req, res) => {
        res.json({ status: "ok" });
    });

    app.get("/api/likes", async (req, res) => {
        const { deviceId } = req.query;
        if (!isValidDeviceId(deviceId)) {
            res.status(400).json({ error: "invalid deviceId" });
            return;
        }
        res.json(await store.get(deviceId));
    });

    app.post("/api/likes", async (req, res) => {
        const { deviceId } = req.body ?? {};
        if (!isValidDeviceId(deviceId)) {
            res.status(400).json({ error: "invalid deviceId" });
            return;
        }
        res.json(await store.like(deviceId));
    });

    return app;
}