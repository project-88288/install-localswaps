import { Env, task } from "@terra-money/terrain";
import {
  loadWhiteList, getwhitelistPath, initialzeAssets,
  getJsonPath, loadJson, storeJson, arrayTemplate
} from "../lib/whitelist"

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
  const names = tokenList[networkname]
  //
  console.log(`total token name ${names.length} in ${networkname}`)
  //
  let _names: string[] = []
  names.forEach(element => {
    if (!_names.includes(element)) {
      _names.push(element)
    }
  });
  //
  console.log(`total review token name ${_names.length} in ${networkname}`)
  //
  const pairedTokensPath = getJsonPath('pairedTokens', configPath)
  let pairedTokens = await loadJson(arrayTemplate, pairedTokensPath)
  pairedTokens[networkname] = []
  //
    //
    const pairjsonPath = getJsonPath('pairList', configPath)
    let pairList = await loadJson(arrayTemplate, pairjsonPath)
    pairList[networkname] = []
  //
  names.forEach(element0 => {
    names.forEach(element1 => {
      if (_whitelist.pair[`${element0}-${element1}`]) {
        if (!pairedTokens[networkname].includes(element0)) pairedTokens[networkname].push(element0)
        if (!pairedTokens[networkname].includes(element1)) pairedTokens[networkname].push(element1)
        //
        if (!pairList[networkname].includes(`${element0}-${element1}`) &&
          !pairList[networkname].includes(`${element1}-${element0}`)) {
          pairList[networkname].push(`${element0}-${element1}`)
        }
        //
      }
    });
  });
  //
  console.log(`total pair ${pairList[networkname].length} in ${networkname}`)
  await storeJson(pairList, pairjsonPath)
  console.log(`total pairedToken ${pairedTokens[networkname].length} in ${networkname}`)
  await storeJson(pairedTokens, pairedTokensPath);
  //

  //
});