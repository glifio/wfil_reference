import hre, { ethers } from "hardhat";
import { WFIL } from "../typechain-types";

const ETH_ACTOR_ID = "f01157";

const hexlify = (id: string) => {
  const hexId = Number(id.slice(1)).toString(16);
  return "0xff" + "0".repeat(38 - hexId.length) + hexId;
};

async function main() {
  try {
    const contractHexAddr = hexlify(ETH_ACTOR_ID);

    const [signer] = await hre.ethers.getSigners();
    const WFIL = await hre.ethers.getContractFactory("WFIL");
    const contract = new ethers.Contract(
      contractHexAddr,
      WFIL.interface,
      signer
    ) as WFIL;

    const bal = await contract.balanceOf(
      "0xff000000000000000000000000000000000004a4"
    );

    console.log("Bal: ", bal);
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error(`Error when fetching name from wfil contract: ${msg}`);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
