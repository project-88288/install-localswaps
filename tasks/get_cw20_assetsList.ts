import { Env, task } from "@terra-money/terrain";
import { arrayTemplate, getJsonPath, loadJson, objectTemplate, storeJson } from "../lib/whitelist";

task(async (env: Env) => {
  //
  const networkname = process.env.network
  const configPath = process.env.configPath
  const signer = process.env.signer
  //
  if (!signer) return
  if (!configPath) return
  if (!networkname) return;
  //
  console.log(networkname,signer)
 // console.log(env.wallets[signer].key.accAddress)
  console.log(configPath)
  //
  const ringcw20assetjsonpath = getJsonPath('ringcw20Assets', configPath);
  const ringcw20assetArrayjsonpath = getJsonPath('ringcw20AssetArray', configPath);
  const ringcw20Asset = await loadJson(objectTemplate, ringcw20assetjsonpath);
  let ringcw20AssetArray = await loadJson(arrayTemplate, ringcw20assetArrayjsonpath);
  const assets = ringcw20Asset[networkname]
  const subObjectArray = convertObjectToArray(assets);
  ringcw20AssetArray[networkname] = subObjectArray
  await storeJson(ringcw20AssetArray,ringcw20assetArrayjsonpath)

  console.log(subObjectArray)

});

function convertObjectToArray(obj) {
  const subObjects = Object.values(obj); 
  return subObjects;
}

/*
// Example usage
const obj = {
  subObj1: { id: 1, name: 'John' },
  subObj2: { id: 2, name: 'Jane' },
  subObj3: { id: 3, name: 'Bob' }
};

const subObjectArray = convertObjectToArray(obj);
console.log(subObjectArray);
*/