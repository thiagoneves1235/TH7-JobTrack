const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const port = process.env.PORT || 3000;
const root = path.resolve(__dirname, "..");
const dataFile = path.join(__dirname, "data.json");
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
function sendJson(response, status, body) { response.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }); response.end(JSON.stringify(body)); }
function parseBody(request) { return new Promise((resolve, reject) => { let body = ""; request.on("data", (chunk) => { body += chunk; }); request.on("end", () => resolve(body ? JSON.parse(body) : {})); request.on("error", reject); }); }
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
  if (url.pathname === "/api/health") return sendJson(response, 200, { status: "ok", service: "th7-jobtrack-api" });
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
  serveStatic(request, response);
});

server.listen(port, () => console.log(`TH7 JobTrack API em http://localhost:${port}`));
