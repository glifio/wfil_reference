import { decode, ethAddressFromDelegated } from "@glif/filecoin-address";
import { ethers as Ethers } from "hardhat";
import { WFIL } from "../typechain-types";
import { toEthAddr } from "../utils";

declare var task: any;
declare var ethers: typeof Ethers;

interface TaskArgs {
  contract: string;
  actor: string;
}

task("balanceOf", "Gets the wfil balance of the address passed")
  .addParam("actor", "The address of the account to query")
  .addParam("contract", "The address of the WFIL contract")
  .setAction(async ({ contract: contractAddr, actor }: TaskArgs) => {
    try {
      const [signer] = await ethers.getSigners();
      const WFIL = await ethers.getContractFactory("WFIL");
      const contract = new ethers.Contract(
        toEthAddr(contractAddr),
        WFIL.interface,
        signer
      ) as WFIL;
      const bal = await contract.balanceOf(toEthAddr(actor));
      console.log(`Balance: ${ethers.utils.formatEther(bal)}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      console.error(`Failed to get balance: ${msg}`);
    }
  });
