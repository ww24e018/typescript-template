/** @param {NS} ns */



export async function main(ns) {

    ns.disableLog('stock.buyStock');
    ns.disableLog('stock.sellStock');

    function jsontprint(o) {
        ns.tprintf(JSON.stringify(o));
    }
    function jsonprint(o) {
        ns.printf(JSON.stringify(o,null,"  "));
    }

    function nowString() {
        let nowdate = new Date();
        let [hour, min, sec, msec] = [nowdate.getHours(), nowdate.getMinutes(), nowdate.getSeconds(), nowdate.getMilliseconds()];
        let funcPad2 = function (n) {
            return n.toString().padStart(2, '0')
        };
        return `${funcPad2(hour)}:${funcPad2(min)}:${funcPad2(sec)}`;
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

    function readPositionDict(sym) {
        let position = ns.stock.getPosition(sym);
        let [longShares, longSharesAvgPrice,
             shortShares, shortSharesAvgPrice] = position ;
        if (position.some((e)=> e!=0)) {
            return {longShares,longSharesAvgPrice,shortShares,shortSharesAvgPrice};
        } else {
            return null;
        }

    }

    function collectPositions() {
        let notNullPositions = [];
        for (let [,sym] of ns.stock.getSymbols().entries()) {
            let postionDict = readPositionDict(sym)
            if (postionDict) {
                notNullPositions.push({
                    sym: sym,
                    positions: postionDict,
                    forecast: ns.stock.getForecast(sym),
                    volatility: ns.stock.getVolatility(sym),
                });

            };
            // otherwise skip
        }
        return notNullPositions;
    }

    ns.clearLog();

    function tryToBuyStuff() {
        // refuse to consider buying if less than ... 10*10 = 10 billion ; 10**8 = 100 million
        if (ns.getPlayer().money < (10 ** 8)) return;

        let optionsForBuying = readSortedForecasts();
        optionsForBuying = optionsForBuying
            .filter((d) => {
                return d.forecast > 0.59;
            })
            .filter((d) => {
                // this is supposed to filter out stuff we already have.
                return !ns.stock.getPosition(d.sym).some((i) => i != 0);
            })
        ;
        optionsForBuying.sort((a, b) => {
            return b.score - a.score
        })

        if (optionsForBuying.length > 0) {
            let chosenOption = optionsForBuying[0];

            let {sym, forecast, volatility, score} = chosenOption;
            // how many to buy
            let moneyAvailable = Math.floor(ns.getPlayer().money)
                - 1.1 * ns.stock.getConstants().StockMarketCommission - 200000;
            let maxShares = Math.min(
                Math.floor(moneyAvailable / ns.stock.getAskPrice(sym)) ,
                ns.stock.getMaxShares(sym)
            )
            let boughtAtprice = ns.stock.buyStock(sym, maxShares);
            ns.printf(`${nowString()}  buy:  ${sym.padStart(5," ")} fc %.3f & vol. = %.4f & score = %.4f`,
                forecast, volatility, score)
        }
    }

    while(true) {
        //ns.clearLog();

        // do we have positions?
        let currentPositions = collectPositions();

        if (currentPositions.length > 0) {
            // is it time to sell or time to wait?

            // if we buy when the forecast is high-positive, if it jumps to negative ..
            // it is time. also: what if we have more than one?
            // also: for the time assume it is all long

            for (const position of currentPositions) {
                let {forecast:forecast, positions:pos, sym:symbol} = position;

                if ((forecast < 0.51) && (position.positions.longShares > 0)) {
                    ns.printf(`${nowString()}  sell: ${symbol.padStart(5," ")} - forecast dropped to %3.1f`, forecast);
                    let price = ns.stock.sellStock(position.sym, position.positions.longShares)
                }

                /*if ((forecast > 0.49) && (pos.positions.shortShares > 0)) {
                    ns.printf(`## selling ${symbol}. reason: forecast somewhat positive (%3.1f)`, forecast);
                    let price = ns.stock.sellShort(position.sym, pos.positions.shortShares)
                }*/

            }

            tryToBuyStuff();

        } else {
            // why don't we?
            tryToBuyStuff();
        }


        await ns.stock.nextUpdate();
    }

}