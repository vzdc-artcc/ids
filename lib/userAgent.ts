import packageJson from "@/package.json";

/**
 * User-Agent sent with outbound requests to third-party services (VATSIM, VATUSA, aviationweather.gov, etc.)
 * so operators can identify this application and reach its maintainers instead of blocking anonymous traffic.
 */
export const USER_AGENT = `vZDC-IDS/${packageJson.version} (+https://github.com/vzdc-artcc/ids)`;
