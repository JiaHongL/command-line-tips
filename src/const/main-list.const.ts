import configJson from "../config.json";

export const mainList = configJson.map((item) => { return item.main });
