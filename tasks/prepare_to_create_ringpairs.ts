import { Env, task } from "@terra-money/terrain";
import { generateRingPairs, generateStarPairs } from "../lib/pool";
import {
  loadWhiteList, getwhitelistPath, initialzeAssets,
  getJsonPath, loadJson, arrayTemplate, storeJson, objectTemplate
} from "../lib/whitelist"
import { generatenames } from "../lib/token";
//
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
  console.log(`review the token as in the _whitelist!`)
  const _whitelist = loadWhiteList(_whitelistPath)
  const tokenjsonpath = getJsonPath('tokenList', configPath)
  const names = generatenames()
  let tokenList = await loadJson(arrayTemplate, tokenjsonpath)
  tokenList[networkname] = []
  names.forEach(element => {
    if (_whitelist.token[element]) {
      if (!(_whitelist.token[element] === "reserve")) {
        if (!tokenList[networkname].includes(element)) {
          tokenList[networkname].push(element)
        }
      }
    }
  });
  //
  console.log(`total token ${tokenList[networkname].length} in ${networkname}`)
  console.log(`Store token to ${tokenjsonpath}`)
  await storeJson(tokenList, tokenjsonpath)
  //
  const demandringPairs = await generateRingPairs(configPath, networkname)
  console.log(`total demand ringpairs = ${demandringPairs.length}`)
  //
  console.log(`review the pairs as in the _whitelist!`)
  const pairedTokensPath = getJsonPath('pairedTokens', configPath)
  let pairedTokens = await loadJson(arrayTemplate, pairedTokensPath)
  pairedTokens[networkname] = []
  //
  const pairjsonPath = getJsonPath('pairList', configPath)
  let pairList = await loadJson(arrayTemplate, pairjsonPath)
  pairList[networkname] = []
  //
  tokenList = await loadJson(arrayTemplate, tokenjsonpath)
  const tokens = tokenList[networkname]
  tokens.forEach(element0 => {
    tokens.forEach(element1 => {
      if (_whitelist.pair[`${element0}-${element1}`]) {
        // push only first token
        if (!pairedTokens[networkname].includes(element0)) pairedTokens[networkname].push(element0)
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
  pairedTokens = await loadJson(arrayTemplate, pairedTokensPath);
  tokenList = await loadJson(arrayTemplate, tokenjsonpath)
  const unpairedTokensPath = getJsonPath('unpairedTokens', configPath)
  let unpairedTokens = await loadJson(objectTemplate, unpairedTokensPath)
  unpairedTokens[networkname] = {}
  tokenList[networkname].forEach(element => {
    if (!pairedTokens[networkname].includes(element)) {
      unpairedTokens[networkname][element] = _whitelist.token[element]
    }
  })
  //
  tokenList = await loadJson(arrayTemplate, tokenjsonpath)
  const uppairedNames: string[] = []
  tokenList[networkname].forEach(element => {
    if (!pairedTokens[networkname].includes(element)) {
      if (!uppairedNames.includes(element)) uppairedNames.push(element)
    }
  })
  //
  console.log(`pairs to create starpairs = ${uppairedNames.length}`)
  const starPairs = await generateStarPairs(uppairedNames, networkname, configPath)
  console.log(`created starpairs = ${starPairs.length}`)
  console.log(starPairs)
  //
  console.log(`total unpairedToken ${tokenList[networkname].length - pairedTokens[networkname].length} in ${networkname}`)
  await storeJson(unpairedTokens, unpairedTokensPath);
  //
  pairedTokens = await loadJson(arrayTemplate, pairedTokensPath);
  pairList = await loadJson(arrayTemplate, pairjsonPath)
  for (let index = 0; index < pairList[networkname].length - 1; index++) {
    const element = pairList[networkname][index];
    if (!pairedTokens[networkname].includes(element.split('-')[1])) {
      console.log(`${element} is not completed pair token!`)
    }
  }
  //
  pairList = await loadJson(arrayTemplate, pairjsonPath)
  console.log(`load exists pairs from ${pairjsonPath} total ${pairList[networkname].length}`)
  //

  //
  let missingPairs: string[] = []
  demandringPairs.forEach(element => {
    if (!pairList[networkname].includes(`${element.split('-')[0]}-${element.split('-')[1]}`) &&
      !pairList[networkname].includes(`${element.split('-')[1]}-${element.split('-')[0]}`)) {
      missingPairs.push(element)
    }
  });
  //
  console.log(`not ready pairs ${missingPairs.length}`)
  console.log(missingPairs)
  //
  let mistakePairs: string[] = []
  pairList[networkname].forEach(element => {
    if (!demandringPairs.includes(`${element.split('-')[0]}-${element.split('-')[1]}`) &&
      !demandringPairs.includes(`${element.split('-')[1]}-${element.split('-')[0]}`)) {
      mistakePairs.push(element)
    }
  });
  //
  console.log(`Out demand pairs ${mistakePairs.length}`)
  console.log(mistakePairs)
  //
});