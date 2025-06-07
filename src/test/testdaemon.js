/** @param {NS} ns */

function portHadStuff(portReadResult) {
    if (typeof portReadResult != "string") return true;
    if (portReadResult == "NULL PORT DATA") return false;
    return true;
}

export async function main(ns) {
    let daemonTicks = 0;
    ns.disableLog("sleep")
    // eslint-disable-next-line no-constant-condition
    while(true) {
        if ((daemonTicks % 100) == 0) ns.printf(`i am a daemon. (ticking: ${daemonTicks})`);
        let portReadResult = ns.readPort(2);
        while (portHadStuff(portReadResult)) {
            // let's test this first
            ns.printf(`Read from port: `);
            ns.printf(JSON.stringify(portReadResult,null,"\t"));
            try {
                let {task:taskname, data:taskdata} = portReadResult
                if ("eval" == taskname) ns.printf(JSON.stringify(eval(taskdata)));
            } catch (e) {
                ns.print("caught error. error follows\n");
                ns.print(e);
            }

            // wellwellwell.
            await ns.sleep(500); // seems risky
            portReadResult = ns.readPort(2);
        }
        await ns.sleep(2000); daemonTicks++;
    }
}