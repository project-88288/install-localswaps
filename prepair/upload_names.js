#!/usr/bin/env node

const { uploadToStorageBlob } = require("../lib/azure_blobService")
const path = require("path")

const containerName = 'names'

async function main() {

    const files = [
        "aa/tokenList.json",
        "aa/pairList.json",
        "aa/demandpairsList.json",
        "starpairNames.js",
        "ringPairNames.js",
        "ringcw20Names.js",
        "starcw20Names.js"
    ]
    
    for (let index = 0; index < files.length; index++) {
        const element = path.basename(files[index])
        console.log(element)
        await uploadToStorageBlob(containerName,'assets/json',element)
    }
}

main();