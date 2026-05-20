import dns from "node:dns/promises";

console.log(await dns.getServers());