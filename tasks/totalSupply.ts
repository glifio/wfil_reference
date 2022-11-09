import { ethers as Ethers } from "hardhat";
import { WFIL } from "../typechain-types";

declare var task: any;
declare var ethers: typeof Ethers;

interface TaskArgs {
  contract: string
}

task("totalSupply", "Gets the total wfil supply in the contract")
  .addParam("contract", "The address the WFIL contract")
  .setAction(async ({ contract: contractAddr }: TaskArgs) => {
    try {
      const [signer] = await ethers.getSigners();
      const WFIL = await ethers.getContractFactory("WFIL");
      const contract = new ethers.Contract(
        contractAddr,
        WFIL.interface,
        signer
      ) as WFIL;

      const bal = await contract.totalSupply();
      console.log(`Total wfil supply: ${ethers.utils.formatEther(bal)}`);
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      console.error(`Failed to get total wfil supply: ${msg}`);
    }
  });
