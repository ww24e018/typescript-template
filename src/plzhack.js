/** @param {NS} ns */
export async function main(ns) {
  const args = ns.flags([['help', false]]);
  const victim = args._[0];;
  if(args.help || !victim) {
    ns.tprint(`USAGE: run ${ns.getScriptName()} VICTIM_HOST `);
    return
  }
  let server = ns.getServer(victim);
  ns.tprint(`The host ${server.hostname} .. was choosen.`);
  if (server.hasAdminRights) {
    if (server.backdoorInstalled) {
      ns.tprint(`The host ${server.hostname} .. is open and backdoored.`);
    } else {
      ns.tprint(`The host ${server.hostname} .. is open but needs backdooring.`);
    }
  } else {
    ns.tprint(`The host ${server.hostname} has not been rooted yet (check:${ns.hasRootAccess(server.hostname)})`);
    if (!server.sshPortOpen) ns.brutessh(server.hostname) ;
    if (!server.ftpPortOpen) ns.ftpcrack(server.hostname) ;
    if (!server.smtpPortOpen) ns.relaysmtp(server.hostname) ;
    if (!server.httpPortOpen) ns.httpworm(server.hostname) ;
    if (!server.sqlPortOpen) ns.sqlinject(server.hostname) ;
    ns.nuke(server.hostname) ;
    server = ns.getServer(victim) ;
    ns.tprint(`Should be done now. hasAdminRights = ${server.hasAdminRights}`);
  }
}

export function autocomplete(data, args) {
    return data.servers;
}