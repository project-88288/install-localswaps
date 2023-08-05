import { Env, task } from "@terra-money/terrain";
import {
  loadWhiteList, getwhitelistPath, initialzeAssets,
  getJsonPath, loadJson, arrayTemplate, storeJson, objectTemplate
} from "../lib/whitelist"
import { delay } from 'bluebird'
import { Coins, MsgExecuteContract } from "@terra-money/terra.js";

task(async (env: Env) => {
  const rp_pools = 'ringpools'
  const networkname = process.env.network
  const configPath = process.env.configPath
  const signer = process.env.signer
  if (!signer) return
  if (!configPath) return
  if (!networkname) return;
  //
  console.log(networkname, signer)
  console.log(env.wallets[signer].key.accAddress)
  console.log(configPath)
  //
  const __whitelistPath = getwhitelistPath(configPath, networkname)
  if (!__whitelistPath) return
  await initialzeAssets(__whitelistPath)
  //
  const _whitelist = loadWhiteList(__whitelistPath)
  //
  const tokenjsonPath = getJsonPath('tokenList', configPath)
  const pooljsonPath = getJsonPath('poolList', configPath)
  const allowancejsonPath1 = getJsonPath('allowanceList', configPath)
  const poolsList = await loadJson(arrayTemplate, pooljsonPath)
  //
  poolsList[networkname] = []
  const tokenList = await loadJson(arrayTemplate, tokenjsonPath)
  const names = tokenList[networkname]
  //
  names.forEach(element0 => {
    names.forEach(element1 => {
      if (_whitelist[rp_pools][`${element0}-${element1}`]) {
        //
        if (!poolsList[networkname].includes(`${element0}-${element1}`) &&
          !poolsList[networkname].includes(`${element1}-${element0}`)) {
          poolsList[networkname].push(`${element0}-${element1}`)
        }
        //
      }
    });
  });
  await storeJson(poolsList, pooljsonPath)
  //
  console.log(`total pool ${poolsList[networkname].length} in ${networkname}`)
  //
  let altokens: string[] = []
  //
  const _poolsList = await loadJson(arrayTemplate, pooljsonPath)
  _poolsList[networkname].forEach(element => {
    if (!altokens.includes(element.split('-')[0])) altokens.push(element.split('-')[0])
    if (!altokens.includes(element.split('-')[1])) altokens.push(element.split('-')[1])
  })
  //
  console.log(altokens)
  //
  let allowancesList = await loadJson(objectTemplate, allowancejsonPath1)
  //
  altokens.forEach(element => {
    if (!!allowancesList[networkname][element]) {
      console.log(`${element} is exists`)
    }
    else {
      delay(15000)
      if (!!_whitelist.token[`${element}`]) {
        const addr = _whitelist.token[`${element}`]
        if (!!addr) {
          env.client.wasm.contractQuery(addr, {
            all_allowances: { owner: env.wallets[signer].key.accAddress }
          }).then(res => {
            allowancesList[networkname][element] = res
            storeJson(allowancesList, allowancejsonPath1)
          }).catch(e => {
            console.log(`${element}-${e}`)
          })
        }
      }
    }
  });
  //
  allowancesList = await loadJson(objectTemplate, allowancejsonPath1)
  for (let index = 0; index < altokens.length; index++) {
    const element = altokens[index];
    if (!!allowancesList[networkname][element]) {
      allowancesList[networkname][element]['allowances'].forEach(e => {
        if (!!e['allowance']) {
          if (e['allowance'] == 0) {
            console.log(allowancesList[networkname][element])
            allowancesList[networkname][element] = { "allowances": [] }
          }
        }
        //
        console.log(allowancesList[networkname][element])
      })
    }
  }
  await storeJson(allowancesList, allowancejsonPath1)
  //
  allowancesList = await loadJson(objectTemplate, allowancejsonPath1)
  for (let index = 0; index < altokens.length; index++) {
    const element = altokens[index];
    //
    if (!!allowancesList[networkname][element]) {
      allowancesList[networkname][element]['allowances'].forEach(e => {
        if (!!e['allowance']) {
          console.log(`Found!! ${e}`)
          if (e['allowance'] == 0) {
            allowancesList[networkname][element] = { "allowances": [] }
            storeJson(allowancesList, allowancejsonPath1)
            delay(10000)
          }
          if (e['allowance'] > 0) {
            console.log(`Found!! ${element}`)
            const addr = _whitelist.token[`${element}`]
            console.log(allowancesList[networkname][element])
            //
            const msgDecreaseAllowance1 = new MsgExecuteContract(env.wallets[signer].key.accAddress,
              addr, {
              "decrease_allowance": {
                "amount": e['allowance'],
                "expires": {
                  "never": {}
                },
                "spender": e['spender']
              }
            },
              new Coins([]))
            //
            console.log(`${element} : ${msgDecreaseAllowance1.contract}`)
            console.log(msgDecreaseAllowance1.execute_msg)
            console.log(msgDecreaseAllowance1.coins)
            //
            delay(60000)
            env.wallets[signer].createAndSignTx({ msgs: [msgDecreaseAllowance1] }).then(executeTx1 => {
              env.client.tx.broadcast(executeTx1, 50000).then(
                data => {
                  console.log(data)
                  allowancesList[networkname][element] = { "allowances": [] }
                  storeJson(allowancesList, allowancejsonPath1)
                  delay(1000)
                }).catch(e => {
                  console.log(`broadcast error :${e.response.data.message}`)
                })

            }).catch(e => console.log(`broadcast error :${e}`))
            //
          }
        }
      })
    }
  }
  //
});