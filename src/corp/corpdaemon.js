/** @param {NS} ns */
import {CityName} from "@ns";


export async function main(ns) {
    ns.disableLog("disableLog"); ns.disableLog("sleep");
    var corp = ns.corporation.getCorporation();

    // here it has ns in scope
    function supplyTheWorkers(divisonname, city) {
        let {maxEnergy,maxMorale,avgEnergy,avgMorale} = ns.corporation.getOffice(divisonname, city);
        let [percentEnergy, percentMorale] = [avgEnergy/maxEnergy, avgMorale/maxMorale];
        let doDetailPrint = false;
        if (doDetailPrint) {
            ns.printf(`morale/energy at %12s: %4.1f%% %4.1f %%`, city, percentMorale*100, percentEnergy*100);
        }

        if(percentEnergy < 0.95) {
            ns.corporation.buyTea(divisonname, city);
        }
        if(percentMorale < 0.95) {
            ns.corporation.throwParty(divisonname, city, 300000)
        }

    }

    function getCurrentFunds() {
        return ns.corporation.getCorporation().funds
    }

    if (corp.divisions.length < 1) ns.printf("no divisions yet");

    let [fundsNow, fundsTminus1] = [getCurrentFunds(), getCurrentFunds()];
    while(true) {
        let divisionname  = corp.divisions[0];
        let division = ns.corporation.getDivision(divisionname);
        //ns.printf(JSON.stringify(division));
        for (let city of division.cities) {
            supplyTheWorkers(divisionname, city);
        };
        /*supplyTheWorkers(divisionname, "Sector-12");
        supplyTheWorkers(divisionname, "Aevum");
        supplyTheWorkers(divisionname, "Chongqing");*/

        [fundsNow, fundsTminus1] = [getCurrentFunds(), fundsNow];
        let str = ns.formatNumber(fundsNow)
        ns.printf("Funds: %10s -- delta %10s", str , ns.formatNumber(fundsNow-fundsTminus1));

        await ns.sleep(10000); // cycle = 10 seconds says doc
    }
}