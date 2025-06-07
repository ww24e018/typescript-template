/** @param {NS} ns */
export async function main(ns) {
    if (ns.args.length == 0) {
        ns.tprintf(`commands given will be tasked as eval (port2)`)
        return;
    }
    let evalcmd = ns.args[0];
    let evalpacket = {
        task: "eval",
        data: evalcmd,
    };
    ns.tprintf(`Task is about to be written: `);
    ns.tprintf(JSON.stringify(evalpacket,null,"\t");

    ns.writePort(2, evalpacket);

    ns.tprintf("done.")

}