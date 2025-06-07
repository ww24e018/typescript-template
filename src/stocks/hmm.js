/** @param {NS} ns */



export async function main(ns) {

    function jsonprint(o) {
        ns.tprintf(JSON.stringify(o));
    }

    let symbols = ns.stock.getSymbols();
    jsonprint(symbols);
    for (let [symid,sym] of symbols.entries().take(20)) {
        jsonprint(sym);
        jsonprint(ns.stock.getForecast(sym));


    }
}