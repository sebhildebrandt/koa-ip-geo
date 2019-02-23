// Type definitions for koa-ip-geo
// Project: https://github.com/sebhildebrandt/koa-ip-geo
// Definitions by: sebhildebrandt <https://github.com/sebhildebrandt>

export namespace KoaIpGeo {
  interface Configuration {
    geoDB?: string;
    whiteListIP?: string | Array<string>;
    blackListIP?: string | Array<string>;
    whiteListCountry?: string;
    blackListCountry?: string;
    whiteListContinent?: string;
    blackListContinent?: string;
    forbidden?: (ctx?: any, next?: any) => void;
    development?: boolean;
    context?: boolean;
  }
}

export default function ipGeoFilter(conf?: KoaIpGeo.Configuration | string | Array<string>): any;
