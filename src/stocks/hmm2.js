/** @param {NS} ns */



export async function main(ns) {

    function jsonprint(o) {
        ns.tprintf(JSON.stringify(o));
    }

    let symbols = ns.stock.getSymbols();

    function readSortedForecasts() {
        let symbols = ns.stock.getSymbols();
        let forecasts = [];
        for (let [symid,sym] of symbols.entries().take(symbols.length)) {
            let forecast = ns.stock.getForecast(sym);
            forecasts.push({sym:sym,forecast:forecast});
        }
        forecasts.sort((a,b) => {
            return b.forecast - a.forecast;
        });
        return forecasts;
    }

    while(true) {
        ns.clearLog();
        let forecasts = readSortedForecasts();


        forecasts.forEach((f) => {
            ns.printf("%5s: %6s", f.sym, ns.formatPercent(f.forecast));
        });
        //ns.write('datastore2/foobar.txt', JSON.stringify(forecasts),"a");
        await ns.sleep(6000);
    }

}