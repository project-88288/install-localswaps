import { Env, task } from "@terra-money/terrain";
import {  getPoolname,  isPoolExist, savePool, containPool} from "../lib/pool";
import {  generateTokenname, getTokensymbol } from "../lib/token"
import {  saveWhiteList,  loadWhiteList,  getwhitelistPath,   initialzeAssets } from "../lib/whitelist"
import { delay } from 'bluebird'
import { setLastBlock,getLastBlock } from "../lib/pool";
import { unary } from "lodash";

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
  const blockName = 'pair'
  //
  const lastBlock = await lcd.tendermint.blockInfo() // get last block
  const lastBlock_height = Number.parseInt(lastBlock.block.header.height)
  console.log('last block heigh', lastBlock_height)
  while (true) {
    let LAST_HEIGHT = getLastBlock(blockName, __whitelistPath)
    // console.log(lastBlock_height,'==',LAST_HEIGHT)
    if (LAST_HEIGHT === undefined) return
    LAST_HEIGHT++
    // to exit from here
    if (LAST_HEIGHT > lastBlock_height) break
    const x_whitelist = loadWhiteList(__whitelistPath)
    const txinfos = await lcd.tx.txInfosByHeight(LAST_HEIGHT)
    if (txinfos.length > 0) {
      txinfos.forEach(txinfo => {
        const logs = txinfo['logs']
        logs?.forEach(log => {
          log.events.map((log) => {
            if (log.type === 'wasm') {
              log.attributes.map(l => {
                if (l.key === 'pair_contract_addr') {
                  const pair_contract_addr = l.value
                  if (!!pair_contract_addr) {
                    getPoolname(pair_contract_addr, lcd).then(poolname => {
                      if (!!poolname) {
                        if (!!x_whitelist.pair[poolname] || 
                          !!x_whitelist.pair[`${poolname.split('-')[1]}-${poolname.split('-')[0]}`]) {
                          console.log(`${poolname} is exists`)
                        }
                        else {
                          console.log(`${poolname} is not exists`)
                         // x_whitelist.pair[poolname]= pair_contract_addr
                           // saveWhiteList(x_whitelist,__whitelistPath)
                        }
                      }
                    })
                      .catch((e) => {
                        console.log('error: ', e.message);
                      
                      });
                  }
                }
              })
            }
          })
        })
      })

    }

    setLastBlock(LAST_HEIGHT, blockName, __whitelistPath)
  }
});