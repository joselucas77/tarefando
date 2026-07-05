// Exemplo: crie um arquivo chamado src/env.d.ts
import { D1Database } from "@cloudflare/workers-types";

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    // Adicione outras bindings aqui se tiver, ex: KV: KVNamespace;
  }
}

export {};
