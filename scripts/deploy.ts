import { ethers } from "hardhat";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider();
  const wallet = ethers.Wallet.fromMnemonic(
    "test test test test test test test test test test test junk"
  ).connect(provider);

  const wfil = await ethers.getContractFactory("WFIL", wallet);
  const contract = await wfil.deploy();
  console.log(contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
