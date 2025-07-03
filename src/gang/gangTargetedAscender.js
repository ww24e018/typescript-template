/** @param {NS} ns */

import * as out from '../lib2/liboutput.js';

export async function main(ns) {
    out.setNS(ns);

    const memberName = "4";
    const xpLowerBound = 31000;
    const purchaseEquipment = ["Katana", "Baseball Bat", "Glock 18C"]

    let memberInfo ;

    let updateInfoVars = () => {
        memberInfo =  ns.gang.getMemberInformation(memberName);
    }; updateInfoVars()

    while(ns.gang?.inGang()){
        ns.clearLog()
        updateInfoVars()
        out.jsonprint(memberInfo, "  ");
        if (memberInfo.dex_exp > xpLowerBound){
            ns.gang.ascendMember(memberName);
            if (purchaseEquipment) {
                for (let pE of purchaseEquipment){
                    ns.gang.purchaseEquipment(memberName,pE)
                }
            }
        }

        await ns.gang.nextUpdate()
    }

}