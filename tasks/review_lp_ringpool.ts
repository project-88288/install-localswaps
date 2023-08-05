import { Env, task } from "@terra-money/terrain";
import {
  loadWhiteList, getwhitelistPath, initialzeAssets,
  getTokenPath, loadPair_assets, storePair_assets,
  getPairPath, loadToken_assets, loadal_assets, getlpPath, storelp_assets
} from "../lib/whitelist"
import { delay } from 'bluebird'

task(async (env: Env) => {
  const rp_pools = 'ringpools'
  const networkname = process.env.network
  const configPath = process.env.configPath
  const signer = process.env.signer
  if (!signer) return
  if (!configPath) return
  if (!networkname) return;
  console.log(networkname, signer)
  const __whitelistPath = getwhitelistPath(configPath, networkname)
  if (!__whitelistPath) return
  await initialzeAssets(__whitelistPath)
  //
  const _whitelist = loadWhiteList(__whitelistPath)
  //
  const pairPath = getPairPath(configPath)
  const pairList = await loadPair_assets(pairPath)
  const pairs: string[] = pairList[networkname]
  const lpPath = getlpPath(configPath)
  let lp = await loadal_assets(lpPath)
  pairs.forEach(element => {
    if (!!lp[networkname][element]) {
      console.log(`${element} is exists.`)
    }
    else 
    {
      delay(10000)
      //
      if(!!_whitelist[rp_pools][`${element.split('-')[0]}-${element.split('-')[1]}`]) {
        if (!!_whitelist.pair[`${element.split('-')[0]}-${element.split('-')[1]}`]) {
          const addr = _whitelist.pair[`${element.split('-')[0]}-${element.split('-')[1]}`]
          if (!!addr) {
            env.client.wasm.contractQuery(addr, {
              pool: {}
            }).then(res => {
              lp[networkname][element] = res
              storelp_assets(lp, lpPath)
            }).catch(e => {
              console.log(`${element}-${e}`)
            })
          }
        }
      }
      //
      if (!!_whitelist[rp_pools][`${element.split('-')[1]}-${element.split('-')[0]}`]) { 
        if (!!_whitelist.pair[`${element.split('-')[1]}-${element.split('-')[0]}`]) {
          const addr = _whitelist.pair[`${element.split('-')[1]}-${element.split('-')[0]}`]
          if (!!addr) {
            env.client.wasm.contractQuery(addr, {
              pool: {}
            }).then(res => {
              lp[networkname][element] = res
              storelp_assets(lp, lpPath)
            }).catch(e => {
              console.log(`${element}-${e}`)
            })
          }
        }
      }
    }
  });
  //
});