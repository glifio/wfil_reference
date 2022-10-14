import { ethers } from "hardhat";
import { newSecp256k1Address } from "@glif/filecoin-address";
import RpcEngine from "@glif/filecoin-rpc-client";

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
