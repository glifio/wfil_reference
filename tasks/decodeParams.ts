import { ethers as Ethers } from "hardhat";
import { WFILInterface } from "../typechain-types/src/WFIL";
import { decode } from '@ipld/dag-cbor';

declare var task: any;
declare var ethers: typeof Ethers;

interface TaskArgs {
  params: string
  return?: string
}

const cborToHex = (base64: string) => {
  const bufferRaw = Buffer.from(base64, 'base64')
  const bufferDecoded = Buffer.from(decode(bufferRaw))
  return `0x${bufferDecoded.toString('hex')}`
}

task("decodeParams", "Decode base64 parameters from Lotus messages")
  .addParam("params", "The base64 parameters of the transaction")
  .addOptionalParam("return", "The base64 return value of the transaction")
  .setAction(async ({ params, return: returnVal }: TaskArgs) => {
    try {
      const WFIL = await ethers.getContractFactory("WFIL");
      const iface = WFIL.interface as WFILInterface

      const data = cborToHex(params)
      const parsedTx = iface.parseTransaction({ data })

      console.log(`Input data: ${data}`)
      console.log('Parsed transaction:', parsedTx)

      if (returnVal) {
        const returnHex = cborToHex(returnVal)
        const result = iface.decodeFunctionResult(parsedTx.name as any, returnHex)

        console.log(`Return data: ${returnHex}`)
        console.log(`Decoded result: ${result}`)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      console.error(`Failed to decode params: ${msg}`);
    }
  });
