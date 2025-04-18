const express = require('express');
const fetch = require('node-fetch'); // Import node-fetch

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

// Home route to fetch and process URLs
app.get('/', async (req, res) => {
  try {
    const promises = sites.map(async (site) => {
      try {
        const response = await fetch(site.url); // Use node-fetch here
        if (!response.ok) {
          console.error(`Failed to fetch ${site.url}: ${response.status}`);
          return;
        }

        const data = await response.json();
        const formattedString = processData(site.type, data);
        if (formattedString) {
          uniqueStrings.add(formattedString);
        }
      } catch (error) {
        console.error(`Error fetching data from ${site.url}:`, error);
      }
    });

    await Promise.all(promises);
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

// Define individual processing functions (same as in your original script)
function processHysteria(data) {
  const { server, up_mbps, down_mbps, auth_str, server_name, alpn } = data;
  return `hysteria://${server}?upmbps=${up_mbps}&downmbps=${down_mbps}&auth=${auth_str}&insecure=1&peer=${server_name}&alpn=${alpn}`;
}

// Other processing functions remain unchanged

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
