/** @param {NS} ns */
let daemonPath = "test/testdaemon.js";

export async function main(ns) {
    let daemonTicks = 0;
    while(true) {
        ns.printf(`i am a daemonwatcher. (ticking: ${daemonTicks})`);
        // check for the daemon
        let isDaemonRunning = ns.isRunning(daemonPath);
        if (!isDaemonRunning) {
            ns.printf(`The daemon was not found running. restarting ..`);
            ns.run(daemonPath);
        }
        await ns.sleep(2000); daemonTicks++;
    }
}