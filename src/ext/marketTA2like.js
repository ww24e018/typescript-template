/** @param {NS} ns **/

class Product {
    constructor(ns, productName) {
        this.productName = productName;
        this.uBound = 40;
        this.lBound = 2;
        this.lastAction = 'None'
        this.division = ns.args[0]
        this.city = 'Sector-12' // city with most production employees..

    }
    setLastAction(newLastAction) {
        this.lastAction = newLastAction
    }
    setLowerBound(newLowerBound) {
        this.lBound = parseInt(newLowerBound);
        if (this.lBound > this.uBound) { this.uBound = this.lBound * 2 }

    }
    setUpperBound(newUpperBound) {
        this.uBound = parseInt(newUpperBound);
        if (this.lBound > this.uBound) { this.uBound = this.lBound * 2 }

    }
    getNewMulti(ns) {
        return ('MP*' + Math.floor((this.uBound + this.lBound) / 2))
    }
    setNewProdPrice(ns) {

        ns.corporation.sellProduct(this.division, this.city, this.productName, 'MAX', this.getNewMulti(ns), true)

    }
    update(ns) {
        this.productInfo = ns.corporation.getProduct(this.division, this.city, this.productName)
        this.curMulti = this.productInfo.desiredSellPrice.slice(3)
        this.prodQtyHeld = this.productInfo.stored;                  //cityData[this.city][0]
        this.prodQtyProduced = this.productInfo.productionAmount;      //.cityData[this.city][1]
        this.prodQtySold = this.productInfo.actualSellAmount;        //.cityData[this.city][2]
        if(isNaN(this.prodQtySold) || (this.prodQtySold < 0.001)) this.prodQtySold = 0;
        ns.tprint(JSON.stringify(this.prodQtySold));
    }
}

export async function main(ns) {
    const allCities = ['Aevum', 'Chongqing', 'Sector-12', 'New Tokyo', 'Ishima', 'Volhaven']
    const divToUpgrade = ns.args[0]
    let deBug = false
    let city = 'Sector-12' // Choose city with largest # of employees = lowest price
    let myProducts = []
    if (divToUpgrade == null || divToUpgrade == undefined) {
        ns.tprint('Must supply Division as argument!! ')
        ns.exit()
    }

    ns.tail()

    let done = false
    let lastRoundAdvertCount = ns.corporation.getHireAdVertCount(divToUpgrade)

    while (!done) {
        let myDiv = ns.corporation.getDivision(divToUpgrade)
        let thisRoundAdvertCount = ns.corporation.getHireAdVertCount(divToUpgrade)
        let warehouseInfo = ns.corporation.getWarehouse(divToUpgrade, city)
        let warehousePercentFull = warehouseInfo.sizeUsed / warehouseInfo.size

        //ns.tprint(JSON.stringify(myDiv,null,2));

        for (let product of myDiv.products) {
            if (!myProducts.includes(product)) {
                let newProduct = ns.corporation.getProduct(divToUpgrade,city, product)
                if (newProduct.developmentProgress >= 100) {
                    myProducts.push(product)
                    myProducts[product] = new Product(ns, product)
                    myProducts[product].setNewProdPrice(ns)
                }

            }
            if (myProducts.includes(product)) {
                myProducts[product].update(ns)
                if (myProducts[product].productInfo.developmentProgress < 100) {
                    myProducts[product].setLastAction('In Development | NC')

                } else if (myProducts[product].productInfo.desiredSellPrice == 'MP'
                    || myProducts[product].productInfo.desiredSellPrice == 0
                    || myProducts[product].productInfo.desiredSellPrice == null
                    || myProducts[product].productInfo.desiredSellPrice == undefined) {
                    myProducts[product].setNewProdPrice(ns)
                    myProducts[product].setLastAction('Was MP | set Multi')
                } else {
                    if (thisRoundAdvertCount > lastRoundAdvertCount) {
                        //if adverts purchased, price need to go up.
                        myProducts[product].setUpperBound(myProducts[product].curMulti * 1.25)
                        myProducts[product].setLastAction('Advert + | Upper+')

                    } else if (myProducts[product].prodQtyProduced == myProducts[product].prodQtySold && myProducts[product].prodQtyHeld == 0) {
                        //price is low, cannot tell how low with out raising upper bound
                        myProducts[product].setLowerBound(myProducts[product].curMulti * .95)
                        myProducts[product].setUpperBound(myProducts[product].curMulti * 1.5)
                        myProducts[product].setLastAction('Prod=Sold & held=0 | Upper+')

                    } else if (myProducts[product].prodQtyProduced > myProducts[product].prodQtySold) {
                        // price is too high, set upper bound
                        myProducts[product].setUpperBound(myProducts[product].curMulti)
                        myProducts[product].setLastAction('Prod>Sold | Set Upper')

                    } else if (myProducts[product].prodQtyProduced < myProducts[product].prodQtySold) {
                        // Price is too low set lower bound
                        if ((myProducts[product].prodQtyProduced - myProducts[product].prodQtySold) > 1) {
                            // A little fine tuning...
                            myProducts[product].setLowerBound(myProducts[product].curMulti * .98)
                        } else {
                            myProducts[product].setLowerBound(myProducts[product].curMulti)
                            myProducts[product].setLastAction('Prod<Sold | Set Lower')
                        }

                    }
                    if (warehousePercentFull > .9) {
                        // If warehouse is getting full, price is too high..
                        myProducts[product].setLowerBound(myProducts[product].curMulti * .85)
                        myProducts[product].setLastAction('warehouse full|Lower-')

                    }

                    myProducts[product].setNewProdPrice(ns)

                }

            }
        }


        lastRoundAdvertCount = thisRoundAdvertCount


        const colOne = 9  		//prodName
        const colTwo = 7   		//CurrMulti
        const colThree = 10 	//sCost
        const colFour = 9   	//lBound
        const colFive = 9 		//Ubound
        const colSix = 9		//QtyProd
        const colSeven = 10		//QtySold
        const colEight = 10		//QtyHeld
        const colNine = 30		//lastAction
        const totalWidth = colOne + colTwo + colThree + colFour + colFive + colSix + colSeven + colEight + colNine

        ns.print("-".padStart(totalWidth, "-"));
        ns.print(
            "Product".padStart(colOne),
            "Multi".padStart(colTwo),
            "sCost".padStart(colThree),
            "LwrBnd".padStart(colFour),
            "UprBnd".padStart(colFive),
            "QtyProd".padStart(colSix),
            "QtySold".padStart(colSeven),
            "QtyHeld".padStart(colEight),
            "LastAction".padStart(colNine),
        )
        ns.print("-".padStart(totalWidth, "-"));

        for (let product of myDiv.products) {

            if (myProducts.includes(product)) {
                let strSCost = myProducts[product].productInfo.sCost
                if (strSCost == 0 || strSCost == null || strSCost == undefined) { strSCost = 'MP' }
                ns.print(
                    myProducts[product].productName.padStart(colOne),
                    ns.nFormat(myProducts[product].curMulti, '0.00a').padStart(colTwo),
                    strSCost.padStart(colThree),
                    ns.nFormat(myProducts[product].lBound, '0.00a').padStart(colFour),
                    ns.nFormat(myProducts[product].uBound, '0.00a').padStart(colFive),
                    ns.nFormat(myProducts[product].prodQtyProduced, '0.00a').padStart(colSix),
                    ns.nFormat(myProducts[product].prodQtySold, '0.00a').padStart(colSeven),
                    ns.nFormat(myProducts[product].prodQtyHeld, '0.00a').padStart(colEight),
                    myProducts[product].lastAction.padStart(colNine),

                )
            }
        }
        ns.print("-".padStart(totalWidth, "-"));
        await ns.sleep(10000)
    }
}