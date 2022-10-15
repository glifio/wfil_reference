import { ethers as Ethers } from "hardhat";
import { WFIL } from "../typechain-types";

declare var task: any;
declare var ethers: typeof Ethers;

task("balanceOf", "Gets the wfil balance of the address passed")
  .addParam("actor", "The address of the account to query")
  .addParam("contract", "The address the WFIL contract")
  .setAction(async (taskArgs: { contract: string; actor: string }) => {
    try {
      const [signer] = await ethers.getSigners();
      const WFIL = await ethers.getContractFactory("WFIL");
      const contract = new ethers.Contract(
        taskArgs.contract,
        WFIL.interface,
        signer
      ) as WFIL;

      const bal = await contract.balanceOf(taskArgs.actor);
      console.log("balance: ", ethers.utils.formatEther(bal));
    } catch (err) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      console.error(`Error when fetching name from wfil contract: ${msg}`);
    }
  });
