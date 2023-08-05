import { Env, task } from "@terra-money/terrain";
import { arrayTemplate, getJsonPath, getwhitelistPath, initialzeAssets, loadJson, loadWhiteList, objectTemplate, storeJson } from "../lib/whitelist";

task(async (env: Env) => {
  //
  const networkname = process.env.network
  const configPath = process.env.configPath
  const signer = process.env.signer
  //
  if (!signer) return
  if (!configPath) return
  if (!networkname) return;
  //
  console.log(networkname, signer)
  console.log(env.wallets[signer].key.accAddress)
  console.log(configPath)
  //
  const _whitelistPath = getwhitelistPath(configPath, networkname)
  if (!_whitelistPath) {
    console.log(`Error getwhitelistPath!`)
    return
  }
  await initialzeAssets(_whitelistPath)
  //
  const iconurl = "https://static.opz.life/icons/LOGO.png"
  //const iconurl = "https://project-88288.github.io/assets/icons/LOGO.png"
  //
  const ringpairNamejsonpath = getJsonPath('ringPairNames', configPath)
  const ringcw20Namejsonpath = getJsonPath('ringcw20Names', configPath)
  const ringcw20assetjsonpath = getJsonPath('ringcw20Assets', configPath)
  //
  const rpairnames = await loadJson(arrayTemplate, ringpairNamejsonpath)
  let ringcw20Asset = await loadJson(objectTemplate, ringcw20assetjsonpath)
  let ringcw20names = await loadJson(arrayTemplate, ringcw20Namejsonpath)
  //
  //ringcw20names[networkname] =[]
  const _whitelist = loadWhiteList(_whitelistPath)
  rpairnames[networkname].forEach(element => {
    const element0 = element.split('-')[0]
    const element1 = element.split('-')[1]
    if (_whitelist.token[element0]) { if (!ringcw20names[networkname].includes(element0)) ringcw20names[networkname].push(element0) }
    if (_whitelist.token[element1]) { if (!ringcw20names[networkname].includes(element1)) ringcw20names[networkname].push(element1) }
  })
  //
  console.log(ringcw20names[networkname])
  console.log(`total ringcw20names ${ringcw20names[networkname].length}`)
  await storeJson(ringcw20names, ringcw20Namejsonpath)
  //
  // map as terraswap cw20
  ringcw20names = await loadJson(arrayTemplate, ringcw20Namejsonpath)
  ringcw20Asset = await loadJson(objectTemplate, ringcw20assetjsonpath)
  //
  ringcw20names[networkname].forEach(element => {
    const addr = _whitelist.token[element]
    if (!ringcw20Asset[networkname][addr]) {
      if (!!addr) {
              //
      console.log(element)
      //
        env.client.wasm.contractQuery(addr, {
          token_info: {}
        }).then(res => {
          ringcw20Asset[networkname][addr] = {}
          ringcw20Asset[networkname][addr]['protocol'] = `Terra ${res['symbol']}`
          ringcw20Asset[networkname][addr]['symbol'] = res['symbol']
          ringcw20Asset[networkname][addr]['name'] = res['name']
          ringcw20Asset[networkname][addr]['token'] = addr
          ringcw20Asset[networkname][addr]['icon'] = iconurl.replace('LOGO.png',`${res['symbol']}.png`)
          ringcw20Asset[networkname][addr]['decimals'] = res['decimals']
          storeJson(ringcw20Asset, ringcw20assetjsonpath)
        }).catch(e => {
          console.log(`${element}-${e}`)
        })
      }
    }

  })

  const starpairNamejsonpath = getJsonPath('starpairNames', configPath)
  const starcw20Namejsonpath = getJsonPath('starcw20Names', configPath)
  const starcw20assetjsonpath = getJsonPath('starcw20Assets', configPath)
  //
  const starpairnames = await loadJson(arrayTemplate, starpairNamejsonpath)
  let starcw20Asset = await loadJson(objectTemplate, starcw20assetjsonpath)
  let starcw20names = await loadJson(arrayTemplate, starcw20Namejsonpath)
  //
 // starcw20names[networkname] =[]
  starpairnames[networkname].forEach(element => {
    const element0 = element.split('-')[0]
    const element1 = element.split('-')[1]
    if (_whitelist.token[element0]) { if (!starcw20names[networkname].includes(element0)) starcw20names[networkname].push(element0) }
    if (_whitelist.token[element1]) { if (!starcw20names[networkname].includes(element1)) starcw20names[networkname].push(element1) }
  })
  //
  console.log(starcw20names[networkname])
  console.log(`total starcw20names ${starcw20names[networkname].length}`)
  await storeJson(starcw20names, starcw20Namejsonpath)
  // map as terraswap cw20
  starcw20names = await loadJson(arrayTemplate, starcw20Namejsonpath)
  starcw20Asset = await loadJson(objectTemplate, starcw20assetjsonpath)
  //
  starcw20names[networkname].forEach(element => {
    const addr = _whitelist.token[element]
    if (!starcw20Asset[addr]) {
      //
      console.log(element)
      //
      if (!!addr) {
        env.client.wasm.contractQuery(addr, {
          token_info: {}
        }).then(res => {
          starcw20Asset[networkname][addr] = {}
          starcw20Asset[networkname][addr]['protocol'] = `Terra ${res['symbol']}`
          starcw20Asset[networkname][addr]['symbol'] = res['symbol']
          starcw20Asset[networkname][addr]['name'] = res['name']
          starcw20Asset[networkname][addr]['token'] = addr
          starcw20Asset[networkname][addr]['icon'] = iconurl.replace('LOGO.png',`${res['symbol']}.png`)
          starcw20Asset[networkname][addr]['decimals'] = res['decimals']
          storeJson(starcw20Asset, starcw20assetjsonpath)
        }).catch(e => {
          console.log(`${element}-${e}`)
        })
      }
    }
  })

});