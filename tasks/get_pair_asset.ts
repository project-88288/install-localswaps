import { Env, task } from "@terra-money/terrain";
import { arrayTemplate, getJsonPath, getwhitelistPath, initialzeAssets, loadJson, loadWhiteList, objectTemplate, storeJson } from "../lib/whitelist";
import { getTokensymbol } from "../lib/token";

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
  const ringpairAddrjsonpath = getJsonPath('ringpairAddress', configPath)
  const ringpairNamejsonpath = getJsonPath('ringPairNames', configPath)
  const ringpairassetjsonpath = getJsonPath('ringpairAssets', configPath)
  //
  const rpairaddrs = await loadJson(objectTemplate, ringpairAddrjsonpath)
  const rpairnames = await loadJson(arrayTemplate, ringpairNamejsonpath)
  let ringpairAsset = await loadJson(objectTemplate, ringpairassetjsonpath)
  //
  const _whitelist = loadWhiteList(_whitelistPath)
  rpairnames[networkname].forEach(element => {
    if (_whitelist.pair[element]) {
      rpairaddrs[networkname][element] = _whitelist.pair[element]
    }
  })
  //
  await storeJson(rpairaddrs, ringpairAddrjsonpath)
  //
  // map as terraswap pairs

  const rpairAsset = await loadJson(objectTemplate, ringpairassetjsonpath)
  let rpairParams = rpairAsset[networkname]
  rpairnames[networkname].forEach(element => {
    const addr = rpairaddrs[networkname][element]
    if (!rpairParams[addr]) {
      if (!!addr) {
        env.client.wasm.contractQuery(addr, {
          pair: {}
        }).then(res => {
          console.log(res)
          const assets: object[] = res['asset_infos']
          if (assets.length > 0) {
            rpairParams[addr] = {}
            rpairParams[addr]['dex'] = 'terraswap'
            rpairParams[addr]['type'] = 'xyk'
            rpairParams[addr]['assets'] = []
            assets.forEach(asset => {
              if (asset['token']) {
                const tokenAddr = asset['token']['contract_addr']
                rpairParams[addr]['assets'].push(tokenAddr)
              }
              else
                if (asset['native_token']) {
                  const denom = asset['native_token']['denom']
                  rpairParams[addr]['assets'].push(denom)
                }
            })
            ringpairAsset[networkname] = rpairParams
            storeJson(ringpairAsset, ringpairassetjsonpath)
          }
        }).catch(e => {
          console.log(`${element}-${e}`)
        })
      }
    }

  })
  //
  const starpairAddrjsonpath = getJsonPath('starpairAddress', configPath)
  const starpairNamejsonpath = getJsonPath('starpairNames', configPath)
  const starpairassetjsonpath = getJsonPath('starpairAssets', configPath)
  //
  const pairaddrs = await loadJson(objectTemplate, starpairAddrjsonpath)
  const pairnames = await loadJson(arrayTemplate, starpairNamejsonpath)
  let starpairAsset = await loadJson(objectTemplate, starpairassetjsonpath)
  //
  // map as terraswap pairs
  let pairParams = starpairAsset[networkname]
  pairnames[networkname].forEach(element => {
    const addr = pairaddrs[networkname][element]
    if (!pairParams[addr]) {
      if (!!addr) {
        env.client.wasm.contractQuery(addr, {
          pair: {}
        }).then(res => {
          const assets: object[] = res['asset_infos']
          if (assets.length > 0) {
            pairParams[addr] = {}
            pairParams[addr]['dex'] = 'astroport'
            if (res['pair_type']['xyk']) {
              pairParams[addr]['type'] = 'xyk'
            }

            pairParams[addr]['assets'] = []
            assets.forEach(asset => {
              if (asset['token']) {
                const tokenAddr = asset['token']['contract_addr']
                pairParams[addr]['assets'].push(tokenAddr)
              }
              else
                if (asset['native_token']) {
                  const denom = asset['native_token']['denom']
                  pairParams[addr]['assets'].push(denom)
                }
            })
            starpairAsset[networkname] = pairParams
            storeJson(starpairAsset, starpairassetjsonpath)
          }
        }).catch(e => {
          console.log(`${element}-${e}`)
        })
      }
    }
  })
  //
});