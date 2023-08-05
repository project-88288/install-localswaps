import { task } from "@terra-money/terrain";
import { MsgExecuteContract, WaitTxBroadcastResult, } from "@terra-money/terra.js";
import { Coins } from "@terra-money/terra.js";
import { getPoolname, isPoolExist, savePool, containPool, generateRingPairs, getPoolnames_off_line, getPoolfactory } from "../lib/pool";
import { generateTokenname, getTokensymbol } from "../lib/token"
import { saveWhiteList, loadWhiteList, getwhitelistPath, initialzeAssets } from "../lib/whitelist"
import { delay } from 'bluebird'

task(async ({ wallets, client, refs }) => {

  const networkname = process.env.network
  const configPath = process.env.configPath
  const signer = process.env.signer
  const lcd = client
  if (!signer) return
  if (!configPath) return
  if (!networkname) return;
  //
  console.log(networkname, signer)
  console.log(wallets[signer].key.accAddress)
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
    console.log(`Ready to register pair: ${element}`)
    //
    const element0 = element.split('-')[0]
    const element1 = element.split('-')[1]
    //
    const _whitelist = loadWhiteList(_whitelistPath)
    const faddress = await getPoolfactory(_whitelist.pair[element],lcd)
  //
    console.log(`Using factory Addrress:${faddress}`)
    console.log(`Making pair of:${element0}-${element1}`)
    //
    const x_whitelist = loadWhiteList(_whitelistPath)
    const msgExecuteContract = new MsgExecuteContract(wallets[signer].key.accAddress,
      faddress,
      {
        "register": {
          "asset_infos": [
            {
              "token": {
                "contract_addr": x_whitelist.token[element0]
              }
            },
            {
              "token": {
                "contract_addr": x_whitelist.token[element1]
              }
            }
          ]
        }
      },
      new Coins([]))
    //
    console.log(msgExecuteContract.execute_msg['register']['asset_infos'])
    //
    const executeTx = await wallets[signer].createAndSignTx({ msgs: [msgExecuteContract] }).then().catch(e => {
      console.log(`simulate error : ${e.response.data.message}`)
    })
    if (!executeTx) continue
    //
    const res = await lcd.tx.broadcast(executeTx, 50000).then().catch(e => {
      console.log(`broadcast error :${e.response.data.message}`)
    }) as WaitTxBroadcastResult
    //
    if (!res) continue
    res.logs[0].events.map((log) => {
      if (log.type === 'wasm')
        log.attributes.map(l => {
          if (l.key === 'pair_contract_addr') {
            x_whitelist.pair[`${element0}-${element1}`] = l.value
            saveWhiteList(x_whitelist, _whitelistPath)
            console.log(`Saving ${element0}-${element1}` + ':' + l.value)
          }
        })
    })
    //
    await delay(10000)
    //
  }
});