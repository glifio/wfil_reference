import { ethers as Ethers } from "hardhat";
import { HttpNetworkConfig } from "hardhat/types";
import { deriveAddrsFromPk } from "../utils";

declare var task: any;
declare var ethers: typeof Ethers;
declare var network: { config: HttpNetworkConfig };

task("get-addrs", "Derive addrs from private key in hardhat config").setAction(
  async () => {
    const [wallet] = await ethers.getSigners();
    const { secpActor, idActor, idActorHex, delegatedActor } =
      await deriveAddrsFromPk(
        (network.config.accounts as string[])[0],
        network.config.url,
        wallet.address
      );

    console.log({
      secpActor,
      idActor,
      idActorHex,
      delegatedActor,
      ethAddr: wallet.address,
    });
    console.log(
      `Explorer link: https://explorer.glif.io/actor/?network=wallaby&address=${delegatedActor}`
    );
  }
);
