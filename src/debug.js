

/** @param {NS} ns */



export async function main(ns) {
  //ns.tprint(ns.getServer('foobar'));
  ns.tprint(ns.getPlayer().factions);
  ns.tprint(ns.getPlayer().factions.includes('The Black Hand'));
  ns.tprint(JSON.stringify(Cit  .map((c) => {ns.corporation.getOffice('tobacco', c)}),null,"\t"))
}