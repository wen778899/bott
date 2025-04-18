const express = require('express');
const fetch = require('node-fetch'); // Import node-fetch for fetch API

const app = express();
const port = process.env.PORT || 3000;

// Define the array of URLs and their respective processing types
const sites = [
  { url: "https://www.gitlabip.xyz/Alvin9999/pac2/master/hysteria/1/config.json", type: "hysteria" },
  { url: "https://gitlab.com/free9999/ipupdate/-/raw/master/hysteria/config.json", type: "hysteria" },
  { url: "https://www.githubip.xyz/Alvin9999/pac2/master/hysteria/config.json", type: "hysteria" },
  { url: "https://fastly.jsdelivr.net/gh/Alvin9999/pac2@latest/hysteria/config.json", type: "hysteria" },
  { url: "https://www.gitlabip.xyz/Alvin9999/pac2/master/hysteria2/1/config.json", type: "hysteria2" },
  { url: "https://gitlab.com/free9999/ipupdate/-/raw/master/hysteria2/config.json", type: "hysteria2" },
  { url: "https://www.gitlabip.xyz/Alvin9999/pac2/master/xray/1/config.json", type: "xray" },
  { url: "https://fastly.jsdelivr.net/gh/Alvin9999/pac2@latest/xray/config.json", type: "xray" },
  { url: "https://gitlab.com/free9999/ipupdate/-/raw/master/singbox/config.json", type: "singbox" },
  { url: "https://fastly.jsdelivr.net/gh/Alvin9999/pac2@latest/singbox/config.json", type: "singbox" },
  { url: "https://www.gitlabip.xyz/Alvin9999/PAC/master/backup/img/1/2/ipp/clash.meta2/1/config.yaml", type: "clash.meta2" },
  { url: "https://fastly.jsdelivr.net/gh/Alvin9999/PAC@latest/backup/img/1/2/ipp/clash.meta2/2/config.yaml", type: "clash.meta2" },
  { url: "https://www.gitlabip.xyz/Alvin9999/PAC/master/backup/img/1/2/ipp/juicity/1/config.json", type: "juicity" },
  { url: "https://gitlab.com/free9999/ipupdate/-/raw/master/backup/img/1/2/ipp/juicity/1/config.json", type: "juicity" },
  { url: "https://www.gitlabip.xyz/Alvin9999/PAC/master/backup/img/1/2/ipp/naiveproxy/1/config.json", type: "naiveproxy" },
  { url: "https://fastly.jsdelivr.net/gh/Alvin9999/PAC@latest/backup/img/1/2/ipp/naiveproxy/2/config.json", type: "naiveproxy" },
  { url: "https://www.gitlabip.xyz/Alvin9999/PAC/master/backup/img/1/2/ipp/mieru/1/config.json", type: "mieru" },
  { url: "https://fastly.jsdelivr.net/gh/Alvin9999/PAC@latest/backup/img/1/2/ipp/mieru/2/config.json", type: "mieru" }
];

// Set to store unique strings
const uniqueStrings = new Set();

// Route to fetch and process URLs
app.get('/', async (req, res) => {
  try {
    const promises = sites.map(async (site) => {
      try {
        const response = await fetch(site.url); // Use node-fetch for fetching
        if (!response.ok) {
          console.error(`Failed to fetch ${site.url}: ${response.status}`);
          return;
        }

        const data = site.url.endsWith('.json') ? await response.json() : await response.text();
        const formattedString = processData(site.type, data);
        if (formattedString) {
          uniqueStrings.add(formattedString);
        }
      } catch (error) {
        console.error(`Error fetching data from ${site.url}:`, error);
      }
    });

    await Promise.all(promises);

    // Create HTML response
    const finalStrings = [...uniqueStrings];
    const htmlContent = finalStrings.map((str) => `<p>${str}</p>`).join('\n');

    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('An error occurred');
  }
});

// Process data based on its type
function processData(type, data) {
  switch (type) {
    case "hysteria":
      return processHysteria(data);
    case "hysteria2":
      return processHysteria2(data);
    case "xray":
      return processXray(data);
    case "singbox":
      return processSingbox(data);
    case "clash.meta2":
      return processClashMeta2(data);
    case "juicity":
      return processJuicity(data);
    case "naiveproxy":
      return processNaiveproxy(data);
    case "mieru":
      return processMieru(data);
    default:
      console.error(`Unknown type: ${type}`);
      return null;
  }
}

// Define individual processing functions
function processHysteria(data) {
  const { server, up_mbps, down_mbps, auth_str, server_name, alpn } = data;
  return `hysteria://${server}?upmbps=${up_mbps}&downmbps=${down_mbps}&auth=${auth_str}&insecure=1&peer=${server_name}&alpn=${alpn}`;
}

function processHysteria2(data) {
  const { auth, server, tls } = data;
  const insecure = tls?.insecure ? 1 : 0;
  const sni = tls?.sni || '';
  return `hy2://${auth}@${server}?insecure=${insecure}&sni=${sni}`;
}

function processXray(data) {
  const outbound = data.outbounds[0];
  const { protocol, settings, streamSettings } = outbound || {};
  const { vnext } = settings || {};
  const { id, address, port } = vnext?.[0]?.users?.[0] || {};
  const { security, tlsSettings, wsSettings } = streamSettings || {};
  const { serverName: sni, fingerprint: fp } = tlsSettings || {};
  const { path, headers } = wsSettings || {};
  const host = headers?.Host;
  return `${protocol}://${id}@${address}:${port}?security=${security}&sni=${sni}&fp=${fp}&type=ws&path=${path}&host=${host}`;
}

function processSingbox(data) {
  const { server, server_port, up_mbps, down_mbps, auth_str, tls } = data.outbounds[0];
  const { server_name, alpn } = tls || {};
  return `hysteria://${server}:${server_port}?upmbps=${up_mbps}&downmbps=${down_mbps}&auth=${auth_str}&insecure=1&peer=${server_name}&alpn=${alpn?.[0]}`;
}

function processClashMeta2(data) {
  const proxies = data.proxies || [];
  return proxies.map(proxy => {
    const { name, type, server, port, cipher, password, tls } = proxy;
    const insecure = tls?.insecure ? 1 : 0;
    const sni = tls?.sni || '';
    return `clash.meta2://${name}@${server}:${port}?type=${type}&cipher=${cipher}&password=${encodeURIComponent(password)}&insecure=${insecure}&sni=${sni}`;
  }).join('\n');
}

function processJuicity(data) {
  const { server, port, password, method, obfs, obfs_param } = data;
  return `juicity://${server}:${port}?password=${encodeURIComponent(password)}&method=${method}&obfs=${obfs}&obfs_param=${encodeURIComponent(obfs_param)}`;
}

function processNaiveproxy(data) {
  const { server, port, username, password, tls } = data;
  const insecure = tls?.insecure ? 1 : 0;
  const sni = tls?.sni || '';
  return `naiveproxy://${username}:${encodeURIComponent(password)}@${server}:${port}?insecure=${insecure}&sni=${sni}`;
}

function processMieru(data) {
  const { server, port, key, protocol, tls, path } = data;
  const insecure = tls?.insecure ? 1 : 0;
  const sni = tls?.sni || '';
  return `mieru://${key}@${server}:${port}?protocol=${protocol}&insecure=${insecure}&sni=${sni}&path=${encodeURIComponent(path)}`;
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
