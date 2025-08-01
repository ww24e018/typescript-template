
let internals = {}

export function setNS(ns) {
    internals.ns = ns;
}

function getNS() {
    if (internals.ns) {
        return internals.ns;
    } else {
        throw new Error(`plz call setNS() before use. ns not set: ${internals.ns}`);
    }
}

export function jsontprint(o, f="") {
    getNS().tprintf(JSON.stringify(o,null,f));
}
export function jsonprint(o, f="") {
    getNS().printf(JSON.stringify(o,null,f));
}

export function nowString() {
    let nowdate = new Date();
    let [hour, min, sec, msec] = [nowdate.getHours(), nowdate.getMinutes(), nowdate.getSeconds(), nowdate.getMilliseconds()];
    let funcPad2 = function (n) {
        return n.toString().padStart(2, '0')
    };
    return `${funcPad2(hour)}:${funcPad2(min)}:${funcPad2(sec)}`;
}

