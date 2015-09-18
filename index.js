'use strict';

let debug = require('debug')('koa-ip-geo');
let mmdbReader = require('mmdb-reader');
let fs = require('fs');

module.exports = ip;

function ip(conf) {
  let reader;
  if (typeof conf !== 'object') {
    if (typeof conf === 'string') {
      conf = {whiteListIP: [conf]};
    } else {
      conf = {};
    }
  }

  conf.development = conf.development || false;

  if (Array.isArray(conf)) {
    conf = {whiteListIP: conf};
  }
  if (conf.whiteListIP && typeof conf.whiteListIP === 'string') {
    conf.whiteListIP = [conf.whiteListIP];
  }
  if (conf.blackListIP && typeof conf.blackListIP === 'string') {
    conf.blackListIP = [conf.blackListIP];
  }
  if (conf.whiteListCountry && typeof conf.whiteListCountry === 'string') {
    conf.whiteListCountry = [conf.whiteListCountry];
  }
  if (conf.blackListCountry && typeof conf.blackListCountry === 'string') {
    conf.blackListCountry = [conf.blackListCountry];
  }
  if (conf.whiteListContinent && typeof conf.whiteListContinent === 'string') {
    conf.whiteListContinent = [conf.whiteListContinent];
  }
  if (conf.blackListContinent && typeof conf.blackListContinent === 'string') {
    conf.blackListContinent = [conf.blackListContinent];
  }

  if (conf.geoDB && typeof conf.geoDB === 'string') {
    try {
      fs.accessSync(conf.geoDB, fs.R_OK);
      reader = new mmdbReader(conf.geoDB);  
    } catch(ex) {
      debug((new Date).toUTCString() + ' ERROR - GeoDB file ' + conf.geoDB + ' not found');
    }
  }

  var forbidden = conf.forbidden || '403 Forbidden'

  return function* (next) {

    if (conf.development) {
      yield next;
    } else {
      let _ip = this.ip;
      let _country = '-';
      let _continent = '-';

      let pass = false;
      let handled = false;

      if (conf.whiteListIP && Array.isArray(conf.whiteListIP)) {
        pass = conf.whiteListIP.some(function (item) {
          return RegExp(item).test(_ip);
        });
        handled = pass;
      } else {
        if (conf.blackListIP && Array.isArray(conf.blackListIP)) {
          pass = !conf.blackListIP.some(function (item) {
            return RegExp(item).test(_ip);
          });
          handled = !pass;
        }    
      }

      // IP white / blacklisted --> filter by geocoding needed
      if ((!handled) && (conf.whiteListCountry || conf.blackListCountry || conf.whiteListContinent || conf.blackListContinent)) {
        if (reader) {
          let data = reader.lookup(_ip);
          
          if (data) {
            _country = (data.country && data.country.iso_code) ? data.country.iso_code : '';
            _continent = (data.continent && data.continent.code) ? data.continent.code : '';

            // try to handle by whiteList / blackList county
            if (conf.whiteListCountry && Array.isArray(conf.whiteListCountry)) {
              pass = conf.whiteListCountry.some(function (item) {
                return RegExp(item).test(_country);
              });
              handled = pass;
            } else {
              if (conf.blackListCountry && Array.isArray(conf.blackListCountry)) {
                pass = !conf.blackListCountry.some(function (item) {
                  return RegExp(item).test(_country);
                });
                handled = !pass;
              }
            }

            // still not handled (by whiteList / blackList county) -- handle by whiteList / blackList continent
            if (!handled) {
              if (conf.whiteListContinent && Array.isArray(conf.whiteListContinent)) {
                pass = conf.whiteListContinent.some(function (item) {
                  return RegExp(item).test(_continent);
                });
                handled = pass;
              } else {
                if (conf.blackListContinent && Array.isArray(conf.blackListContinent)) {
                  pass = !conf.blackListContinent.some(function (item) {
                    return RegExp(item).test(_continent);
                  });
                  handled = !pass;
                }
              }
            }
          }
        } else {
            pass = true;
            debug((new Date).toUTCString() + ' ' + _ip + ' ERROR - no GeoDB');
        }
      } 

      if (pass) {
        debug((new Date).toUTCString() + ' ' + _ip + ((_continent != '-') ? ' ' + _continent : '') + ((_country != '-') ? ' ' + _country : '') + ' -> ✓');
        yield next;
      } else {
        debug((new Date).toUTCString() + ' ' + _ip + ((_continent != '-') ? ' ' + _continent : '') + ((_country != '-') ? ' ' + _country : '') + ' -> ×');
        this.status = 403
        this.body = typeof forbidden === 'function' ? forbidden.call(this, this) : forbidden
        return

      }
    }
  }
}