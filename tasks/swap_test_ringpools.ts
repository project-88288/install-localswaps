import { task ,Env} from "@terra-money/terrain";
import { Coin, MsgExecuteContract, MsgSend, MsgSwap, MsgSwap, MsgSwapSend, WaitTxBroadcastResult, } from "@terra-money/terra.js";
import { Coins } from "@terra-money/terra.js";
import { getPoolname, isPoolExist, savePool, containPool, generateRingPairs, getPoolnames_off_line } from "../lib/pool";
import { generateTokenname, getTokensymbol } from "../lib/token"
import { saveWhiteList, loadWhiteList, getwhitelistPath, initialzeAssets } from "../lib/whitelist"
import { delay } from 'bluebird'
import { Base64 } from "js-base64"
import { swap_offerToken } from "../lib/swap";

task(async (env:Env) => {
  const lp_pools = 'test_swap_ringpools'
  const networkname = process.env.network
  const configPath = process.env.configPath
  const signer = process.env.signer
  const lcd = env.client
  if (!signer) return
  if (!configPath) return
  if (!networkname) return;
  //
  console.log(networkname, signer)
  console.log(env.wallets[signer].key.accAddress)
  console.log(configPath)
  //
  const _whitelistPath = getwhitelistPath(configPath, networkname)
  if (!_whitelistPath) return
  await initialzeAssets(_whitelistPath)
  //
  const ringpools = generateRingPairs(networkname, _whitelistPath)
  console.log(ringpools)
  //
  for (let index = 0; index < ringpools.length; index++) {
    const element = ringpools[index];
    const _pools = getPoolnames_off_line(networkname, _whitelistPath)
    if (!_pools.includes(element)) {
      console.log(`This pool ${element} is not exists.`)
      continue
    }
    //
    const element0 = element.split('-')[0]
    const element1 = element.split('-')[1]
    //
    const x_whitelist = loadWhiteList(_whitelistPath)
    if (!x_whitelist[lp_pools]) {
      x_whitelist[lp_pools] = {}
      saveWhiteList(x_whitelist, _whitelistPath)
    }
    //
    //
    if (!!x_whitelist[lp_pools][element] || !!x_whitelist[lp_pools][`${element.split('-')[1]}-${element.split('-')[0]}`]) {
      console.log(`Test swap for ${element} is exists.`)
      continue
    }
    //
    console.log(`Test swap for pool of:${element0}-${element1}`)
    //
    const pair_contract_addr = x_whitelist.pair[element]
    const token0 = x_whitelist.token[element0]
    const token1 = x_whitelist.token[element1]
    const amount = "2000000"
    //
    await swap_offerToken(env,token0,amount,pair_contract_addr)
   //
  }
});