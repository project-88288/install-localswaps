import { task }  from "@terra-money/terrain"
import { delay } from 'bluebird'
//
console.log(" deploy terraswap_router")
//
task(async ({ wallets, deploy, refs }) => {
    const networkname = process.env.network
    if (!networkname) return;
    const signer = process.env.signer
    if (!signer) return

    const whitelistPath = process.env.configPath?.replace('config.terrain.json', `assets/${networkname}_whiteLists.json`)
    if (!whitelistPath) return

    console.log(process.env.refsPath)
    console.log(process.env.configPath)
    console.log(process.env.keysPath)
    console.log(process.env.network)
    console.log(process.env.signer)
    // console.log(refs)

    // map code storage
    // const pair_code_id = Number.parseInt(refs.terraswap_pair.codeId)
    // const token_code_id = Number.parseInt(refs.terraswap_token.codeId)
    // const factory_codeId = Number.parseInt(refs.terraswap_factory.codeId)
    const router_codeId = Number.parseInt(refs.terraswap_router.codeId)
    //
    let instants: string[] = []
    for (let index = 0; index < 10; index++) {
        let value = 'contract' + index.toString()
        if (index == 0) value = "default";
        instants.push(value);
    }
    // const networkname = wallets.
    console.log(instants)
    //
    /*
    for (let index = 0; index < instants.length; index++) {
        let instantid = instants[index];
        if (!instantid) continue;
        if(!!refs.terraswap_factory.contractAddresses[instantid]) continue;

        if (!token_code_id || !pair_code_id || !factory_codeId) continue
        //
        await delay(10000)
        const factoryAddress = await deploy
            .instantiate(wallets.test, "terraswap_factory",
                factory_codeId, instantid,
                wallets.test1.key.accAddress,
                {
                    pair_code_id: pair_code_id, //50,
                    token_code_id: token_code_id,// 49,
                })
            .then()
            .catch((e) => console.log('error: ', e.message));

        if(!factoryAddress) continue;

        console.log(
            `${instantid} terraswap_factory'-Address: ${factoryAddress}, terraswap_factory-codeid: ${factory_codeId}`
        )
    }
    */
    //

    for (let index = 0; index < instants.length; index++) {
        let instantid = instants[index];
        if (!instantid) continue;
        if (!!refs.terraswap_router.contractAddresses[instantid]) continue;
        //
        if (!router_codeId) continue;
        //
        const factoryAddress:string = refs.terraswap_factory.contractAddresses[instantid]
        if (!factoryAddress) continue
        //
        console.log(`instant: ${instantid}, router for factoryAddress:  ${factoryAddress}`)
        //
        await delay(5000)
        //
        const routerAddress = await deploy
            .instantiate(wallets[signer], "terraswap_router",
                router_codeId, instantid,
                wallets[signer].key.accAddress,
                {
                    terraswap_factory : factoryAddress, //50,
                })
            .then()
            .catch((e) => console.log('error: ', e.message));

        if (!routerAddress) continue;
        console.log(
            `${instantid} contract-address: ${routerAddress}, contract-codeId: ${router_codeId}`
        )
    }
});















//dedploy_factory - to get codeId and contract address


