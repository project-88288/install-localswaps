import { Env, task } from "@terra-money/terrain";
import { getPoolname, isPoolExist, savePool, containPool, getLastBlock } from "../lib/pool";
import { generateTokenname, getTokensymbol, saveToken } from "../lib/token"
import { saveWhiteList, loadWhiteList, getwhitelistPath, initialzeAssets, initialzeTokenlist, getTokenPath, loadToken_assets, storeToken_assets } from "../lib/whitelist"
import { delay } from 'bluebird'

task(async ({ wallets, client, refs }) => {
  const networkname = process.env.network
  const configPath = process.env.configPath
  const signer = process.env.signer
  const lcd = client
  if (!signer) return
  if (!configPath) return
  if (!networkname) return;
  console.log(networkname, signer)
  const __whitelistPath = getwhitelistPath(configPath, networkname)
  if (!__whitelistPath) return
  await initialzeAssets(__whitelistPath)

  //
  const _whitelist = loadWhiteList(__whitelistPath)
  const blockName = 'factory'

  const tokenPath = getTokenPath(configPath)
  //await initialzeTokenlist(tokenPath)
 
  const xx = await loadToken_assets(tokenPath)
  xx.localterra.push("XXX")
  console.log(xx)
  await storeToken_assets(xx,tokenPath)

  //
});