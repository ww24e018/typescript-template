/** @param {NS} ns */

import * as out from '../lib2/liboutput.js';



export async function main(ns) {

        out.setNS(ns);
        out.jsontprint({hello:'world'});

        // lets do ... stuff. list of our nodes perhaps.

        // getNodeStats
        // numNodes
        // nodeStats: name, level, ram, cores; production timeOnline totalProduction

        function makeConfDict(lvl,ram,cores) {
                return { level: lvl, ram: ram, cores:cores};
        }

        function mostEfficientUpgradeComingFrom(o) {
                // o ist config
                let o_prod = ns.formulas.hacknetNodes.moneyGainRate(o.level,o.ram,o.cores);
                let {production:prodmult}= ns.getHacknetMultipliers();
                return o_prod*prodmult;
        }

        ns.tprintf(`#  lvl ram cores name prod predictedprod`)
        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
                let n = ns.hacknet.getNodeStats(i);
                let {name,level,ram,cores,production} = n;
                ns.tprintf(`%2d %3d %2d %2d  %-17s %11.5f   %11.5f`, i, level,ram,cores, name, production,
                    mostEfficientUpgradeComingFrom({level,ram,cores}));
        }

}
