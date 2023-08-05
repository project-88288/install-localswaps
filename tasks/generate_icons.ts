import { Env, task } from "@terra-money/terrain";
import * as fs from 'fs-extra';
import { arrayTemplate, getJsonPath, getwhitelistPath, initialzeAssets, loadJson, loadWhiteList, objectTemplate, storeJson } from "../lib/whitelist";
import { delay } from 'bluebird'

task(async (env: Env) => {
  const networkname = process.env.network
  const configPath = process.env.configPath
  const signer = process.env.signer
  //
  if (!signer) return
  if (!configPath) return
  if (!networkname) return;
  //
  console.log(networkname, signer)
  console.log(configPath)
  //
  const srcPath = configPath.replace('config.terrain.json', 'assets/icons/LOGO.png')
  //
  const ringcw20Namejsonpath = getJsonPath('ringcw20Names', configPath)
  const ringcw20names = await loadJson(arrayTemplate, ringcw20Namejsonpath)
  //
  ringcw20names[networkname].forEach(element => {
    const desPath = srcPath.replace('LOGO.png', `${element}.png`)
    fs.copyFile(srcPath, desPath).then(e=>{
      console.log(`generated ${element}.png`)
    }).catch(e=>console.log(e))
    delay(1000)
  })
  
  const starcw20Namejsonpath = getJsonPath('starcw20Names', configPath)
  const starcw20names = await loadJson(arrayTemplate, starcw20Namejsonpath)
  //
  starcw20names[networkname].forEach(element => {
    const desPath = srcPath.replace('LOGO.png', `${element}.png`)
    fs.copyFile(srcPath, desPath).then(e=>{
      console.log(`generated ${element}.png`)
    }).catch(e=>console.log(e))
    delay(1000)
  })
  //
});