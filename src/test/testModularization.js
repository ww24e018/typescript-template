/** @param {NS} ns */

import * as out from '../lib2/liboutput.js';

export async function main(ns) {

    out.setNS(ns);
    out.jsontprint({hello:"world"});
    out.jsontprint(out.nowString());
    out.jsontprint(ns.getBitNodeMultipliers(), 2)
    out.jsontprint(ns.formulas.hacknetNodes.moneyGainRate(1,1,1,1));
}