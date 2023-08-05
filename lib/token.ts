import { saveWhiteList, loadWhiteList } from '@project-88288/opz-libs'
const words = require("../assets/reserveWords.json")
import { getwhitelistPath } from "./whitelist";

export function generateTokenname(networkname: string, whitelistPath: string): string[] {
    const reservewords: string[] = words[networkname]
    const wordstoreserve: string[] = []
    reservewords.forEach(element => {
        const res = element.toUpperCase().trim().slice(0, 3)
        wordstoreserve.push(res)
    });
    //
    let x_whitelist = loadWhiteList(whitelistPath)
    wordstoreserve.forEach(element => {
        x_whitelist.token[element] = "reserve"
    })
    saveWhiteList(x_whitelist, whitelistPath)
    //
    let chars: string[] = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
        'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ]
    let names: string[] = []
    let count = 0
    for (let index1 = 0; index1 < chars.length; index1++) {
        for (let index2 = 0; index2 < chars.length; index2++) {
            for (let index3 = 0; index3 < chars.length; index3++) {
                const element = chars[index1] + chars[index2] + chars[index3]
                if (!wordstoreserve.includes(element))
                    names.push(element)
                else
                    console.log(`${count++}) passed as in reserve ${element}`)
                //
            }
        }
    }
    //
    return names
}

export function generatenames(): string[] {
    //
    let chars: string[] = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
        'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ]
    //
    let names: string[] = []
    for (let index1 = 0; index1 < chars.length; index1++) {
        for (let index2 = 0; index2 < chars.length; index2++) {
            for (let index3 = 0; index3 < chars.length; index3++) {
                const element = chars[index1] + chars[index2] + chars[index3]
                    names.push(element)
            }
        }
    }
    //
    console.log(`Total posible names were generated: ${names.length}`)
    return names
}

export async function getTokensymbol(token: string, lcd: any): Promise<string> {
    const result = await lcd.wasm.contractQuery(token, { token_info: {} });
    return result.symbol;
}

export async function isTokenExist(contract_addr: string, configPath: string, networkname: string, lcd: any) {
    const whitelistPath = getwhitelistPath(configPath, networkname)
    let _whitelist = loadWhiteList(whitelistPath)
    const element = await getTokensymbol(contract_addr, lcd)
    return (!!_whitelist.token[element])
}

export async function saveToken(contract_addr: string, configPath: string, networkname: string, lcd: any) {
    const whitelistPath = getwhitelistPath(configPath, networkname)
    let _whitelist = loadWhiteList(whitelistPath)
    const element = await getTokensymbol(contract_addr, lcd)
    _whitelist.token[element] = contract_addr
    saveWhiteList(_whitelist, whitelistPath)
}

export async function containToken(tokensymbol: string, configPath: string, networkname: string) {
    const whitelistPath = getwhitelistPath(configPath, networkname)
    let _whitelist = loadWhiteList(whitelistPath)
    return !!_whitelist.token[tokensymbol]
}

export function getTokennames_off_line(networkname: string, whitelistPath: string) {
    const _whitelist = loadWhiteList(whitelistPath)
    const allnames = generateTokenname(networkname, whitelistPath)
    let names: string[] = []
    allnames.forEach(element => {
        if (!!_whitelist.token[element]) {
            names.push(element)
        }
    })
    return names
}

