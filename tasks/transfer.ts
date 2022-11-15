import RpcEngine from "@glif/filecoin-rpc-client";
import { ethers as Ethers } from "hardhat";
import { HttpNetworkConfig } from "hardhat/types";
import { FeeMarketEIP1559Transaction } from "@ethereumjs/tx";
import { WFIL } from "../typechain-types";
import { deriveAddrsFromPk, toEthAddr } from "../utils";

declare var task: any;
declare var ethers: typeof Ethers;
declare var network: { config: HttpNetworkConfig };

interface TaskArgs {
  contract: string;
  amount: string;
  to: string;
}

task("transfer", "Transfer wrapped FIL to another account")
  .addParam("contract", "The address of the WFIL contract")
  .addParam("amount", "The amount to transfer")
  .addParam("to", "The address of the account to transfer to")
  .setAction(async ({ contract: contractAddr, amount, to }: TaskArgs) => {
    try {
      const [signer] = await ethers.getSigners();
      const WFIL = await ethers.getContractFactory("WFIL");
      const contract = new ethers.Contract(
        toEthAddr(contractAddr),
        WFIL.interface,
        signer
      ) as WFIL;

      const { delegatedActor } = await deriveAddrsFromPk(
        (network.config.accounts as string[])[0],
        network.config.url,
        signer.address
      );

      const ethRpc = new RpcEngine({
        apiAddress: network.config.url,
        namespace: "eth",
        delimeter: "_",
      });

      const amountBigNr = ethers.utils.parseUnits(amount, "ether");
      const data = contract.interface.encodeFunctionData("transfer", [
        toEthAddr(to),
        amountBigNr,
      ]);
      const filRpc = new RpcEngine({ apiAddress: network.config.url });
      const priorityFee = await ethRpc.request("maxPriorityFeePerGas");
      const nonce = await filRpc.request("MpoolGetNonce", delegatedActor);

      const txObject = {
        nonce,
        gasLimit: 1000000000, // BlockGasLimit / 10
        to: toEthAddr(contractAddr),
        value: "0x00",
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
      console.log(`Explorer link: https://explorer.glif.io/wallaby/tx/${res}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      console.error(`Failed to transfer: ${msg}`);
    }
  });
