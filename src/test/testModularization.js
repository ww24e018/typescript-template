/** @param {NS} ns */

import * as out from '../lib2/liboutput.js';

export async function main(ns) {

    out.setNS(ns);
    out.jsontprint({hello:"world"});
    out.jsontprint(out.nowString());
}