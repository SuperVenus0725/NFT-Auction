# NFT Auction Contract 



An Auction Contract to Lock NFTs and bid on them using Coin


- Seller locks an nft for 50000 blocks till the auction is completed
- Now anyone can place bids
    -   The previous highest bidder is returned with his funds
    -   While returning funds, a solidity contract may be attacked with `reentrancy` but cosmwasm by design is `reentrancy` proof
- After 50000 blocks expired, listing can be withdrawn
    -   Max bidder can withdraw his funds
    -   If noone bids, the seller can withdraw this to get his NFT released.

Clone Repo

```
- cargo build
- cargo test
```

## Deployed Testnet Link

`wasm1mg7l9dxl3ma60vr46fm83xz4p2dwz5ktn96rgx`: [CosmWasm PebbleNet Testnet Contract](https://block-explorer.pebblenet.cosmwasm.com/transactions/65FFF041BB7F8795C311FBE0211A037A2EC59459601E48F7398B36970F06EE65)


### Static Analysis Tools used

- [x] cargo udeps
- [x] cargo-audit
- [x] cargo-deny
- [ ] Rudra
- [ ] Prusti
