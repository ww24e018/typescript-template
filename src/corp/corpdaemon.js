/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("disableLog"); ns.disableLog("sleep");
    var corp = ns.corporation.getCorporation();

    if (corp.divisions.length < 1) ns.printf("no divisions yet");

    while(true) {
        let divisonname  = corp.divisions[0];
        let city = "Sector-12";
        let {maxEnergy,maxMorale,avgEnergy,avgMorale} = ns.corporation.getOffice(divisonname, city);
        let [percentEnergy, percentMorale] = [avgEnergy/maxEnergy, avgMorale/maxMorale];
        ns.printf(`morale: ${Math.round(percentMorale*100)}%%  ${avgMorale} / ${maxMorale} `);
        ns.printf(`energy: ${Math.round(percentEnergy*100)}%%  ${avgEnergy} / ${maxEnergy} `);

        if(percentMorale < 0.95) {
            ns.corporation.buyTea(divisonname, city);
        }

        await ns.sleep(10000); // cycle = 10 seconds says doc
    }
}