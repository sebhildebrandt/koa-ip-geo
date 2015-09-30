# koa-ip-geo

IP and GeoLocation filter middleware for [koa][koa-url], support whitelist and blacklist.

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![Git Issues][issues-img]][issues-url]
  [![deps status][daviddm-img]][daviddm-url]
  [![MIT license][license-img]][license-url]

## Quick Start

### Installation

```bash
$ npm install koa-ip-geo -- save
```

### Basic Usage

This example has a whitelist for local IP addresses and a whitelist for Austrian IP addresses:

```
var koa = require('koa');
var ipGeo = require('koa-ip-geo');

var app = koa();

app.use(ipGeo({
  geoDB: 'path/to/geodb.mmdb',
  whiteListIP: '192.168.0.*',
  whiteListCountry: ['AT']
}));

app.use(...);
app.listen(3000);
```


### Advanced Options

##### Whiteliste IP address

Very basic IP filtering:

```
app.use(ipGeo('192.168.0.*'));
```

Filtering more than one IP address range:

```
app.use(ipGeo('192.168.0.* 8.8.8.[0-3]'));
```

or

```
app.use(ipGeo(['192.168.0.*', '8.8.8.[0-3]']));
```

>**Notes:**
> In the previous examples you saw just a single string or an array as a parameter passed to the middleware. For simplicity, in this case this will be interpreted as a 'whiteListIP'-parameter. Explicitly specifying a 'whiteListIP'-parameter would be the 'correct' and more readable way:

```
app.use(ipGeo({
  whiteListIP: ['192.168.0.*', '8.8.8.*']
}));
```

##### Blacklist IP adresses example

```
app.use(ipGeo({
  blackListIP: ['8.8.8.*', '1.80.*'],
}));
```

##### Whitelist countries

In order to determine country origin, we need also to specify the geoDB database:

```
app.use(ipGeo({
  geoDB: 'path/to/geodb.mmdb',
  whiteListCountry: ['US', 'UK', 'DE', 'AT']
}));
```

>**Notes:**
> The geoDB database will only be loaded if necessary. So if you specify a database but do not filter by country or continent, the database will not be loaded.

##### Blacklist countries

```
app.use(ipGeo({
  geoDB: 'path/to/geodb.mmdb',
  blackListCountry: ['CN', 'RU']
}));
```

##### Whitelist continents

```
app.use(ipGeo({
  geoDB: 'path/to/geodb.mmdb',
  whiteListContinent: ['NA', 'EU']
}));
```

##### Blacklist continents

```
app.use(ipGeo({
  geoDB: 'path/to/geodb.mmdb',
  blackListContinent: ['AS']
}));
```

##### Pass Geo-IP data into context ...

If you need Geo-IP data later in your koa context (this. ...), just set the 'context' option to true.

```
app.use(ipGeo({
  geoDB: 'path/to/geodb.mmdb',
  whiteListCountry: ['US', 'UK', 'DE', 'AT'],
  context: true
}));

// you can and then later access geo-ip data in the context of your request:

...
  let city = this.geoCity;                    // city name
  let country = this.geoCountry;              // country name
  let continent = this.geoContinent;          // continent name
  let countrycode = this.geoCountryCode       // country code (ISO_3166-2)
  let continentCode = this.geoContinentCode;  // continent code
  let latitude = this.geoLatitude;            // latitude
  let longitude = this.geoLongitude;          // longitude
...
```

##### More Complex example:

```
app.use(ipGeo({
  blackListIP: ['8.8.8.*'],
  geoDB: 'path/to/geodb.mmdb'),
  whiteListCountry: ['UK', 'US', ‘FR', 'DE', 'AT'],
  forbidden: '403 - Custom Forbidden Message',
  development: (process.env.NODE_ENV == 'Development')
}));
```

##### Custom Messages

Example with custom forbidden message (function):

```
forbidden = function (ctx) {
  ctx.set('X-Seriously', 'yes');
  return 'Seriously - No Access';
}

app.use(ipGeo({
  whiteListIP: '192.168.0.*',
  forbidden: forbidden
}))
```

### GeoLite2 Database

> This middleware works with **Maxmind GeoLite2 Free Database** (city or country). We recommend the 'country' version, because it is smaller. [Check their website to get the database][geodb-url].


### Option Reference

| option         | Description | Example |
| -------------- | --------------------- | ---------------------- |
| geoDB | path to GeoLite2 database | 'GeoLite2-City.mmdb' |
| whiteListIP | Array of IP addresses (or space separated string) | ['192.168.0.*', '8.8.8.[0-3]'] |
| blackListIP | Array of IP addresses (or space separated string) | ['8.8.8.*', '1.80.*'] |
| whiteListCountry | Array of [ISO 3166-2 country code][iso3166-2-url] (or space separated string) | ['US', 'AT'] |
| blackListCountry | Array of [ISO 3166-2 country code][iso3166-2-url] (or space separated string) | ['CN', 'RU'] |
| whiteListContinent | Array of continent code (or space separated string) | ['EU', 'NA'] |
| blackListContinent | Array of continent code (or space separated string) | ['AS', 'OC', 'AF'] |
| forbidden | custom 'forbidden' message (string or function) | '403 - Forbidden' |
| context | set true, if you need geoIP information in the context | defaults to false |
| development | if true, no filztering is done | defaults to false |

### Formats

##### IP Addresses

Possible Formats:
- x.x.x.x 	for a specific IP address
- x.x.x.* 	for a IP range
- x.x.*.* 	for a IP range
- x.x.* 	  for a IP range also works perfectly
- x.x.x.[0-127]   this is also a range of IP addresses.

> **Notice:**
> CIDR notation (e.g. `x.x.x.x/18`) is not supported at the moment.

##### Country Codes

Please use the [ISO 3166-2 country code][iso3166-2-url] like 'US', 'UK', ....

##### Continent Codes

- AF - Africa
- AS - Asia
- EU - Europe
- NA - North America
- OC - Oceania
- SA - South America

## Version history

| Version        | Date           | Comment  |
| -------------- | -------------- | -------- |
| 1.2.1          | 2015-09-25     | udated README, more examples, typos, ... |
| 1.2.0          | 2015-09-23     | now also space separated string possible |
| 1.1.2          | 2015-09-19     | updated DOCs - whileListIP, examples, typos |
| 1.1.0          | 2015-09-19     | added geoIP data to koa context (as an option) |
| 1.0.0          | 2015-09-18     | initial release |

#### Changes Version 1.2.0

- you can now pass arrays as well as space separated strings to each whitelist/blacklist:

```
app.use(ipGeo({
  blackListIP: ['192.168.0.*', '8.8.8.*']
}));
```

is now the same as

```
app.use(ipGeo({
  blackListIP: '192.168.0.* 8.8.8.*'
}));
```

- added synonym for 'localhost' = IPv4 '127.0.0.1' = IPv6 '::1' - all three will be handled the same way, you only have to provide ONE of those addresses. E.g.:

```
app.use(ipGeo({
  whiteListIP: 'localhost'
}));
```

will whitelist '127.0.0.1' and '::1' and vice versa.


## Comments

If you have ideas or comments, please do not hesitate to contact me. Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue][issue-url].

Sincerely,

Sebastian Hildebrandt, [+innovations](http://www.plus-innovations.com)

## Credits

Written by Sebastian Hildebrandt [sebhildebrandt](https://github.com/sebhildebrandt)

This package is heavenly inspired by [koa-ip][koaip-url] and [koa-ip-filter][koaipfilter-url]. Check them out also.

## License [![MIT license][license-img]][license-url]

>The [`MIT`][license-url] License (MIT)
>
>Copyright &copy; 2015 Sebastian Hildebrandt, [+innovations](http://www.plus-innovations.com).
>
>Permission is hereby granted, free of charge, to any person obtaining a copy
>of this software and associated documentation files (the "Software"), to deal
>in the Software without restriction, including without limitation the rights
>to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
>copies of the Software, and to permit persons to whom the Software is
>furnished to do so, subject to the following conditions:
>
>The above copyright notice and this permission notice shall be included in
>all copies or substantial portions of the Software.
>
>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
>IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
>FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
>AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
>LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
>OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
>THE SOFTWARE.

[npm-image]: https://img.shields.io/npm/v/koa-ip-geo.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-ip-geo
[downloads-image]: https://img.shields.io/npm/dm/koa-ip-geo.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/koa-ip-geo

[license-url]: https://github.com/sebhildebrandt/koa-ip-geo/blob/master/LICENSE
[license-img]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[npmjs-license]: https://img.shields.io/npm/l/koa-ip-geo.svg?style=flat-square
[issue-url]: https://github.com/sebhildebrandt/koa-ip-geo/issues/new

[koa-url]: https://github.com/koajs/koa
[iso3166-2-url]: https://en.wikipedia.org/wiki/ISO_3166-2
[geodb-url]: http://dev.maxmind.com/geoip/geoip2/geolite2/
[koaip-url]: https://github.com/MangroveTech/koa-ip
[koaipfilter-url]: https://github.com/tunnckoCore/koa-ip-filter

[daviddm-url]: https://david-dm.org/sebhildebrandt/koa-ip-geo
[daviddm-img]: https://img.shields.io/david/sebhildebrandt/koa-ip-geo.svg?style=flat-square

[issues-img]: https://img.shields.io/github/issues/sebhildebrandt/koa-ip-geo.svg?style=flat-square
[issues-url]: https://github.com/sebhildebrandt/koa-ip-geo/issues
