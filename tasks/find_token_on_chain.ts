import { Env, task } from "@terra-money/terrain";
import {  getPoolname,  isPoolExist, savePool, containPool,getLastBlock,setLastBlock } from "../lib/pool";
import {  generateTokenname, getTokensymbol } from "../lib/token"
import {  saveWhiteList,  loadWhiteList,  getwhitelistPath,   initialzeAssets } from "../lib/whitelist"
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
  const blockName = 'token'
  //
  const lastBlock = await lcd.tendermint.blockInfo() // get last block
  const lastBlock_height = Number.parseInt(lastBlock.block.header.height)
  console.log('last block heigh', lastBlock_height)
  while (true) {
    let LAST_HEIGHT = getLastBlock(blockName, __whitelistPath)
    // console.log(lastBlock_height, '==', LAST_HEIGHT)
    if (LAST_HEIGHT === undefined) return
    LAST_HEIGHT++
    if (LAST_HEIGHT % 100 === 0) console.log(`collected: ${LAST_HEIGHT} / latest height: ${lastBlock_height}`)
    // to exist loop here..
    if (LAST_HEIGHT > lastBlock_height) break
    const txinfos = await lcd.tx.txInfosByHeight(LAST_HEIGHT)
    // console.log(LAST_HEIGHT)
    if (txinfos.length > 0) {
      txinfos.forEach(txinfo => {
        const logs = txinfo['logs']
        logs?.forEach(log => {
          log.events.forEach(event => {
            if (event.type === 'instantiate') {
              event.attributes.forEach(item => {
                if (item.key === '_contract_address') {
                  const token = item.value
                  getTokensymbol(token, lcd).then(symbol => {
                    const x_whitelist = loadWhiteList(__whitelistPath)
                    if (!!x_whitelist.token[symbol]) {
                      console.log(`${symbol} is exists`)
                    }
                    else {
                      console.log(`${symbol} is not exists`)
                     // x_whitelist.token[symbol]=token
                        // saveWhiteList(x_whitelist,__whitelistPath)
                    }
                  })
                    .catch((e) => {
                      console.log('error: ', e.message);
                    });

                }
              })

            }
          })

        })
      })
    }

    setLastBlock(LAST_HEIGHT, blockName, __whitelistPath)
  }
  //
});