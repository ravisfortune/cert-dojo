// Live presence counter for Cert Dojo.
//
// Each open, visible tab POSTs {id, testing, left?} every ~45 s. Members live in two
// Redis sorted sets scored by last-seen time; counts are ZCOUNTs over the TTL window,
// so no per-request cleanup is needed. Old members are trimmed on ~5% of requests.
// Designed to stay inside the Upstash free tier (~3-4 commands per ping).
//
// Env (set by the Vercel <-> Upstash integration): KV_REST_API_URL + KV_REST_API_TOKEN
// (or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN).

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const TTL_MS = 100 * 1000;
const ALL = "certdojo:online";
const TEST = "certdojo:testing";
const ID_RE = /^[a-z0-9-]{8,40}$/i;

async function pipeline(cmds) {
  const r = await fetch(`${URL_}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmds),
  });
  if (!r.ok) throw new Error(`upstash ${r.status}`);
  return r.json();
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "POST only" });
  }
  if (!URL_ || !TOKEN) return res.status(503).json({ error: "presence store not configured" });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  const id = body && typeof body.id === "string" ? body.id : "";
  if (!ID_RE.test(id)) return res.status(400).json({ error: "bad id" });

  const now = Date.now();
  const min = now - TTL_MS;
  const cmds = [];
  if (body.left) {
    cmds.push(["ZREM", ALL, id], ["ZREM", TEST, id]);
  } else {
    cmds.push(["ZADD", ALL, now, id]);
    if (body.testing) cmds.push(["ZADD", TEST, now, id]);
    else if (body.wasTesting) cmds.push(["ZREM", TEST, id]);
  }
  const countAt = cmds.length;
  cmds.push(["ZCOUNT", ALL, min, "+inf"], ["ZCOUNT", TEST, min, "+inf"]);
  if (Math.random() < 0.05) cmds.push(["ZREMRANGEBYSCORE", ALL, 0, min], ["ZREMRANGEBYSCORE", TEST, 0, min]);

  try {
    const out = await pipeline(cmds);
    const online = Number(out[countAt]?.result) || 0;
    const testing = Number(out[countAt + 1]?.result) || 0;
    return res.status(200).json({ online, testing });
  } catch (e) {
    return res.status(502).json({ error: "presence store unavailable" });
  }
};
