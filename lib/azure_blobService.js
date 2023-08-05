#!/usr/bin/env node

require('dotenv').config();
const { BlobServiceClient } = require("@azure/storage-blob");
const fs = require("fs").promises;
const path = require('path');
const { parentPort } = require('worker_threads');

const storageAccountConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(storageAccountConnectionString);

async function uploadToStorageBlob(containerName, folder, filepath) {
    const PATH = calculatefilePath(folder, filepath)
    await createContainer(containerName)
    await createFolderIfNotExists(PATH.localFolder)
    //
    if ((await fs.lstat(PATH.localPath)).isFile()) {
        console.log(`${PATH.localPath} is file`)
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const data = await fs.readFile(PATH.localPath);
        const blockBlobClient = containerClient.getBlockBlobClient(PATH.containerPath);
        await blockBlobClient.upload(data, data.length);
        console.log(`Successfully uploaded ${PATH.localPath} to Azure Storage Blob!`);
    }
    else {
        console.log(`${PATH.localPath} is not file`)
    }
}

async function downloadBlobToLocal(containerName, folder, filepath) {
    const PATH = calculatefilePath(folder, filepath)
    await createContainer(containerName)
    await createFolderIfNotExists(PATH.localFolder)
    //
    if ((await checkFileExists(containerName, PATH.containerPath))) {
        console.log(`Bolb " ${PATH.calculatefilePath}" is exists`);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(PATH.containerPath);
        const response = await blockBlobClient.downloadToFile(PATH.localPath);
        console.log(`Blob "${PATH.containerPath}" downloaded successfully to "${PATH.localPath}".`);
    }
    else {
        console.log(`Bolb "${PATH.containerPath}" is not exists`);
    }
}

async function checkFileExists(containerName, containerfilename) {
    // Check if the blob exists
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlobClient(containerfilename);
    const exists = await blockBlobClient.exists();
    return exists;
}

async function createContainer(containerName) {
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

async function createFolderIfNotExists(localFolder) {

    if(!localFolder || localFolder=='.' || localFolder =='') {
        console.log(`${localFolder} is not creates`)
        return
    }
    await fs.mkdir(localFolder).then(e => { console.log(`${localFolder} was created`) }).catch(e => {
        console.log(`${localFolder} is exists`)
       // console.log(`${e}`)
    })
}

function calculatefilePath(folder, filePath) {
    const containerfilename = path.basename(filePath);
    const parentPath = path.dirname(filePath);

    return {
        containerPath: containerfilename,
        localFolder: path.join(parentPath, `${folder}`),
        localPath: path.join(parentPath, `${folder}`, containerfilename)
    };
}

module.exports = {
    uploadToStorageBlob,
    downloadBlobToLocal
}