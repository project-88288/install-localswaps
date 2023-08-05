import { Env, task } from "@terra-money/terrain";
import {
  loadWhiteList, getwhitelistPath, initialzeAssets,
   loadJson, arrayTemplate,getJsonPath,storeJson
} from "../lib/whitelist"
import { generatenames } from "../lib/token";

task(async (env: Env) => {
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
  let tokenList = await loadJson(arrayTemplate,tokenjsonpath)
  const names = generatenames()
  //
  tokenList[networkname] = []
  names.forEach(element => {
    if (_whitelist.token[element]) {
      if (!tokenList[networkname].includes(element)) {
        tokenList[networkname].push(element)
      }
    }
  });
  //
  console.log(`total token ${tokenList[networkname].length} in ${networkname}`)
  await storeJson(tokenList, tokenjsonpath)
  //
});