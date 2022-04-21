use cosmwasm_std::{StdError, OverflowError};
use thiserror::Error;

#[derive(Error, Debug, PartialEq)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("{0}")]
    OverflowError(#[from] OverflowError),

    #[error("Unauthorized")]
    Unauthorized {},

    #[error("Insufficient funds sent")]
    InsufficientFundsSend {},

    #[error("Auction Ended")]
    AuctionEnded {},

    #[error("Auction Not Ended Yet")]
    AuctionNotEnded {},

    #[error("unregistered minter")]
    UnregisteredMinter {},

    #[error("sum of royalty rates are larger than 1")]
    InvalidRoyaltyRate {},

    #[error("Token type or balance mismatch with price")]
    TokenMismatch {},

    #[error("Asset type mismatch")]
    AssetInfoMismatch {},

    #[error("nft is already on auction")]
    AlreadyOnAuction {}
}
