/** @param {NS} ns */
export async function main(ns) {


    function nowString() {
        let nowdate = new Date();
        let [hour, min, sec, msec] = [nowdate.getHours(), nowdate.getMinutes(), nowdate.getSeconds(), nowdate.getMilliseconds()];
        let funcPad2 = function (n) {
            return n.toString().padStart(2, '0')
        };
        return `${funcPad2(hour)}:${funcPad2(min)}:${funcPad2(sec)}`;
    }

    let timestring = nowString();

    ns.tprintf(timestring);

}