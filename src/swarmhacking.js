/** @param {NS} ns */
export async function main(ns) {
    const args = ns.flags([['help', false]]);
    const hostname_server = args._[0];
    const hostname_victim = args._[1];
    const ms_between_launches = args._[2];
    const threads_w = args._[3];
    const threads_g = args._[4];
    const threads_h = args._[5];
    const configstring = `v1cfs::${hostname_server}->${hostname_victim}-${ms_between_launches}ms--${threads_w}/${threads_g}/${threads_h}`;
    if(args.help || !hostname_server || !hostname_victim) {
        ns.tprint("This runs a swarm of weaken/grow/hack scripts, on a server of your choice. Conf = todo");
        ns.tprint(`USAGE: run ${ns.getScriptName()} SERVER_HOST SERVER_TARGET timing(ms) w-threads g-threads h-threads`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()} myserver noodles .. things`);
        return;
    }
    // q: how many intervals will pass for the first weaken to get active
    let ticks_to_first_weaken  = Math.floor(ns.getWeakenTime(hostname_victim) / ms_between_launches)+1; 
    let delayhackcountdown = args._[6]?args._[6]:ticks_to_first_weaken;

    let ticks_to_first_grow = Math.round(ns.getGrowTime(hostname_victim) / ms_between_launches);
    var ticks_to_wait_for_grow = ticks_to_first_weaken - ticks_to_first_grow;

    let checkTheServerName = function(servername) {
      if (servername == ns.getHostname()) return true; // means its a valid servername getServer defaults to getHostname
      var serverobj = ns.getServer(servername)
      if (servername != serverobj.hostname) return false; // getServer(hostname).hostname != hostname sagt default return/false hostname
      return true; 
    }
    if(!checkTheServerName(hostname_victim) && !checkTheServerName(hostname_victim)) return 1;
    
    while(true) {
      if (threads_w > 0)
          ns.exec("component/singleweaken.js", hostname_server, threads_w, hostname_victim, configstring);
      if (threads_g > 0 && ticks_to_wait_for_grow <= 0) {
          ns.exec("component/singlegrow.js", hostname_server, threads_g, hostname_victim, configstring);
      } else {
          ticks_to_wait_for_grow = Math.max(0,ticks_to_wait_for_grow-1); 
      }
      if (!delayhackcountdown) {
        if (threads_h > 0)
            ns.exec("component/singlehack.js", hostname_server, threads_h, hostname_victim, configstring);
      } else {
        delayhackcountdown--;
        //ns.print(delayhackcountdown);
      }
      ns.printf("ticksToGrow/hackcountdown = %6d -- %6d\n", ticks_to_wait_for_grow, delayhackcountdown)
      await ns.sleep(ms_between_launches);
    }
 
}