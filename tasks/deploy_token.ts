import { task } from "@terra-money/terrain"
import { saveWhiteList, WhiteList_template, loadWhiteList } from '@project-88288/opz-libs'
import * as fs from 'fs-extra';
import { delay } from 'bluebird'
const words = require("../assets/reserveWords.json")

task(async ({ wallets, deploy, refs }) => {
  const networkname = process.env.network
  if (!networkname) return;
  const signer = process.env.signer
  if (!signer) return
  //
  console.log(networkname, signer)
  //
  const whitelistPath = process.env.configPath?.replace('config.terrain.json', `assets/${networkname}_whiteLists.json`)
  if (!whitelistPath) return
  await initialzeAssets(whitelistPath)
  console.log(whitelistPath)

  const reservewords: string[] = words[networkname]
  const wordstoreserve: string[] = []
  reservewords.forEach(element => {
    const res = element.toUpperCase().trim().slice(0, 3)
    wordstoreserve.push(res)
  });

  let x_whitelist = loadWhiteList(whitelistPath)
  wordstoreserve.forEach(element => {
    x_whitelist.token[element] = "reserve"
  })
  saveWhiteList(x_whitelist, whitelistPath)

  // map code storage
  const pair_code_id = Number.parseInt(refs.terraswap_pair.codeId)
  const token_code_id = Number.parseInt(refs.terraswap_token.codeId)
  const factory_codeId = Number.parseInt(refs.terraswap_factory.codeId)
  const router_codeId = Number.parseInt(refs.terraswap_router.codeId)
  //

  let chars: string[] = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
    'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
  ]

  let names: string[] = []
  let count = 0
  for (let index1 = 0; index1 < chars.length; index1++) {
    for (let index2 = 0; index2 < chars.length; index2++) {
      for (let index3 = 0; index3 < chars.length; index3++) {
        const element = chars[index1] + chars[index2] + chars[index3]
        if (!wordstoreserve.includes(element))
          names.push(element)
        else
          console.log(`${count++}) passed as in reserve ${element}`)
        //
      }
    }
  }

  let y_counter = 0;
  let __counter = 0;
  for (let index = 0; index < names.length; index++) {
    //
    if (y_counter++ % 135) continue
    //
    const element = names[index];
    let _whitelist = loadWhiteList(whitelistPath)
    if (!!_whitelist.token[element]) {
      console.log(`Existed token ${element}`)
      continue;
    }
    if (!token_code_id) continue
    __counter++
    //
    await delay(10000)
    //
    const instantid = element;
    const tokenAddress = await deploy
      .instantiate(wallets[signer], "terraswap_token",
        token_code_id, instantid,
        wallets[signer].key.accAddress,
        {
          "name": element + " private money",
          "symbol": element,
          "decimals": 6,
          "initial_balances": [
            {
              "amount": "1000000000000",
              "address": wallets[signer].key.accAddress
            }
          ]
        })
      .then()
      .catch((e) => {
        console.log('error: ', e);
      });

    if (!tokenAddress) continue

    console.log(__counter)
    console.log(`Saving ${element}:${tokenAddress}`)
    _whitelist.token[element] = tokenAddress;
    saveWhiteList(_whitelist, whitelistPath);
    //
  }

  console.log(__counter)

});

async function initialzeAssets(whithlistPath: string): Promise<void> {
  if (!(await fs.pathExists(whithlistPath)))
    saveWhiteList(WhiteList_template, whithlistPath)
}