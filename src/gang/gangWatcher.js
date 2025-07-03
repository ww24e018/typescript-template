/** @param {NS} ns */

import * as out from '../lib2/liboutput.js';

export async function main(ns) {
    out.setNS(ns);


    let gangInfo, memberNames ;

    let updateInfoVars = () => {
        gangInfo =  ns.gang.getGangInformation();
        memberNames = ns.gang.getMemberNames();
    }; updateInfoVars()

    while(ns.gang?.inGang()){
        ns.clearLog()
        updateInfoVars()
        out.jsonprint(gangInfo, "  ");
        out.jsonprint(memberNames);

        await ns.gang.nextUpdate()
    }

}