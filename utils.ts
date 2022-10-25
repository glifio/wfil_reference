import { CoinType, newDelegatedEthAddress } from "@glif/filecoin-address";
import RpcEngine from "@glif/filecoin-rpc-client";
import { SECP256K1KeyProvider } from "@glif/filecoin-wallet-provider";

const hexlify = (id: string) => {
  const hexId = Number(id.slice(1)).toString(16);
  return "0xff" + "0".repeat(38 - hexId.length) + hexId;
};

export const deriveAddrsFromPk = async (
  pk: string,
  apiAddress: string,
  ethAddr: string
) => {
  // dont pass 0x to the SECP key provider
  const provider = new SECP256K1KeyProvider(pk.slice(2), "hex");
  const [secpActor] = await provider.getAccounts(0, 1, CoinType.TEST);
  const delegatedActor = newDelegatedEthAddress(
    ethAddr,
    CoinType.TEST
  ).toString();

  let idActor = "";
  let idActorHex = "";
  try {
    const filRpc = new RpcEngine({ apiAddress });
    idActor = await filRpc.request("StateLookupID", delegatedActor, null);
    idActorHex = hexlify(idActor);
  } catch (err) {
    console.log(
      `Actor ${delegatedActor} does not yet exist on chain. Try sending it some funds first. Error: ${err}`
    );
  }

  return { secpActor, idActor, idActorHex, delegatedActor };
};
