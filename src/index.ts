import { start } from "./app";

(async () => {
    const server = await start(3000);
    // Initialize Application
    return server.build();
})();

