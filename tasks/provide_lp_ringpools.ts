import { task } from "@terra-money/terrain";
import { Coin, MsgExecuteContract, WaitTxBroadcastResult, } from "@terra-money/terra.js";
import { Coins } from "@terra-money/terra.js";
import { getPoolname, isPoolExist, savePool, containPool, generateRingPairs, getPoolnames_off_line } from "../lib/pool";
import { generateTokenname, getTokensymbol } from "../lib/token"
import { saveWhiteList, loadWhiteList, getwhitelistPath, initialzeAssets, getJsonPath, loadJson, arrayTemplate } from "../lib/whitelist"
import { delay } from 'bluebird'

task(async ({ wallets, client, refs }) => {
  const rp_pools = 'ringpools'
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
  const x_whitelist = loadWhiteList(_whitelistPath)
  if (!x_whitelist[rp_pools]) {
    x_whitelist[rp_pools] = {}
    saveWhiteList(x_whitelist, _whitelistPath)
  }
  //
  const jsonPath = getJsonPath('demandpairsList', configPath)
  const ringpools = await loadJson(arrayTemplate, jsonPath)
  console.log(ringpools[networkname].length)
  console.log(ringpools)
  //
  for (let index = 0; index < ringpools[networkname].length; index++) {
    const element = ringpools[networkname][index];
    const _whitelist = loadWhiteList(_whitelistPath) 
    const _pools =_whitelist[rp_pools] 
    if (_pools[element]) {
      console.log(`This pool ${element} is exists.`)
      continue
    }
    //
    console.log(`${index})Ready to provide LP for pool: ${element}`)
    //
    const element0 = element.split('-')[0]
    const element1 = element.split('-')[1]
    //
    const y_whitelist = loadWhiteList(_whitelistPath)
    if (!!y_whitelist[rp_pools][element] || !!y_whitelist[rp_pools][`${element.split('-')[1]}-${element.split('-')[0]}`]) {
      console.log(`Pool for ${element} is exists.`)
      continue
    }
    //
    const pair_contract_addr = y_whitelist.pair[element]
    const token0 = y_whitelist.token[element0]
    const token1 = y_whitelist.token[element1]
    //
    const amount = "200000000000"
    const msgIncreaseAllowance0 = new MsgExecuteContract(wallets[signer].key.accAddress,
      token0, {
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
    console.log(`${element0} : ${msgIncreaseAllowance0.contract}`)
    console.log(msgIncreaseAllowance0.execute_msg)
    console.log(msgIncreaseAllowance0.coins)
    //
    const executeTx0 = await wallets[signer].createAndSignTx({ msgs: [msgIncreaseAllowance0] }).then()
      .catch(e => console.log(`broadcast error :${e}`))
    //
    if (!executeTx0) continue
    //
    const res0 = await lcd.tx.broadcast(executeTx0, 50000).then()
      .catch(e => {
        console.log(`broadcast error :${e.response.data.message}`)
      }) as WaitTxBroadcastResult
    //
    console.log('txhash: ', res0.txhash)
    await delay(5000)
    //
    const c1 = new Coin('uluna', 0)
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
    console.log(`${element1} : ${msgIncreaseAllowance1.contract}`)
    console.log(msgIncreaseAllowance1.execute_msg)
    console.log(msgIncreaseAllowance1.coins)
    //
    const executeTx1 = await wallets[signer].createAndSignTx({ msgs: [msgIncreaseAllowance1] }).then()
      .catch(e => console.log(`signup error :${e}`))
    //
    if (!executeTx1) continue
    //
    const res1 = await lcd.tx.broadcast(executeTx1, 50000).then().catch(e => {
      console.log(`broadcast error :${e.response.data.message}`)
    }) as WaitTxBroadcastResult
    //
    console.log('txhash: ', res1.txhash)
    await delay(5000)
    //
    const c = new Coin('uluna', 0)
    const msgProvideLiquidity = new MsgExecuteContract(wallets[signer].key.accAddress,
      pair_contract_addr, {
      "provide_liquidity": {
        "assets": [
          {
            "info": {
              "token": {
                "contract_addr": token0
              }
            },
            "amount": amount
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
    console.log(`${element} : ${msgProvideLiquidity.contract}`)
    console.log(JSON.stringify(msgProvideLiquidity.execute_msg, null, 2))
    console.log(msgProvideLiquidity.coins)
    //
    const executeTx = await wallets[signer].createAndSignTx({ msgs: [msgProvideLiquidity] }).then()
      .catch(e => console.log(`broadcast error :${e}`))
    //
    if (!executeTx) continue
    //
    const res = await lcd.tx.broadcast(executeTx, 50000).then().catch(e => {
      console.log(`broadcast error :${e.response.data.message}`)
    }) as WaitTxBroadcastResult
    //
    console.log('txhash: ', res.txhash)
    //
    if (!res) continue
    res.logs[0].events.map((log) => {
      if (log.type === 'wasm')
        log.attributes.map(l => {
          if (l.key === 'share') {
            x_whitelist[rp_pools][`${element0}-${element1}`] = l.value
            saveWhiteList(x_whitelist, _whitelistPath)
            console.log(`Saving ${element0}-${element1}` + ':' + l.value)
          }
        })
    })
    //
    console.log('wait 10 secs...')
    await delay(10000)
    console.log('continue...')
  }
});