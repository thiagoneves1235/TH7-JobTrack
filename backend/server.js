const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { URL } = require("url");

const port = process.env.PORT || 3000;
const root = path.resolve(__dirname, "..");
const dataFile = path.join(__dirname, "data.json");
const usersFile = path.join(__dirname, "users.json");
const sessions = new Map();
const seed = [
  { id: 1, company: "Nubank", role: "Frontend Engineer", location: "Remoto", status: "interview", date: "Hoje" },
  { id: 2, company: "iFood", role: "Software Engineer II", location: "São Paulo, SP", status: "pending", date: "02 set" },
  { id: 3, company: "Stone", role: "Product Designer", location: "Híbrido", status: "pending", date: "30 ago" }
];

function readApplications() {
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify(seed, null, 2));
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}
function writeApplications(items) { fs.writeFileSync(dataFile, JSON.stringify(items, null, 2)); }
function readUsers() { if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, "[]"); return JSON.parse(fs.readFileSync(usersFile, "utf8")); }
function writeUsers(items) { fs.writeFileSync(usersFile, JSON.stringify(items, null, 2)); }
function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) { return { salt, hash: crypto.scryptSync(password, salt, 64).toString("hex") }; }
function passwordsMatch(password, user) { const derived = hashPassword(password, user.salt).hash; return crypto.timingSafeEqual(Buffer.from(derived, "hex"), Buffer.from(user.passwordHash, "hex")); }
function publicUser(user) { return { id: user.id, name: user.name, email: user.email }; }
function issueSession(user) { const token = crypto.randomBytes(32).toString("hex"); sessions.set(token, { userId: user.id, expiresAt: Date.now() + 86_400_000 }); return { token, user: publicUser(user) }; }
function authenticatedUser(request) { const value = request.headers.authorization || ""; const token = value.startsWith("Bearer ") ? value.slice(7) : ""; const session = sessions.get(token); if (!session || session.expiresAt < Date.now()) return null; return readUsers().find((user) => user.id === session.userId) || null; }
function sendJson(response, status, body) { response.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type, Authorization", "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS" }); response.end(JSON.stringify(body)); }
function parseBody(request) { return new Promise((resolve, reject) => { let body = ""; request.on("data", (chunk) => { body += chunk; }); request.on("end", () => { try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error("JSON inválido")); } }); request.on("error", reject); }); }
function serveStatic(request, response) {
  const requested = new URL(request.url, `http://${request.headers.host}`).pathname;
  const safePath = requested === "/" ? "/index.html" : requested;
  const filePath = path.join(root, safePath);
  if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return sendJson(response, 404, { error: "Arquivo não encontrado" });
  const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json" };
  response.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (request.method === "OPTIONS") return sendJson(response, 204, {});
  if (url.pathname === "/api/health") return sendJson(response, 200, { status: "ok", service: "th7-jobtrack-api" });
  if (url.pathname === "/api/auth/register" && request.method === "POST") {
    const body = await parseBody(request);
    if (!body.name || !body.email || !body.password || body.password.length < 6) return sendJson(response, 400, { error: "nome, e-mail e senha de 6 caracteres são obrigatórios" });
    const users = readUsers();
    const email = body.email.trim().toLowerCase();
    if (users.some((user) => user.email === email)) return sendJson(response, 409, { error: "e-mail já cadastrado" });
    const credentials = hashPassword(body.password);
    const user = { id: crypto.randomUUID(), name: body.name.trim(), email, ...credentials, createdAt: new Date().toISOString() };
    writeUsers([...users, user]);
    return sendJson(response, 201, issueSession(user));
  }
  if (url.pathname === "/api/auth/login" && request.method === "POST") {
    const body = await parseBody(request);
    const user = readUsers().find((item) => item.email === String(body.email || "").trim().toLowerCase());
    if (!user || !body.password || !passwordsMatch(body.password, user)) return sendJson(response, 401, { error: "e-mail ou senha inválidos" });
    return sendJson(response, 200, issueSession(user));
  }
  if (url.pathname === "/api/auth/me" && request.method === "GET") {
    const user = authenticatedUser(request);
    return user ? sendJson(response, 200, { user: publicUser(user) }) : sendJson(response, 401, { error: "sessão inválida ou expirada" });
  }
  if (url.pathname === "/api/applications" && request.method === "GET") return sendJson(response, 200, { data: readApplications() });
  if (url.pathname === "/api/applications" && request.method === "POST") {
    const body = await parseBody(request);
    if (!body.company || !body.role) return sendJson(response, 400, { error: "company e role são obrigatórios" });
    const items = readApplications();
    const created = { ...body, id: Date.now(), date: "Agora" };
    writeApplications([created, ...items]);
    return sendJson(response, 201, { data: created });
  }
  if (url.pathname.startsWith("/api/applications/") && request.method === "DELETE") {
    const id = Number(url.pathname.split("/").pop());
    writeApplications(readApplications().filter((item) => item.id !== id));
    return sendJson(response, 200, { message: "Candidatura removida" });
  }
  try { serveStatic(request, response); } catch (error) { sendJson(response, 500, { error: error.message }); }
});

server.listen(port, () => console.log(`TH7 JobTrack API em http://localhost:${port}`));
