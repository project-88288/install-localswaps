import { saveWhiteList, loadWhiteList } from '@project-88288/opz-libs'
import { getwhitelistPath, initialzeAssets } from "./whitelist";
import { task, Env } from "@terra-money/terrain"
import { Coin, Coins, MsgExecuteContract, WaitTxBroadcastResult } from '@terra-money/terra.js';
import { delay } from 'bluebird'
import { Base64 } from "js-base64"

export async function swap_offerToken(env: Env, token: string, amount: string, pair_contract_addr: string) {

  const networkname = process.env.network
  const configPath = process.env.configPath
  const signer = process.env.signer
  const lcd = env.client
  if (!signer) return
  if (!configPath) return
  if (!networkname) return;
  //
  console.log(`swap_offerToken for network: ${networkname} signer: ${signer}`)
  //
  const __whitelistPath = getwhitelistPath(configPath, networkname)
  if (!__whitelistPath) return
  await initialzeAssets(__whitelistPath)
  //
  const _whitelist = loadWhiteList(__whitelistPath)
  const swap_offerToken = 'swap_offerToken'
  if (!_whitelist[swap_offerToken]) {
    _whitelist[swap_offerToken] = {}
    saveWhiteList(_whitelist, __whitelistPath)
  }
  //
  if(!!_whitelist[swap_offerToken][pair_contract_addr]) {
    console.log(`${pair_contract_addr}:${_whitelist[swap_offerToken][pair_contract_addr]} is Exists`)
    return
  }
  //
  const msgSwap =
  {
    "swap": {
      "to": env.wallets[signer].key.accAddress
    }
  }
  //
  console.log(msgSwap)
  //
  const msgSwap_offetToken = new MsgExecuteContract(env.wallets[signer].key.accAddress,
    token, {
    "send": {
      "contract": pair_contract_addr,
      "amount": amount,
      "msg": Base64.encode(JSON.stringify(msgSwap))
    }
  },
    new Coins([]))
  //
  console.log(msgSwap_offetToken)
  //
  const executeTx = await env.wallets[signer].createAndSignTx({ msgs: [msgSwap_offetToken] }).then()
    .catch(e => {
      console.log(`broadcast error :${e}`)
      console.log(e)
    }
    )
  //
  if (!executeTx) return
  console.log(executeTx)
  console.log(executeTx.auth_info.signer_infos)
  console.log(executeTx.auth_info.fee.amount)
  await delay(5000)
  const res = await lcd.tx.broadcast(executeTx, 50000).then().catch(e => {
    console.log(`broadcast error :${e.response.data.message}`)
  }) as WaitTxBroadcastResult
  //
 
  _whitelist[swap_offerToken][`${pair_contract_addr}`] = res.txhash
  saveWhiteList(_whitelist, __whitelistPath)
  console.log('txhash: ', res.txhash)
  //
  res.logs[0].events.map((log) => {
    if (log.type === 'wasm')
      log.attributes.map(l => {
        console.log(l)
      })
  })
  //
  await delay(5000)
//
}