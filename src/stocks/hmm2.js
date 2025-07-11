/** @param {NS} ns */



export async function main(ns) {

    function jsonprint(o) {
        ns.tprintf(JSON.stringify(o));
    }

    let symbols = ns.stock.getSymbols();

    function calculateScore(forecast, volatility) {
        return (forecast-0.50)*volatility*1000;
    }

    function readSortedForecasts() {
        let symbols = ns.stock.getSymbols();
        let forecasts = [];
        for (let [symid,sym] of symbols.entries().take(symbols.length)) {
            let forecast = ns.stock.getForecast(sym);
            let volatility = ns.stock.getVolatility(sym);
            forecasts.push({
                sym:sym,
                forecast:forecast,
                volatility: volatility,
                score: calculateScore(forecast, volatility)
            });
        }
        forecasts.sort((a,b) => {
            return b.forecast - a.forecast;
        });
        return forecasts;
    }

    ns.disableLog("sleep");
    while(true) {
        ns.clearLog();
        let forecasts = readSortedForecasts();


        forecasts.forEach((f) => {
            ns.printf("%5s: %3.2f %5.4f %5.4f", f.sym, f.forecast, f.volatility, f.score);
        });
        //ns.write('datastore2/foobar.txt', JSON.stringify(forecasts),"a");
        await ns.sleep(6000);
    }

}