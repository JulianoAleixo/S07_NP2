import { createApp } from "./app.js";
import { createMemoryStore } from "./store.js";

const port = Number(process.env.PORT ?? 3000);

createApp(createMemoryStore()).listen(port, () => {
    console.log(`API rodando na porta ${port}`);
});