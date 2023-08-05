#!/usr/bin/env node

require('dotenv').config();
const { BlobServiceClient } = require("@azure/storage-blob");
const glob = require("glob");
const fs = require("fs").promises;

const containerName = 'assets'
const storageAccountConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(storageAccountConnectionString);
// const containerClient = blobServiceClient.getContainerClient(containerName);

async function main() {
    await createContainer()
    glob(
        "./assets/**/*",
        {
            ignore: [
                "./node_modules/**/*",
                "./dist/**/*"
            ],
        },
        (_, files) => {
            console.log('Check to upload..')
            files.forEach(async (file) => {
                const fullPath = `./${file}`;
                if((await fs.lstat(fullPath)).isFile()) {
                    await uploadToStorageBlob(fullPath).catch((err) => console.error(err));
                    console.log(`${fullPath} is file`)
                }
                else {
                    console.log(`${fullPath} is not file`)
                }
            });
        }
    );
}

main();

async function createContainer() {
    // Create a container (folder) if it does not exist

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const containerExists = await containerClient.exists()
    if (!containerExists) {
        const createContainerResponse = await containerClient.createIfNotExists();
        console.log(`Create container ${containerName} successfully`, createContainerResponse.succeeded);
    }
    else {
        console.log(`Container ${containerName} already exists`);
    }

}

async function uploadToStorageBlob(filepath) {

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const data = await fs.readFile(filepath);
    const filename = filepath.replace('/assets', '')
    const blockBlobClient = containerClient.getBlockBlobClient(filename);
    await blockBlobClient.upload(data, data.length);
    console.log(`Successfully uploaded ${filename} to Azure Storage Blob!`);

}

/* 
az storage account show-connection-string --resource-group cloud-shell-storage-southeastasia  --query connectionString  --name opzlife
az storage account create  --resource-group cloud-shell-storage-southeastasia  --location Southeast Asia  --sku Standard_LRS --name opzlife
*/