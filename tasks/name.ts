import { ethers as Ethers } from "hardhat";
import { WFIL } from "../typechain-types";

declare var task: any;
declare var ethers: typeof Ethers;

task("name", "Gets the name of the WFIL token")
  .addParam("contract", "The address of the WFIL contract")
  .setAction(async (taskArgs: { contract: string }) => {
    try {
      const [signer] = await ethers.getSigners();
      const WFIL = await ethers.getContractFactory("WFIL");
      const contract = new ethers.Contract(
        taskArgs.contract,
        WFIL.interface,
        signer
      ) as WFIL;

      const name = await contract.name();
      console.log("Name: ", name);
    } catch (err) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      console.error(`Error when fetching name from wfil contract: ${msg}`);
    }
  });
