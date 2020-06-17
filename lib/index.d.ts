// Type definitions for koa-ip-geo
// Project: https://github.com/sebhildebrandt/koa-ip-geo
// Definitions by: sebhildebrandt <https://github.com/sebhildebrandt>

export namespace KoaIpGeo {
  interface Configuration {
    geoDB?: string;
    allowIP?: string | Array<string>;
    blockIP?: string | Array<string>;
    allowCountry?: string;
    blockCountry?: string;
    allowContinent?: string;
    blockContinent?: string;
    forbidden?: (ctx?: any, next?: any) => void;
    development?: boolean;
    context?: boolean;
  }
}

export default function ipGeoFilter(conf?: KoaIpGeo.Configuration | string | Array<string>): any;
