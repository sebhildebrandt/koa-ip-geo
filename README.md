# koa-ip-geo

IP and GeoLocation filter middleware for [koa][koa-url], support whitelist and blacklist.

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![Git Issues][issues-img]][issues-url]
  [![Closed Issues][closed-issues-img]][closed-issues-url]
  [![deps status][daviddm-img]][daviddm-url]
  [![Code Quality: Javascript][lgtm-badge]][lgtm-badge-url]
  [![Total alerts][lgtm-alerts]][lgtm-alerts-url]
  [![Caretaker][caretaker-image]][caretaker-url]
  [![MIT license][license-img]][license-url]

## News and Changes

### Major (breaking) Changes - Version 2

- This new version 2.x.x is adapted for [Koa2][koajs-url]
- as it uses the **async/await** pattern this new version works only with [node.js][nodejs-url] **v7.6.0** and above.

## Quick Start

### Installation

```bash
$ npm install koa-ip-geo --save
```

You also need the **Maxmind GeoLite2 Free Database** (city or country). We recommend the 'country' version, because it is smaller. [Check their website to get the database][geodb-url].

### Basic Usage

This example has a whitelist for local IP addresses and a whitelist for Austrian IP addresses:

```js
const Koa = require('koa');
const ipGeo = require('koa-ip-geo');

const app = new Koa();

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

```js
app.use(ipGeo('192.168.0.*'));
```

Filtering more than one IP address range:

```js
app.use(ipGeo('192.168.0.* 8.8.8.[0-3]'));
```

or

```js
app.use(ipGeo(['192.168.0.*', '8.8.8.[0-3]']));
```

>**Notes:**
> In the previous examples you saw just a single string or an array as a parameter passed to the middleware. For simplicity, in this case this will be interpreted as a 'whiteListIP'-parameter. Explicitly specifying a 'whiteListIP'-parameter would be the 'correct' and more readable way:

```js
app.use(ipGeo({
  whiteListIP: ['192.168.0.*', '8.8.8.*']
}));
```

##### Blacklist IP adresses example

```js
app.use(ipGeo({
  blackListIP: ['8.8.8.*', '1.80.*'],
}));
```

##### Whitelist countries

In order to determine country origin, we need also to specify the geoDB database:

```js
app.use(ipGeo({
  geoDB: 'path/to/geodb.mmdb',
  whiteListCountry: ['US', 'UK', 'DE', 'AT']
}));
```

>**Notes:**
> The geoDB database will only be loaded if necessary. So if you specify a database but do not filter by country or continent, the database will not be loaded.

##### Blacklist countries

```js
app.use(ipGeo({
  geoDB: 'path/to/geodb.mmdb',
  blackListCountry: ['CN', 'RU']
}));
```

##### Whitelist continents

```js
app.use(ipGeo({
  geoDB: 'path/to/geodb.mmdb',
  whiteListContinent: ['NA', 'EU']
}));
```

##### Blacklist continents

```js
app.use(ipGeo({
  geoDB: 'path/to/geodb.mmdb',
  blackListContinent: ['AS']
}));
```

##### Pass Geo-IP data into context ...

If you need Geo-IP data later in your koa context (ctx. ...), just set the 'context' option to true.

```js
app.use(ipGeo({
  geoDB: 'path/to/geodb.mmdb',
  whiteListCountry: ['US', 'UK', 'DE', 'AT'],
  context: true
}));

// you can and then later access geo-ip data in the context of your request:

...
  let city = ctx.geoCity;                    // city name
  let country = ctx.geoCountry;              // country name
  let continent = ctx.geoContinent;          // continent name
  let countrycode = ctx.geoCountryCode       // country code (ISO_3166-2)
  let continentCode = ctx.geoContinentCode;  // continent code
  let latitude = ctx.geoLatitude;            // latitude
  let longitude = ctx.geoLongitude;          // longitude
...
```

##### More complex example:

```js
app.use(ipGeo({
  blackListIP: ['8.8.8.*'],
  geoDB: 'path/to/geodb.mmdb',
  whiteListCountry: ['UK', 'US', 'FR', 'DE', 'AT'],
  forbidden: '403 - Custom Forbidden Message',
  development: (process.env.NODE_ENV === 'Development')
}));
```

##### Custom messages

Example with custom forbidden (= rejection) message (function):

```js
forbidden = async function (ctx, next) {
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
>
> `koa-ip-geo` loads the entire database file into memory as a single node `Buffer`. It also uses an in-memory cache when reading complex data structures out of this buffer in the interests of performance. So very roughly speaking, you should assume this module will consume `size_of_mmdb_file * 1.25` of memory.



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
| 2.1.0          | 2019-02-22     | added typescript definitions |
| 2.0.4          | 2018-11-03     | improved code quality |
| 2.0.3          | 2018-11-03     | dependencies update, updated docs |
| 2.0.2          | 2017-12-23     | removed console.log |
| 2.0.1          | 2017-11-20     | fixed typos README.md |
| 2.0.0          | 2017-11-20     | made for Koa2, version bump, updated dependencies |
| 1.2.1          | 2015-09-25     | udated README, more examples, typos, ... |
| 1.2.0          | 2015-09-23     | now also space separated string possible |
| 1.1.2          | 2015-09-19     | updated DOCs - whileListIP, examples, typos |
| 1.1.0          | 2015-09-19     | added geoIP data to koa context (as an option) |
| 1.0.0          | 2015-09-18     | initial release |

#### Changes Version 2.0.0

This new version is now for Koa2! So this means, this version is a breaking change! Be sure to also use [node.js][nodejs-url] v7.6.0 or above.

#### Changes Version 1.2.0

- you can now pass arrays as well as space separated strings to each whitelist/blacklist:

```js
app.use(ipGeo({
  blackListIP: ['192.168.0.*', '8.8.8.*']
}));
```

is now the same as

```js
app.use(ipGeo({
  blackListIP: '192.168.0.* 8.8.8.*'
}));
```

- added synonym for `localhost` = IPv4 `127.0.0.1` = IPv6 `::1` - all three will be handled the same way, you only have to provide ONE of those addresses. E.g.:

```js
app.use(ipGeo({
  whiteListIP: 'localhost'
}));
```

will whitelist `127.0.0.1` and `::1` and vice versa.


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
>Copyright &copy; 2018 Sebastian Hildebrandt, [+innovations](http://www.plus-innovations.com).
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
[geodb-url]: https://dev.maxmind.com/geoip/geoip2/geolite2/
[koaip-url]: https://github.com/MangroveTech/koa-ip
[koaipfilter-url]: https://github.com/tunnckoCore/koa-ip-filter

[daviddm-url]: https://david-dm.org/sebhildebrandt/koa-ip-geo
[daviddm-img]: https://img.shields.io/david/sebhildebrandt/koa-ip-geo.svg?style=flat-square

[issues-img]: https://img.shields.io/github/issues/sebhildebrandt/koa-ip-geo.svg?style=flat-square
[issues-url]: https://github.com/sebhildebrandt/koa-ip-geo/issues
[closed-issues-img]: https://img.shields.io/github/issues-closed-raw/sebhildebrandt/koa-ip-geo.svg?style=flat-square
[closed-issues-url]: https://github.com/sebhildebrandt/koa-ip-geo/issues?q=is%3Aissue+is%3Aclosed


[nodejs-url]: https://nodejs.org/en/
[koajs-url]: http://koajs.com/

[lgtm-badge]: https://img.shields.io/lgtm/grade/javascript/g/sebhildebrandt/koa-ip-geo.svg?style=flat-square
[lgtm-badge-url]: https://lgtm.com/projects/g/sebhildebrandt/koa-ip-geo/context:javascript
[lgtm-alerts]: https://img.shields.io/lgtm/alerts/g/sebhildebrandt/koa-ip-geo.svg?style=flat-square
[lgtm-alerts-url]: https://lgtm.com/projects/g/sebhildebrandt/koa-ip-geo/alerts

[caretaker-url]: https://github.com/sebhildebrandt
[caretaker-image]: https://img.shields.io/badge/caretaker-sebhildebrandt-blue.svg?style=flat-square
