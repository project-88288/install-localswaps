import { task } from "@terra-money/terrain";
import { MsgExecuteContract, WaitTxBroadcastResult, } from "@terra-money/terra.js";
import { Coins } from "@terra-money/terra.js";
import { getPoolname, isPoolExist, savePool, containPool, generateStarPairs, getPoolnames_off_line } from "../lib/pool";
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
  const starpools = generateStarPairs('LUNA', networkname, _whitelistPath)
  console.log(starpools)
  //
  let instants: string[] = []
  for (let index = 0; index < 10; index++) {
    let value = 'contract' + index.toString()
    if (index == 0) value = "default";
    instants.push(value);
  }
  console.log(instants)
  //
  if (!refs.terraswap_factory['contractAddresses']) refs.terraswap_factory['contractAddresses'] = {}
  let faddress: string[] = []
  instants.forEach(element => {
    if (!!refs.terraswap_factory.contractAddresses[element])
      faddress.push(refs.terraswap_factory.contractAddresses[element])
  });
  //
  console.log(faddress)
  //
  let findex: number = 0
  for (let index = 0; index < starpools.length; index++) {
    const element = starpools[index];
    const _pools = getPoolnames_off_line(networkname, _whitelistPath)
    if (_pools.includes(element)) {
      console.log(`This pool ${element} is exists.`)
      continue
    }
    if (!(index % 3)) {
      findex++
      findex = findex % faddress.length
    }
    //
    console.log(`Ready to create pair: ${element}`)
    //
    const element0 = element.split('-')[0]
    const element1 = element.split('-')[1]
    //
    if (element0.toLocaleUpperCase() != "LUNA") continue
    //
    console.log(`${findex}) Using factory Addrress:${faddress[findex]}`)
    console.log(`Making pair of:${element0}-${element1}`)
    //
    const x_whitelist = loadWhiteList(_whitelistPath)
    const msgExecuteContract = new MsgExecuteContract(wallets[signer].key.accAddress,
      faddress[findex],
      {
        "create_pair": {
          "asset_infos": [{
            "native_token": {
              "denom": "uluna"
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
    console.log(JSON.stringify(msgExecuteContract.execute_msg))
    //
    const executeTx = await wallets[signer].createAndSignTx({ msgs: [msgExecuteContract] }).then().catch(e => {
      console.log(`simulate error : ${e.response.data.message}`)
      //console.log(e.response)
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
    console.log('wait 10 secs...')
    await delay(10000)
    console.log('continue...')
    //
  }
});
