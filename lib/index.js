'use strict';

const debug = require('debug')('koa-ip-geo');
const mmdbReader = require('mmdb-reader');
const ip2loc = require("ip2location-nodejs");
const fs = require('fs');
const path = require('path');
const tools = require('./tools');

module.exports = ipGeoFilter;

function ipGeoFilter(conf) {
  let reader;
  let dbLoaded = false;

  const continents = tools.getJsonFile(path.join(__dirname, './continents.json'));
  // ---------------------------------
  // CONFIGURATION
  // ---------------------------------

  // parameter handling - allows wider range of possible parameter types
  if (typeof conf !== 'object') {
    if (typeof conf === 'string') {
      conf = { whiteListIP: conf.split(' ') };
    } else {
      conf = {};
    }
  }

  conf.development = conf.development || false;
  conf.context = conf.context || false;
  conf.geoDBtype = conf.geoDBtype || '';
  if (!conf.geoDBtype && conf.geoDB && typeof conf.geoDB === 'string' && conf.geoDB.toLowerCase().indexOf('.mmdb') > -1) {
    conf.geoDBtype = 'maxmind';
  } else if (!conf.geoDBtype && conf.geoDB && typeof conf.geoDB === 'string' && conf.geoDB.toLowerCase().indexOf('.bin') > -1) {
    conf.geoDBtype = 'ip2location';
  } else if (!conf.geoDBtype) {
    conf.geoDBtype = 'maxmind';
  }

  if (Array.isArray(conf)) {
    conf = { allowIP: conf };
  }
  // move to new interface
  if (conf.whiteListIP) {
    conf.allowIP = conf.whiteListIP;
    delete conf.whiteListIP;
  }
  if (conf.blackListIP) {
    conf.blockIP = conf.blackListIP;
    delete conf.blackListIP;
  }
  if (conf.whiteListCountry) {
    conf.allowCountry = conf.whiteListCountry;
    delete conf.whiteListCountry;
  }
  if (conf.blackListCountry) {
    conf.blockCountry = conf.blackListCountry;
    delete conf.blackListCountry;
  }
  if (conf.whiteListContinent) {
    conf.allowContinent = conf.whiteListContinent;
    delete conf.whiteListContinent;
  }
  if (conf.blackListContinent) {
    conf.blockContinent = conf.blackListContinent;
    delete conf.blackListContinent;
  }

  if (conf.allowIP && typeof conf.allowIP === 'string') {
    conf.allowIP = conf.allowIP.split(' ');
  }
  if (conf.allowIP && Array.isArray(conf.allowIP)) {
    conf.allowIP = tools.corrLocalhost(conf.allowIP);
  }
  if (conf.blockIP && typeof conf.blockIP === 'string') {
    conf.blockIP = conf.blockIP.split(' ');
  }
  if (conf.blockIP && Array.isArray(conf.blockIP)) {
    conf.blockIP = tools.corrLocalhost(conf.blockIP);
  }
  if (conf.allowCountry && typeof conf.allowCountry === 'string') {
    conf.allowCountry = conf.allowCountry.split(' ');
  }
  if (conf.blockCountry && typeof conf.blockCountry === 'string') {
    conf.blockCountry = conf.blockCountry.split(' ');
  }
  if (conf.allowContinent && typeof conf.allowContinent === 'string') {
    conf.allowContinent = conf.allowContinent.split(' ');
  }
  if (conf.blockContinent && typeof conf.blockContinent === 'string') {
    conf.blockContinent = conf.blockContinent.split(' ');
  }

  // loading geoDB (only if needed)
  if (conf.geoDB && typeof conf.geoDB === 'string' && (conf.context || conf.allowCountry || conf.blockCountry || conf.allowContinent || conf.blockContinent)) {
    try {
      if (conf.geoDBtype === 'maxmind') {
        fs.accessSync(conf.geoDB, fs.R_OK);
        reader = new mmdbReader(conf.geoDB);
        dbLoaded = true;
      }
      if (conf.geoDBtype === 'ip2location') {
        ip2loc.IP2Location_init(conf.geoDB);
        dbLoaded = true;
      }
      if (!dbLoaded) {
        debug('ERROR - GeoDB file ' + conf.geoDB + ' not configured');
      }
    } catch (ex) {
      debug('ERROR - GeoDB file ' + conf.geoDB + ' not found');
    }
  }

  const forbidden = conf.forbidden || '403 Forbidden';

  // ---------------------------------
  // MIDDLEWARE function starts here
  // ---------------------------------

  return async function (ctx, next) {

    if (conf.development) {
      return await next();
    } else {
      let _ip = ctx.ip;
      _ip = tools.corrIP(_ip);


      let _city = '-';
      let _country = '-';
      let _continent = '-';
      let _countryCode = '-';
      let _continentCode = '-';
      let _latitude = '-';
      let _longitude = '-';

      let pass = false;
      let handled = false;
      let data = null;
      if (conf.allowIP && Array.isArray(conf.allowIP)) {
        pass = conf.allowIP.some(function (item) {
          const patt = new RegExp(item);
          return patt.test(_ip);
        });
        handled = pass;
      } else {
        if (conf.blockIP && Array.isArray(conf.blockIP)) {
          pass = !conf.blockIP.some(function (item) {
            const patt = new RegExp(item);
            return patt.test(_ip);
          });
          handled = !pass;
        }
      }

      // get geoData only if needed
      if (conf.context || ((!handled) && dbLoaded && (conf.allowCountry || conf.blockCountry || conf.allowContinent || conf.blockContinent))) {
        _city = '-';
        _country = '-';
        _continent = '-';
        _countryCode = '-';
        _continentCode = '-';
        _latitude = '-';
        _longitude = '-';
        if (conf.geoDBtype === 'maxmind') {
          data = reader.lookup(_ip);
          if (data) {
            _city = (data.city && data.city.names && data.city.names.en) ? data.city.names.en : '-';
            _country = (data.country && data.country.names && data.country.names.en) ? data.country.names.en : '-';
            _continent = (data.continent && data.continent.names && data.continent.names.en) ? data.continent.names.en : '-';
            _countryCode = (data.country && data.country.iso_code) ? data.country.iso_code : '-';
            _continentCode = (data.continent && data.continent.code) ? data.continent.code : '-';
            _latitude = (data.location && data.location.latitude) ? data.location.latitude : '-';
            _longitude = (data.location && data.location.longitude) ? data.location.longitude : '-';
          }
        }
        if (conf.geoDBtype === 'ip2location') {
          data = ip2loc.IP2Location_get_all(_ip);
          if (data) {
            const continent = data.country_short && data.country_short !== '' && data.country_short !== '-' ? continents[data.country_short] : {
              continent_long: '-',
              continent_short: '-'
            }
            _city = data.city ? data.city : '-';
            _country = data.country_long ? data.country_long : '-';
            _continent = continent.continent_long;
            _countryCode = data.country_short ? data.country_short : '-';
            _continentCode = continent.continent_short;
            _latitude = data.latitude ? data.latitude : '-';
            _longitude = data.longitude ? data.longitude : '-';
          }
        }
        // store it in context, if option is set
        if (conf.context) {
          ctx.geoCity = _city;
          ctx.geoCountry = _country;
          ctx.geoContinent = _continent;
          ctx.geoCountryCode = _countryCode;
          ctx.geoContinentCode = _continentCode;
          ctx.geoLatitude = _latitude;
          ctx.geoLongitude = _longitude;
        }
      }

      // IP allowed / blocked --> filter by geocoding if needed
      if (dbLoaded && (!handled) && data && (conf.allowCountry || conf.blockCountry || conf.allowContinent || conf.blockContinent)) {

        // try to handle by allowList / blockkList county
        if (conf.allowCountry && Array.isArray(conf.allowCountry)) {
          pass = conf.allowCountry.some(function (item) {
            const patt = new RegExp(item);
            return patt.test(_countryCode);
          });
          handled = pass;
        } else {
          if (conf.blockCountry && Array.isArray(conf.blockCountry)) {
            pass = !conf.blockCountry.some(function (item) {
              const patt = new RegExp(item);
              return patt.test(_countryCode);
            });
            handled = !pass;
          }
        }

        // still not handled (by allowList / blackList county) -- handle by allowList / blackList continent
        if (!handled) {
          if (conf.allowContinent && Array.isArray(conf.allowContinent)) {
            pass = conf.allowContinent.some(function (item) {
              const patt = new RegExp(item);
              return patt.test(_continentCode);
            });
            handled = pass;
          } else {
            if (conf.blockContinent && Array.isArray(conf.blockContinent)) {
              pass = !conf.blockContinent.some(function (item) {
                const patt = new RegExp(item);
                return patt.test(_continentCode);
              });
            }
            handled = !pass;
          }
        }
      }
      if (!handled) {
        pass = true;
      }

      if (pass) {
        debug((new Date).toUTCString() + ' ' + _ip + ' ' + _continentCode + ' ' + _countryCode + ' -> ✓');
        await next();
      } else {
        debug((new Date).toUTCString() + ' ' + _ip + ' ' + _continentCode + ' ' + _countryCode + ' -> ×');
        ctx.status = 403;

        if (typeof forbidden === 'function') {
          ctx.body = await forbidden(ctx, next);
        } else {
          ctx.body = forbidden;
        }
      }
    }
  };
}
