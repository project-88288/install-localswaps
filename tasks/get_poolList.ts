import { Env, task } from "@terra-money/terrain";
import {
  loadWhiteList, getwhitelistPath, initialzeAssets, 
  getJsonPath,loadJson,arrayTemplate,storeJson,objectTemplate
} from "../lib/whitelist"

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
  const tokenjsonpath = getJsonPath('tokenList',configPath)
  const tokenList = await loadJson(arrayTemplate,tokenjsonpath)
  const names = tokenList[networkname]
  //
  const pooljsonPath = getJsonPath('poolList', configPath)
  let poolList = await loadJson(objectTemplate,pooljsonPath)
  poolList[networkname] = []
  //
  names.forEach(element0 => {
    names.forEach(element1 => {
      if (_whitelist[rp_pools][`${element0}-${element1}`]) {
        //
        if (!poolList[networkname].includes(`${element0}-${element1}`) &&
          !poolList[networkname].includes(`${element1}-${element0}`)) {
          poolList[networkname].push(`${element0}-${element1}`)
        }
        //
      }
    });
  });
  //
  console.log(`total pool ${poolList[networkname].length} in ${networkname}`)
  await storeJson(poolList, pooljsonPath)
  //
});