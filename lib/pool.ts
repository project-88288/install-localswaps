import { isTokenOrderedWell } from "./utils";
import { saveWhiteList, loadWhiteList } from '@project-88288/opz-libs'
import {
    arrayList, arrayTemplate, getJsonPath,
    getwhitelistPath, loadJson, storeJson
} from "./whitelist";

export async function getPoolname(pool: string, lcd: any): Promise<string> {

    const result = await lcd.wasm.contractQuery(pool, { pool: {} });
    const assets: any[] = []
    result.assets.map(a => {
        assets.push(a.info.token.contract_addr)
    })

    const token0 = isTokenOrderedWell(assets)
        ? assets[0]
        : assets[1]

    const token1 = isTokenOrderedWell(assets)
        ? assets[1]
        : assets[0]

    const result0 = await lcd.wasm.contractQuery(token0, { token_info: {} });
    const result1 = await lcd.wasm.contractQuery(token1, { token_info: {} });

    const pairname = `${result0.symbol}-${result1.symbol}`

    return pairname
}

export async function getPoolfactory(pool: string, lcd: any): Promise<string> {
    const result = await lcd.wasm.contractInfo(pool)
    return result['creator']
}

export async function isPoolExist(contract_addr: string, configPath: string, networkname: string, lcd: any) {
    const whitelistPath = getwhitelistPath(configPath, networkname)
    let _whitelist = loadWhiteList(whitelistPath)
    const element = await getPoolname(contract_addr, lcd)
    return (!!_whitelist.pair[element])
}

export async function savePool(contract_addr: string, configPath: string, networkname: string, lcd: any) {
    const whitelistPath = getwhitelistPath(configPath, networkname)
    let _whitelist = loadWhiteList(whitelistPath)
    const element = await getPoolname(contract_addr, lcd)
    _whitelist.pair[element] = contract_addr
    saveWhiteList(_whitelist, whitelistPath)
}

export async function containPool(pairname: string, configPath: string, networkname: string) {
    if (pairname.split('-').length !== 2) return false

    const whitelistPath = getwhitelistPath(configPath, networkname)
    let _whitelist = loadWhiteList(whitelistPath)
    if (!!_whitelist.pair[pairname]) return true
    if (!!_whitelist.pair[`${pairname.split('-')[1]}-${pairname.split('-')[0]}`]) return true

    return false
}

export function getLastBlock(blockName: string, whitelistPath: string) {
    const names: string[] = ['pair', 'token', 'factory']
    if (!names.includes(blockName)) return
    const _whitelist = loadWhiteList(whitelistPath)
    if (!_whitelist[blockName]) {
        _whitelist[blockName] = {}
        saveWhiteList(_whitelist, whitelistPath)
    }
    if (!_whitelist[blockName]['LAST_BLOCK']) {
        _whitelist[blockName]['LAST_BLOCK'] = '0'
        saveWhiteList(_whitelist, whitelistPath)
    }
    return Number.parseInt(_whitelist[blockName]['LAST_BLOCK'])
}

export function setLastBlock(lastblock: number, blockName: string, whitelistPath: string) {
    const names: string[] = ['pair', 'token', 'factory']
    if (!names.includes(blockName)) return
    const _whitelist = loadWhiteList(whitelistPath)
    if (!_whitelist[blockName]) {
        _whitelist[blockName] = {}
    }
    _whitelist[blockName]['LAST_BLOCK'] = lastblock.toString()
    saveWhiteList(_whitelist, whitelistPath)
}

export async function generateRingPairs(configPath: string, networkname: string): Promise<string[]> {
    const jsonPath = getJsonPath('ringPairNames', configPath)
    const ringpairsName = await loadJson(arrayTemplate, jsonPath) as arrayList
    let names: string[] = []
    //
    const tokenjsonpath = getJsonPath('tokenList', configPath)
    const tokenList = await loadJson(arrayTemplate, tokenjsonpath)
    console.log(`load names from ${tokenjsonpath}`)
    const tokennames = tokenList[networkname]
    console.log(`total token to pairs = ${tokennames.length}`)
    //
    for (let index = 0; index < tokennames.length - 1; index++) {
        const element0 = tokennames[index];
        const element1 = tokennames[index + 1];
        names.push(`${element0}-${element1}`)
    }
    //
    names.push(`${tokennames[tokennames.length - 1]}-${tokennames[0]}`)
    //
    ringpairsName[networkname] = names
    await storeJson(ringpairsName, jsonPath)
    //
    console.log(`total pair names ${names.length} were creates`)
    console.log(`store names to ${jsonPath}`)
    return names
}

export async function generateStarPairs(tokennames: string[], networkname: string, configPath: string): Promise<string[]> {
    let names: string[] = []
    const token0 = 'luna'.toUpperCase()
    const starpairsPath = getJsonPath(`starpairNames`,configPath)
    for (let index = 0; index < tokennames.length; index++) {
        const element = tokennames[index];
        names.push(`${token0}-${element}`)
    }
    let starpairsJson = loadJson(arrayTemplate,starpairsPath)
    starpairsJson[networkname] = names
    await storeJson(starpairsJson,starpairsPath)
    return names
}
