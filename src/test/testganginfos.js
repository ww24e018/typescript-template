/** @param {NS} ns */

import * as out from '../lib2/liboutput.js';

export async function main(ns) {
    out.setNS(ns);

    let ganginfo ;
    if (ns.gang?.inGang()) {
        ganginfo = ns.gang.getGangInformation()
    } else {
        ns.tprintf("No Gang or no Api. gang?.inGang() was falsy");
        return;
    }

    let memberNames = ns.gang.getMemberNames();

    out.jsontprint(ganginfo);
    out.jsontprint(memberNames);
}