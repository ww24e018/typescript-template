/** @param {NS} ns */
export async function main(ns) {
    let p1 = ns.args[0];
    ns.tprint(JSON.stringify(ns.args, null, "\t"));
    ns.tprint(JSON.stringify(eval(ns.args[0]), null, "\t"));

}