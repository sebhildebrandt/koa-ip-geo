# koa-ip-geo

IP and GeoLocation filter middleware for [koa][koa-url], support whitelist and blacklist.

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![MIT license][license-img]][license-url]
  [![deps status][daviddm-img]][daviddm-url]

## Quick Start

### Installation

```bash
$ npm install koa-ip-geo
```

### Basic Usage

```
var koa = require('koa');
var ipGeo = require('koa-ip-geo');

var app = koa();

app.use(ipGeo('192.168.0.*'))

app.use(...);
app.listen(3000);
```


### Advanced Options

Whiteliste IP address

```
app.use(ipGeo({
  whiteList: ['192.168.0.*', '8.8.8.[0-3]']
}));
```

This is the same as the previous example. If you only need to whitelist IP adresses, just pass a single IP adress as a string or an array of IP addresses as a parameter. This will be interpretad as a 'whiteList'-parameter.

```
app.use(ipGeo(['192.168.0.*', '8.8.8.[0-3]']));
```

Blacklist IP adresses example

```
app.use(ipGeo({
  blackList: ['8.8.8.*', '1.80.*'],
}));
```

Whitelist countries

```
app.use(ipGeo({
  whiteListCountry: ['US', 'UK', 'DE', 'AT']
}));
```

Blacklist countries

```
app.use(ipGeo({
  blackListCountry: ['CN', 'RU']
}));
```

Whitelist continents

```
app.use(ipGeo({
  whiteListContinent: ['NA', 'EU']
}));
```

Blacklist continents

```
app.use(ipGeo({
  blackListContinent: ['AS']
}));
```

More Complex example:

```
app.use(ipGeo({
  blackList: ['8.8.8.*'],
  whiteListCountry: ['UK', 'US', ‘FR', 'DE', 'AT'],
  forbidden: '403 - Custom Forbidden Message'
}));
```

Example with custom forbidden message:

```
forbidden = function (ctx) {
  ctx.set('X-Seriously', 'yes');
  return 'Seriously - No Access';
}

app.use(ipGeo({
        whiteList: '192.168.0.*',
        forbidden: forbidden
      }))
```


```
app.use(ipGeo({
  whiteList: ['192.168.0.*', '8.8.8.[0-3]'],
  blackList: ['8.8.8.*'],
  whiteListCountry: ['UK', 'US', ‘FR', 'DE', 'AT'],
  blackListCountry: ['CN', 'RU'],
  whiteListContinent: ['NA', 'EU'],
  blackListContinent: ['AS'],

}));
```

### Option Reference

| option         | Description | Example |
| -------------- | --------------------- | ---------------------- |
| whiteList | Array of IP addresses (or string of single IP address ) | ['192.168.0.*', '8.8.8.[0-3]'] |
| blackList | Array of IP addresses (or string of single IP address ) | ['8.8.8.*', '1.80.*'] |
| whiteListCountry | Array of [ISO 3166-2 country code][iso3166-2-url] (or string of single country-code) | ['US', 'AT'] |
| blackListCountry | Array of [ISO 3166-2 country code][iso3166-2-url] (or string of single country-code) | ['CN', 'RU'] |
| whiteListContinent | Array of continent code (or string of single continent-code) | ['EU', 'NA'] |
| blackListContinent | Array of continent code (or string of single continent-code) | ['AS', 'OC', 'AF'] |
| forbidden | custom 'forbidden' message (string or function) | '403 - Forbidden' |
| development | if true, no filztering is done | defaults to false |

### Formats

##### IP Addresses

Possible Formats:
- x.x.x.x 	for a specific IP address
- x.x.x.* 	for a IP range
- x.x.*.* 	for a IP range
- x.x.* 	for a IP range also works perfectly

CIDR notation (e.g. x.x.x.x/18) is not supported at the moment.

If you only pass one single IP adress, you can pass a string instead of an array - like { whiteList: '192.168.0.*' }

##### Country Codes

Please use the [ISO 3166-2 country code][iso3166-2-url] like 'us', 'uk', ....

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
| 1.0.0          | 2015-09-14     | initial release |


## Comments

If you have ideas or comments, please do not hesitate to contact me.

Sincerely,

Sebastian Hildebrandt, [+innovations](http://www.plus-innovations.com)

## Credits

Written by Sebastian Hildebrandt [sebhildebrandt](https://github.com/sebhildebrandt)

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

[koa-url]: https://github.com/koajs/koa

[iso3166-2-url]: https://en.wikipedia.org/wiki/ISO_3166-2

[daviddm-url]: https://david-dm.org/sebhildebrandt/koa-ip-geo
[daviddm-img]: https://img.shields.io/david/sebhildebrandt/koa-ip-geo.svg?style=flat-square