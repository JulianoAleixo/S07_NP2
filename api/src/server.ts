import { createClient } from "redis";
import { createApp } from "./app.js";
import { createStore } from "./createStore.js";

async function connectRedis(url: string) {
    const client = createClient({ url });
    client.on("error", (err) => console.error("Erro no Redis:", err));
    await client.connect();
    return client;
}

const redisUrl = process.env.REDIS_URL;
const store = await createStore(redisUrl, connectRedis);
console.log(redisUrl ? "Likes guardados no Redis" : "REDIS_URL não definida: likes em memória");

const port = Number(process.env.PORT ?? 3000);
createApp(store).listen(port, () => {
    console.log(`API rodando na porta ${port}`);
});