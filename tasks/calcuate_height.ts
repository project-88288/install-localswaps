import { Env, task } from "@terra-money/terrain";
import { dateToNumber } from "../lib/utils";

task(async (env: Env) => {

  const block1 = await env.client.tendermint.blockInfo(1)
  const last_block = await env.client.tendermint.blockInfo()
  const last_block1 = await env.client.tendermint.blockInfo(Number.parseInt(last_block.block.header.height) - 1)
  const d1 = new Date(block1.block.header.time)
  const ld = new Date(last_block.block.header.time)
  const ld1 = new Date(last_block1.block.header.time)
  //
  console.log(d1.toDateString(), block1.block.header.height)
  console.log(ld.toDateString(), last_block.block.header.height)
  console.log(ld1.toDateString(), last_block1.block.header.height)
  //
  console.log(dateToNumber(ld) - dateToNumber(ld1), 'sec')
  //
  console.log('mydate')
  let mytime = new Date()
  mytime.setFullYear(2023)
  mytime.setMonth(2)
  mytime.setDate(2)
  mytime.setHours(20)
  console.log(mytime.toDateString())
  //
  const diff_height = ((dateToNumber(ld) - dateToNumber(mytime)) / 5)
  console.log('diff -', diff_height)
  const last_height = Number.parseInt(last_block.block.header.height)
  console.log('estimate height: ', last_height - diff_height)
  //
  const height = (last_height - diff_height).toString()
  const test_block = await env.client.tendermint.blockInfo(Number.parseInt(height))
  const tb = new Date(test_block.block.header.time)
  console.log(tb.toDateString(), test_block.block.header.height)
});