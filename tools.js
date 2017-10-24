
exports.corrIP =function(ip) {
    if (ip.indexOf(':') !== -1 && ip.indexOf('.') !== -1) {
      ip = ip.split(':')
      if(ip.length === 2){
        // return ipv4 base address if port is specified in ctx.ip
        ip = ip[0];
      } else {
        // fix for IPv6 Dotted-quad notation
        ip = ip[ip.length-1];
      }
      
    }
    return(ip);
}

exports.corrLocalhost = function(list) {
    if (list.indexOf('127.0.0.1') !== -1 || list.indexOf(':.1') !== -1 || list.indexOf('localhost') !== -1) {
        if (list.indexOf('127.0.0.1') === -1) list.push('127.0.0.1');
        if (list.indexOf('::1') === -1) list.push('::1');
        if (list.indexOf('localhost') === -1) list.push('localhost');
    }
    return(list);
}
