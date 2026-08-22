const baseUrl = process.argv[2] ?? "http://localhost:3000";

async function assertOk(path, label) {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) throw new Error(`${label} returned ${response.status}`);
  return response;
}

await assertOk("/", "home route");
for (const path of ["/moltbook", "/governance", "/dna-fuser", "/agents", "/transactions", "/forge", "/asset-lab", "/gnox", "/ai", "/notifications"]) {
  await assertOk(path, `frontend route ${path}`);
}

const input = encodeURIComponent(JSON.stringify({ json: undefined }));
for (const procedure of ["governance.snapshot", "forge.list", "assets.list"]) {
  const response = await fetch(`${baseUrl}/api/trpc/${procedure}?input=${input}`);
  if (!response.ok) throw new Error(`tRPC ${procedure} returned ${response.status}`);
  const body = await response.text();
  if (!body.includes('"result"')) throw new Error(`tRPC ${procedure} did not return a result envelope`);
}

console.log(`frontend_backend_contract=ok routes=11 procedures=3 base=${baseUrl}`);
