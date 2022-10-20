# Wrapped FIL + Foundry/Hardhat FEVM template

This repo is meant to serve as an example of how to:

- Use Foundry to test your smart contracts at lightning speed
- GitHub action to run your test cases in a private network
- Use Hardhat to deploy your smart contracts and interact with it

## Set up

Make sure you have installed:

[Foundry](https://github.com/foundry-rs/foundry)<br />

```
git clone git@github.com:Schwartz10/wfil.git
cd wfil
npm i
```

## Testing your contracts with forge

`forge test`

## Deploy your contracts to Wallaby with hardhat

1. Import a private key into your `hardhat.config.ts` file
2. Run `npx hardhat get-addrs` to get your addresses. NOTE - if you see an `actor not found` error, this means that you need to visit the [Wallaby faucet](https://wallaby.network/#faucet) and bless yourself with some funds.
3. Deploy your contracts to wallaby via: `npm run deploy` (note, if you see an error about "please check your node synced status", it's likely the network has reset since you last deployed. Please delete the `deployments` directory and try again.)
4. After deploying, you'll get a message that your contract was deployed to an address that looks like: `0xFf0000000000000000000000000000000000048f`. This is the EVM representation of your contract's deployed address on Wallaby! For now, you'll have to use this address to interact with the Ethereum JSON RPC via wallaby.
5. Try out some scripts!:

npx hardhat name --contract <contract-address-hex>
npx hardhat deposit --contract <contract-address-hex> --amount <amount-in-eth>
npx hardhat balanceOf --contract <contract-address-hex> --actor <actor-id-hex>
