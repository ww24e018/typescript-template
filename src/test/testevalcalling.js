/** @param {NS} ns */
export async function main(ns) {
    let evalteststring =
        `
          ns.tprint("helloworld");
          1+1; 
        `;
    ns.run("test/testeval.js",1,evalteststring);
}