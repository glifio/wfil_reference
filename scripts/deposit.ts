import RpcEngine from "@glif/filecoin-rpc-client";
import fa from "@glif/filecoin-address";
import hre, { ethers } from "hardhat";
import { HttpNetworkConfig } from "hardhat/types";

const ETH_ACTOR_ID = "f01157";

const hexlify = (id: string) => {
  const hexId = Number(id.slice(1)).toString(16);
  return "0xff" + "0".repeat(38 - hexId.length) + hexId;
};

async function main() {
  try {
    const contractHex = hexlify(ETH_ACTOR_ID);

    const config = hre.network.config as HttpNetworkConfig;
    // generate the f1 address equivalent from the same private key
    // note this method of extracting private key from hre might be unsafe...
    const w = new ethers.Wallet((config.accounts as string[])[0]);
    const pubKey = Uint8Array.from(Buffer.from(w.publicKey.slice(2), "hex"));
    const fromAddr = fa.newSecp256k1Address(pubKey).toString();

    const filRpc = new RpcEngine({ apiAddress: config.url });
    const ethRpc = new RpcEngine({
      apiAddress: config.url,
      namespace: "eth",
      delimeter: "_",
    });

    const fromAddrID = await filRpc.request("StateLookupID", fromAddr, null);
    const fromAddrHex = hexlify(fromAddrID);

    console.log("Contract addr: ", contractHex);
    console.log("From addr: ", fromAddrHex);
    const wfil = await hre.ethers.getContractFactory("WFIL");
    const data = wfil.interface.encodeFunctionData("name");
    console.log({
      to: contractHex,
      data,
    });
    const read = await ethRpc.request(
      "call",
      {
        to: contractHex,
        data,
      },
      "latest"
    );
    console.log("name: ", read);
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
