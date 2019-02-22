// Type definitions for koa-ip-geo
// Project: https://github.com/sebhildebrandt/koa-ip-geo
// Definitions by: sebhildebrandt <https://github.com/sebhildebrandt>

declare namespace KoaIpGeo {
  interface Configuration {
    geoDB?: string;
    whiteListIP?: string | Array<string>;
    blackListIP?: string | Array<string>;
    whiteListCountry?: string;
    blackListCountry?: string;
    whiteListContinent?: string;
    blackListContinent?: string;
    forbidden?: () => void;
    development?: boolean;
    context?: boolean;
  }
}

declare function ipGeoFilter(conf?: KoaIpGeo.Configuration | string | Array<string>): Promise<void>;

export = ipGeoFilter;
