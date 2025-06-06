/** @param {NS} ns */

function portHadStuff(portReadResult) {
    if (typeof portReadResult != "string") return true;
    if (portReadResult == "NULL PORT DATA") return false;
    return true;
}

export async function main(ns) {
    let daemonTicks = 0;
    while(true) {
        ns.printf(`i am a daemon. (ticking: ${daemonTicks})`);
        let portReadResult = ns.readPort(2);
        while (portHadStuff(portReadResult)) {
            // lets test this first
            ns.printf(`Read from port: `);
            ns.printf(JSON.stringify(portReadResult,null,"\t"));

            // wellwellwell.
            await ns.sleep(500); // seems risky
            portReadResult = ns.readPort(2);
        }
        await ns.sleep(2000); daemonTicks++;
    }
}