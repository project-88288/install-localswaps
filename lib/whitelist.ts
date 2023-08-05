import { isTokenOrderedWell } from "../lib/utils";
import { saveWhiteList, WhiteList_template, loadWhiteList } from '@project-88288/opz-libs'
import * as fs from 'fs-extra';
import { delay } from 'bluebird'
import { JSONSerializable } from "@terra-money/terra.js/dist/util/json";
const words = require("../assets/reserveWords.json")

export function getwhitelistPath(configPath: string, networkname: string) {
    return configPath?.replace('config.terrain.json', `assets/${networkname}_whiteLists.json`)
}

export async function initialzeAssets(whithlistPath: string): Promise<void> {
    if (!(await fs.pathExists(whithlistPath)))
        saveWhiteList(WhiteList_template, whithlistPath)
} 

// lp
export interface lplist {"localterra":{},"mainnet":{},"testnet":{},"classic":{}}
const lpListTemplate:lplist = {"localterra":{},"mainnet":{},"testnet":{},"classic":{}}

export function getlpPath(configPath: string) {
    return configPath?.replace('config.terrain.json', 'assets/liquidityList.json')
}

export async function loadlp_assets(lpPath:string):Promise<lplist> {
    if ((await fs.pathExists(lpPath))) {
       return await fs.readJSON(lpPath)
    }
    else
    return lpListTemplate
}

export async function storelp_assets(lpList:lplist,lpPath:string) {
    await fs.writeJSON(lpPath,lpList)
}

//
export interface objectList {"localterra":{},"mainnet":{},"testnet":{},"classic":{}}
export const objectTemplate:objectList = {"localterra":{},"mainnet":{},"testnet":{},"classic":{}}

export interface arrayList {"localterra":string[],"mainnet":string[],"testnet":string[],"classic":string[]}
export const arrayTemplate:arrayList = {"localterra":[],"mainnet":[],"testnet":[],"classic":[]}

export function getJsonPath(JsonName,configPath: string) {
    return configPath?.replace('config.terrain.json', `assets/json/${JsonName}.json`)
}

export async function loadJson(template:any,JsonPath:string):Promise<any> {
    if ((await fs.pathExists(JsonPath))) {
       return await fs.readJSON(JsonPath)
    }
    else
    return template
}

export async function storeJson(JsonObject:any,JsonPath:string) {
    await fs.writeJSON(JsonPath,JsonObject)
}

export { saveWhiteList, loadWhiteList } from '@project-88288/opz-libs'