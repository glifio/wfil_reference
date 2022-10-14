import { ethers as Ethers } from "hardhat";
import { WFIL } from "../typechain-types";

declare var task: any;
declare var ethers: typeof Ethers;

task("deposit", "Deposit FIL for wrapped FIL")
  .addParam("contract", "The address the WFIL contract")
  .addParam("amount", "The amount to deposit")
  .setAction(async (taskArgs: { contract: string }) => {
    try {
      const [signer] = await ethers.getSigners();
      const WFIL = await ethers.getContractFactory("WFIL");
      const contract = new ethers.Contract(
        taskArgs.contract,
        WFIL.interface,
        signer
      ) as WFIL;

      const deposit = await contract.deposit({ value: 1000000 });
      // console.log(deposit);
    } catch (err) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      console.error(`Error when fetching name from wfil contract: ${msg}`);
    }
  });
