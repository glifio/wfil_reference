import { ethers as Ethers } from "hardhat";
import { WFILInterface } from "../typechain-types/src/WFIL";

declare var task: any;
declare var ethers: typeof Ethers;

interface TaskArgs {
  params: string
  return?: string
}

task("decodeParams", "Decode base64 parameters from Lotus messages")
  .addParam("params", "The base64 parameters of the transaction")
  .addOptionalParam("return", "The base64 return value of the transaction")
  .setAction(async ({ params, return: returnVal }: TaskArgs) => {
    try {
      const WFIL = await ethers.getContractFactory("WFIL");
      const iface = WFIL.interface as WFILInterface

      const paramsBuffer = Buffer.from(params, 'base64').subarray(2)
      const paramsHex = `0x${paramsBuffer.toString('hex')}`
      const parsedTx = iface.parseTransaction({ data: paramsHex })

      console.log(`Input data: ${paramsHex}`)
      console.log('Parsed transaction:', parsedTx)

      if (returnVal) {
        const returnBuffer = Buffer.from(returnVal, 'base64').subarray(2)
        const returnHex = `0x${returnBuffer.toString('hex')}`
        const result = iface.decodeFunctionResult(parsedTx.name as any, returnHex)

        console.log(`Return data: ${returnHex}`)
        console.log(`Decoded result: ${result}`)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      console.error(`Failed to decode params: ${msg}`);
    }
  });
