/**
 * @param {NS} ns
 * @returns Interactive server map with header row, tree structure, money info,
 *          money percentage, security info, and free RAM / total RAM.
 */
// src: https://www.reddit.com/r/Bitburner/comments/1ipl9sn/tree_view_with_accumulated_data/
export async function main(ns) {
  // --- Constants & CSS ---
  const FACTION_SERVERS = [
      "CSEC",
      "avmnite-02h",
      "I.I.I.I",
      "run4theh111z",
      "w0r1d_d43m0n",
      "fulcrumassets"
    ],
    cssStyles = `<style id="scanCSS">
      .serverscan { font: 14px monospace; color: #ccc; }
      .serverscan-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      /* Header row styling */
      .serverscan-header {
        font-weight: bold;
        border-bottom: 1px solid #ccc;
        margin-bottom: 4px;
      }
      .tree-cell {
        white-space: pre;
        flex: 1;
      }
      .info-cell {
        display: flex;
        gap: 20px;
        min-width: 560px;
        justify-content: flex-end;
      }
      .money, .security { width: 240px; text-align: right; }
      .moneyPerc { width: 80px; text-align: right; }
      .ram { width: 240px; text-align: right; }
      .server { color: #080; cursor: pointer; text-decoration: underline; }
      .faction { color: #088; }
      .rooted { color: #6f3; }
      .rooted.faction { color: #0ff; }
      .hack { display: inline-block; font: 12px monospace; }
      .red { color: red; }
      .green { color: green; }
      .backdoor { color: #6f3; font: 12px monospace; }
      .backdoor > a { cursor: pointer; text-decoration: underline; }
      .cct { color: #0ff; }
    </style>`;

  // --- DOM References & Navigation ---
  const documentRef = eval("document");
  const insertTerminalHTML = html =>
    documentRef.getElementById("terminal").insertAdjacentHTML("beforeend", `<li>${html}</li>`);
  const terminalInputEl = documentRef.getElementById("terminal-input");
  const terminalEventHandlerKey = Object.keys(terminalInputEl)[1];
  const navigateTerminal = async command => {
    terminalInputEl.value = command;
    terminalInputEl[terminalEventHandlerKey].onChange({ target: terminalInputEl });
    terminalInputEl.focus();
    await terminalInputEl[terminalEventHandlerKey].onKeyDown({
      key: "Enter",
      preventDefault: () => 0,
    });
  };

  // --- Player & Server Info ---
  const playerHackLevel = ns.getHackingLevel();
  const getServerInfo = serverName => ns.getServer(serverName);

  // --- Color Helpers ---
  function interpolateColor(color1, color2, t) {
    // Colors are in "#RRGGBB" format.
    let r1 = parseInt(color1.slice(1, 3), 16),
      g1 = parseInt(color1.slice(3, 5), 16),
      b1 = parseInt(color1.slice(5, 7), 16);
    let r2 = parseInt(color2.slice(1, 3), 16),
      g2 = parseInt(color2.slice(3, 5), 16),
      b2 = parseInt(color2.slice(5, 7), 16);
    let r = Math.round(r1 + (r2 - r1) * t),
      g = Math.round(g1 + (g2 - g1) * t),
      b = Math.round(b1 + (b2 - b1) * t);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function getMoneyColor(moneyRatio) {
    if (moneyRatio <= 0.5) {
      return "#ff0000"; // solid red
    } else if (moneyRatio <= 0.75) {
      let t = (moneyRatio - 0.5) / 0.25;
      return interpolateColor("#ff0000", "#ffff00", t); // red → yellow
    } else {
      let t = (moneyRatio - 0.75) / 0.25;
      return interpolateColor("#ffff00", "#00ff00", t); // yellow → green
    }
  }

  function getSecurityColor(secRatio) {
    if (secRatio < 1) secRatio = 1;
    if (secRatio > 4) secRatio = 4;
    if (secRatio <= 1.5) {
      let t = (secRatio - 1) / (1.5 - 1);
      return interpolateColor("#00ff00", "#ffff00", t); // green → yellow
    } else if (secRatio <= 2) {
      let t = (secRatio - 1.5) / (2 - 1.5);
      return interpolateColor("#ffff00", "#ffa500", t); // yellow → orange
    } else {
      let t = (secRatio - 2) / (4 - 2);
      return interpolateColor("#ffa500", "#ff0000", t); // orange → red
    }
  }

  function getRamColor(ramRatio) {
    if (ramRatio <= 0.5) {
      return "#ff0000"; // red
    } else if (ramRatio <= 0.75) {
      let t = (ramRatio - 0.5) / 0.25;
      return interpolateColor("#ff0000", "#ffff00", t); // red → yellow
    } else {
      let t = (ramRatio - 0.75) / 0.25;
      return interpolateColor("#ffff00", "#00ff00", t); // yellow → green
    }
  }

  // --- Inject CSS ---
  documentRef.getElementById("scanCSS")?.remove();
  documentRef.head.insertAdjacentHTML("beforeend", cssStyles);

  // --- Build Display Cells ---
  function buildServerTreeEntry(serverName) {
    const server = getServerInfo(serverName);
    const requiredHackLevel = server.requiredHackingSkill;
    const hasRootAccess = server.hasAdminRights;
    const isHackable = requiredHackLevel <= playerHackLevel;
    const needsBackdoor =
      !server.backdoorInstalled &&
      isHackable &&
      serverName !== "home" &&
      hasRootAccess &&
      !server.purchasedByPlayer;
    const contractFiles = ns.ls(serverName, ".cct");

    return `<a class="server${FACTION_SERVERS.includes(serverName) ? " faction" : ""}${
      hasRootAccess ? " rooted" : ""
    }">${serverName}</a>` +
      (server.purchasedByPlayer
        ? ""
        : ` <span class="hack ${isHackable ? "green" : "red"}">(${requiredHackLevel})</span>`) +
      (needsBackdoor ? ' <span class="backdoor">[<a>backdoor</a>]</span>' : "") +
      contractFiles.map(file => `<span class="cct" title="${file}">@</span>`).join("");
  }

  function buildServerInfo(serverName) {
    const server = getServerInfo(serverName);
    const isHackable = server.requiredHackingSkill <= playerHackLevel;
    const strikeStyle = !isHackable ? "text-decoration: line-through;" : "";

    let moneyDisplay, moneyPercentDisplay, moneyColor;
    if (server.moneyMax > 0) {
      moneyDisplay =
        ns.nFormat(server.moneyAvailable, "$0.0a") +
        " / " +
        ns.nFormat(server.moneyMax, "$0.0a");
      const moneyRatio = server.moneyAvailable / server.moneyMax;
      moneyPercentDisplay = (moneyRatio * 100).toFixed(0) + "%";
      moneyColor = getMoneyColor(moneyRatio);
    } else {
      moneyDisplay = "N/A";
      moneyPercentDisplay = "N/A";
      moneyColor = "#ccc";
    }

    let securityDisplay, securityColor;
    if (
      typeof server.hackDifficulty === "number" &&
      typeof server.minDifficulty === "number" &&
      server.minDifficulty > 0
    ) {
      const secRatio = server.hackDifficulty / server.minDifficulty;
      securityDisplay =
        server.hackDifficulty.toFixed(2) +
        " / " +
        server.minDifficulty.toFixed(2);
      securityColor = getSecurityColor(secRatio);
    } else {
      securityDisplay = "N/A";
      securityColor = "#ccc";
    }

    let ramDisplay, ramColor;
    if (server.maxRam > 0) {
      const freeRam = server.maxRam - server.ramUsed;
      ramDisplay = freeRam.toFixed(1) + " / " + server.maxRam.toFixed(1);
      const ramRatio = freeRam / server.maxRam;
      ramColor = getRamColor(ramRatio);
    } else {
      ramDisplay = "N/A";
      ramColor = "#ccc";
    }

    return `<span class="money" style="color:${moneyColor}; ${strikeStyle}">${moneyDisplay}</span>` +
           `<span class="moneyPerc" style="color:${moneyColor}; ${strikeStyle}">${moneyPercentDisplay}</span>` +
           `<span class="security" style="color:${securityColor};">${securityDisplay}</span>` +
           `<span class="ram" style="color:${ramColor};">${ramDisplay}</span>`;
  }

  // --- Network Scanning Data Structures ---
  const discoveredServers = ["home"];
  const serverParents = [""]; // Parallel array: serverParents[i] is the parent of discoveredServers[i]
  const serverRoutes = { home: "home" };

  // Scan the network starting at "home" (without worm propagation)
  for (const currentServer of discoveredServers) {
    const adjacentServers = ns.scan(currentServer).sort((a, b) => {
      let order = ns.scan(a).length - ns.scan(b).length;
      order = order !== 0 ? order : getServerInfo(b).purchasedByPlayer - getServerInfo(a).purchasedByPlayer;
      order = order !== 0
        ? order
        : a.slice(0, 2).toLowerCase().localeCompare(b.slice(0, 2).toLowerCase());
      return order;
    });
    for (const adjacent of adjacentServers) {
      if (!discoveredServers.includes(adjacent)) {
        discoveredServers.push(adjacent);
        serverParents.push(currentServer);
        serverRoutes[adjacent] = serverRoutes[currentServer] + ";connect " + adjacent;
      }
    }
  }

  // --- Recursive Tree Builder ---
  function buildTreeRows(serverName, prefixArray) {
    let treeRows = [];
    const treeCellHTML = prefixArray.join("") + buildServerTreeEntry(serverName);
    const infoCellHTML = buildServerInfo(serverName);
    treeRows.push({ serverName, tree: treeCellHTML, info: infoCellHTML });

    for (let i = 0; i < discoveredServers.length; i++) {
      if (serverParents[i] !== serverName) continue;
      const newPrefix = prefixArray.slice();
      const hasSibling = serverParents.slice(i + 1).includes(serverParents[i]);
      newPrefix.push(hasSibling ? "├╴" : "└╴");
      if (newPrefix.length >= 2) {
        const idx = newPrefix.length - 2;
        newPrefix[idx] = newPrefix[idx].replace("├╴", "│ ").replace("└╴", "  ");
      }
      treeRows = treeRows.concat(buildTreeRows(discoveredServers[i], newPrefix));
    }
    return treeRows;
  }

  const treeRows = buildTreeRows("home", []);

  // --- Render Header & Tree ---
  const headerRowHTML = `<div class="serverscan-row serverscan-header">
    <div class="tree-cell">Server</div>
    <div class="info-cell">
      <span class="money">Money</span>
      <span class="moneyPerc">%</span>
      <span class="security">Security</span>
      <span class="ram">RAM</span>
    </div>
  </div>`;

  const finalHTML = `<div class="serverscan">
    ${headerRowHTML}
    ${treeRows
      .map(
        row => `<div class="serverscan-row" id="${row.serverName}">
          <div class="tree-cell">${row.tree}</div>
          <div class="info-cell">${row.info}</div>
        </div>`
      )
      .join("")}
  </div>`;

  insertTerminalHTML(finalHTML);

  // --- Event Listeners for Navigation ---
  documentRef.querySelectorAll(".serverscan .server").forEach(serverElem => {
    serverElem.addEventListener("click", () => navigateTerminal(serverRoutes[serverElem.innerText]));
  });
  documentRef.querySelectorAll(".serverscan .backdoor").forEach(backdoorElem => {
    backdoorElem.addEventListener("click", () => {
      const serverName = backdoorElem.parentNode.querySelector(".server").innerText;
      navigateTerminal(serverRoutes[serverName] + ";backdoor");
    });
  });
}