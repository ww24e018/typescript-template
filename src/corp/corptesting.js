/** @param {NS} ns */
export async function main(ns) {
    function jsontprint(o) {
        ns.tprintf(JSON.stringify(o,null,"  "));
    }
    function jsonprint(o) {
        ns.printf(JSON.stringify(o,null,"  "));
    }

    // ns.corporation.getOffice("tobacco", "Sector-12")
    // da steht nur allg. zeugs drinen.

    //ns.corporation.getProduct('tobacco','Sector-12', "cig4")

    jsontprint(
        //ns.corporation.getDivision('tobacco')
        ns.corporation.getCorporation().divisions
    )

}