import RpcEngine from "@glif/filecoin-rpc-client";
import { newSecp256k1Address } from "@glif/filecoin-address";
import { ethers as Ethers } from "hardhat";
import { HttpNetworkConfig } from "hardhat/types";
import { FeeMarketEIP1559Transaction } from "@ethereumjs/tx";
import { WFIL } from "../typechain-types";

declare var task: any;
declare var ethers: typeof Ethers;
declare var network: { config: HttpNetworkConfig };

const hexlify = (id: string) => {
  const hexId = Number(id.slice(1)).toString(16);
  return "0xff" + "0".repeat(38 - hexId.length) + hexId;
};

export const deriveAddrsFromPk = async (pk: string, apiAddress: string) => {
  const w = new ethers.Wallet(pk);
  const pubKey = Uint8Array.from(Buffer.from(w.publicKey.slice(2), "hex"));
  const secpActor = newSecp256k1Address(pubKey).toString();
  const filRpc = new RpcEngine({ apiAddress });

  const idActor = await filRpc.request("StateLookupID", secpActor, null);
  const idActorHex = hexlify(idActor);

  return { secpActor, idActor, idActorHex };
};

task("deposit", "Deposit FIL for wrapped FIL")
  .addParam("contract", "The address the WFIL contract")
  .addParam("amount", "The amount to deposit")
  .setAction(async (taskArgs: { contract: string; amount: string }) => {
    try {
      const [signer] = await ethers.getSigners();
      const WFIL = await ethers.getContractFactory("WFIL");
      const contract = new ethers.Contract(
        taskArgs.contract,
        WFIL.interface,
        signer
      ) as WFIL;

      const { secpActor } = await deriveAddrsFromPk(
        (network.config.accounts as string[])[0],
        network.config.url
      );

      const ethRpc = new RpcEngine({
        apiAddress: network.config.url,
        namespace: "eth",
        delimeter: "_",
      });

      const data = contract.interface.encodeFunctionData("deposit");
      const filRpc = new RpcEngine({ apiAddress: network.config.url });
      const priorityFee = await ethRpc.request("maxPriorityFeePerGas");
      const nonce = await filRpc.request("MpoolGetNonce", secpActor);

      var txObject = {
        nonce,
        gasLimit: 1000000000, // BlockGasLimit / 10
        to: taskArgs.contract,
        value: ethers.BigNumber.from(
          ethers.utils.parseUnits(taskArgs.amount, "ether")
        ).toHexString(),
        maxPriorityFeePerGas: priorityFee,
        maxFeePerGas: "0x2E90EDD000",
        chainId: ethers.BigNumber.from(network.config.chainId).toHexString(),
        data,
        type: 2,
      };

      const tx = FeeMarketEIP1559Transaction.fromTxData(txObject);
      const pk = (network.config.accounts as string[])[0].slice(2);
      const sig = tx.sign(Buffer.from(pk, "hex"));

      const serializedTx = sig.serialize();
      const rawTxHex = "0x" + serializedTx.toString("hex");

      const res = await ethRpc.request("sendRawTransaction", rawTxHex);
      console.log(res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      console.error(`Error when fetching name from wfil contract: ${msg}`);
    }
  });
