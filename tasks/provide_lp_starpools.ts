import { task } from "@terra-money/terrain";
import { MsgExecuteContract, WaitTxBroadcastResult, } from "@terra-money/terra.js";
import { Coins } from "@terra-money/terra.js";
import { getPoolname, isPoolExist, savePool, containPool, generateStarPairs, getPoolnames_off_line } from "../lib/pool";
import { generateTokenname, getTokensymbol } from "../lib/token"
import { saveWhiteList, loadWhiteList, getwhitelistPath, initialzeAssets } from "../lib/whitelist"
import { delay } from 'bluebird'

task(async ({ wallets, client, refs }) => {
  const sp_pools = 'starpools'
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
  const starpools = generateStarPairs('LUNA', networkname, _whitelistPath)
  console.log(starpools)
  //
  for (let index = 0; index < starpools.length; index++) {
    const element = starpools[index];
    const _pools = getPoolnames_off_line(networkname, _whitelistPath)
    if (!_pools.includes(element)) {
      console.log(`This pool ${element} is not exists.`)
      continue
    }
    //
    console.log(`Ready to provide LP for pool: ${element}`)
    //
    const element0 = element.split('-')[0]
    const element1 = element.split('-')[1]
    //
    const _whitelist = loadWhiteList(_whitelistPath)
    if (!_whitelist[sp_pools]) {
      _whitelist[sp_pools] = {}
      saveWhiteList(_whitelist, _whitelistPath)
    }
    //
    if (!!_whitelist[sp_pools][element] || !!_whitelist[sp_pools][`${element.split('-')[1]}-${element.split('-')[0]}`]) {
      console.log(`Pool for ${element} is exists.`)
      continue
    }
    //
    console.log(`Liquidity for pool of:${element0}-${element1}`)
    //
    const x_whitelist = loadWhiteList(_whitelistPath)
    const pair_contract_addr = x_whitelist.pair[element]
    let token1 = ""
    if (element1 === "LUNA") token1 = x_whitelist.token[element0]
    if (element0 === "LUNA") token1 = x_whitelist.token[element1]
    if (token1 === "uluna" || token1 === "") {
      console.log(`${element} is not for start loop`)
      continue
    }
    //
    const amount = "600000000000"
    //
    const msgIncreaseAllowance1 = new MsgExecuteContract(wallets[signer].key.accAddress,
      token1, {
      "increase_allowance": {
        "amount": amount,
        "expires": {
          "never": {}
        },
        "spender": pair_contract_addr
      }
    },
      new Coins([]))
    //
    console.log(msgIncreaseAllowance1.execute_msg)
    //
    const executeTx1 = await wallets[signer].createAndSignTx({ msgs: [msgIncreaseAllowance1] }).then()
      .catch(e => console.log(e.response.data.message))
    //
    if (!executeTx1) continue
    //
    const res1 = await lcd.tx.broadcast(executeTx1, 50000).then().catch(e => {
      console.log(`broadcast error :${e.response.data.message}`)
    }) as WaitTxBroadcastResult
    //
    console.log(res1.txhash)
    //
    const msgProvideLiquidity = new MsgExecuteContract(wallets[signer].key.accAddress,
      pair_contract_addr, {
      "provide_liquidity": {
        "assets": [
          {
            "info": {
              "native_token": {
                "denom": "uluna"
              }
            },
            "amount": "1000000"
          },
          {
            "info": {
              "token": {
                "contract_addr": token1
              }
            },
            "amount": amount
          }
        ]
      }
    },
      new Coins([]))
    //
    console.log(msgProvideLiquidity.execute_msg)
    //
    const executeTx = await wallets[signer].createAndSignTx({ msgs: [msgProvideLiquidity] }).then()
      .catch(e => {
        console.log(e.response.data.message)
      })
    //
    if (!executeTx) continue
    //
    const res = await lcd.tx.broadcast(executeTx, 50000).then().catch(e => {
      console.log(`broadcast error :${e.response.data.message}`)
    }) as WaitTxBroadcastResult
    //
    console.log(res.txhash)
    //
    /*
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
    */
    //
    await delay(10000)
    //
  }
});
