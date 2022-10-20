import { HttpNetworkConfig } from "hardhat/types";
import { deriveAddrsFromPk } from "../utils";

declare var task: any;
declare var network: { config: HttpNetworkConfig };

task("get-addrs", "Derive addrs from private key in hardhat config").setAction(
  async () => {
    const { secpActor, idActor, idActorHex } = await deriveAddrsFromPk(
      (network.config.accounts as string[])[0],
      network.config.url
    );

    console.log({ secpActor, idActor, idActorHex });
    console.log(
      `Explorer link: https://explorer.glif.io/actor/?network=wallaby&address=${secpActor}`
    );
  }
);
