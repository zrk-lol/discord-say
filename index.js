#!/usr/bin/env node
// Envoie un message dans un salon Discord depuis ton terminal (ou depuis un script).
// Made by Varhex by Ȥrk Team — https://varhex.com · MIT
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { execFileSync } from "node:child_process";
const args = process.argv.slice(2);
const SKIP = /^(node_modules|\.git|dist|build|\.next|\.output|coverage|\.vercel)$/;
function* walk(dir = ".") { for (const n of readdirSync(dir)) { if (SKIP.test(n)) continue; const p = join(dir, n), s = statSync(p); if (s.isDirectory()) yield* walk(p); else yield { path: relative(".", p), size: s.size }; } }
const read = (p) => { try { return readFileSync(p, "utf8"); } catch { return ""; } };
const git = (...a) => { try { return execFileSync("git", a, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return ""; } };
const env = (p) => Object.fromEntries(read(p).split(/\r?\n/).map((l) => l.match(/^\s*(?:export\s+)?([A-Za-z_][\w.]*)\s*=\s*(.*)$/)).filter(Boolean).map((m) => [m[1], m[2]]));
const url = process.env.DISCORD_WEBHOOK_URL; if (!url) { console.log("Définis DISCORD_WEBHOOK_URL (URL du webhook du salon)."); process.exit(1); }
let msg = args.join(" "); if (!msg && !process.stdin.isTTY) for await (const c of process.stdin) msg += c;
const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ content: msg.trim().slice(0, 1990) || "(message vide)" }) });
console.log(r.ok ? "✅ Envoyé" : `❌ Discord a répondu ${r.status}`); process.exitCode = r.ok ? 0 : 1;
