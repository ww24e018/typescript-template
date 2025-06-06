/** @param {NS} ns */
export async function main(ns) {
    let filename = "datastore/testing.txt";
    if(ns.fileExists(filename)) ns.clear(filename);
    let thingtowrite = ns.getPlayer();
    let json_pretty = JSON.stringify(thingtowrite,null,"\t");
    await ns.write(filename, json_pretty);

}