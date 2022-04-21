#[cfg(test)]
mod tests {
    use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
    use cosmwasm_std::{ Decimal, Uint128, CosmosMsg, WasmMsg, SubMsg, to_binary };

    use crate::contract::{execute, instantiate, query_minters, query_nft_info};
    use crate::msg::{ ExecuteMsg, InstantiateMsg, GFMintMsg };
    use crate::state::{ Royalty, Metadata };
    use crate::error::ContractError;
    use cw721_base::msg::{ ExecuteMsg as Cw721ExecuteMsg, MintMsg };


    #[test]
    fn mint() {
        let mut deps = mock_dependencies();

        // instantiate an empty contract
        let instantiate_msg = InstantiateMsg { };
        let info = mock_info(&String::from("creator"), &[]);
        let res = instantiate(deps.as_mut(), mock_env(), info, instantiate_msg).unwrap();
        assert_eq!(0, res.messages.len());

        let info = mock_info(&String::from("creator"), &[]);
        let msg = ExecuteMsg::SetNftAddress{ nft_address: String::from("nft_address")};
        execute(deps.as_mut(), mock_env(), info, msg).unwrap();

        // make a whitelist with unauthorized user
        let sender = String::from("sender");
        let minter = String::from("minter1");

        let info = mock_info(&sender, &vec![]);
        let msg = ExecuteMsg::UpdateMinter{minter};
        let err = execute(deps.as_mut(), mock_env(), info, msg).unwrap_err();
        assert_eq!(err, ContractError::Unauthorized{});

        // make a whitelist with authorized user
        let sender = String::from("creator");
        let minter = String::from("minter1");

        let info = mock_info(&sender, &vec![]);
        let msg = ExecuteMsg::UpdateMinter{minter};
        let _res = execute(deps.as_mut(), mock_env(), info.clone(), msg).unwrap();
        
        // check if the registration works properly
        let minters = query_minters(deps.as_ref(), mock_env()).unwrap();
        assert_eq!(minters, vec![String::from("minter1")]);

        let mint_msg = GFMintMsg { 
            owner: String::from("minter1"), 
            name: String::from("first_nft"), 
            image_uri: Some(String::from("https://glassflow")), 
            external_link: Some(String::from("https://external")), 
            description:  Some(String::from("first nft")), 
            collection: Some(Uint128::from(1 as u128)), 
            num_real_repr: Uint128::from(1 as u128), 
            num_nfts: Uint128::from(1 as u128), 
            royalties: vec![Royalty {
                address: String::from("minter1") ,
                royalty_rate: Decimal::from_atomics(3u64, 1).unwrap()
            }], 
            init_price: Uint128::from(100 as u128)  
        };
        let info = mock_info(&String::from("minter1"), &vec![]);

        let msg = ExecuteMsg::Mint(mint_msg);
        let res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();

        let mint_nft_msg = Cw721ExecuteMsg::Mint(MintMsg {
            token_id: String::from("GF.1"),
            owner: String::from("minter1"),
            token_uri: Some(String::from("https://glassflow")),
            extension: Metadata {
                name: String::from("first_nft"),
                description: Some(String::from("first nft")),
                external_link: Some(String::from("https://external")),
                collection: Some(Uint128::from(1 as u128)),
                num_real_repr: Uint128::from(1 as u128),
                num_nfts:Uint128::from(1 as u128),
                royalties: vec![Royalty {
                    address: String::from("minter1") ,
                    royalty_rate: Decimal::from_atomics(3u64, 1).unwrap()
                }], 
                init_price: Uint128::from(100 as u128),
            }
        });
        assert_eq!(1, res.messages.len());
        assert_eq!( 
            res.messages[0],
            SubMsg::new(CosmosMsg::Wasm(WasmMsg::Execute {
                contract_addr: String::from("nft_address"),
                msg: to_binary(&mint_nft_msg).unwrap(),
                funds: vec![]
            }))
        );

        // let nft_info = query_nft_info(deps.as_ref(), mock_env(), String::from("GF.1")).unwrap();
        // assert_eq!(
        //     nft_info,
        //     MintMsg {
        //         token_id: String::from("GF.1"),
        //         owner: String::from("minter1"),
        //         token_uri: Some(String::from("https://glassflow")),
        //         extension: Metadata {
        //             name: String::from("first_nft"),
        //             description: Some(String::from("first nft")),
        //             external_link: Some(String::from("https://external")),
        //             collection: Some(Uint128::from(1 as u128)),
        //             num_real_repr: Uint128::from(1 as u128),
        //             num_nfts:Uint128::from(1 as u128),
        //             royalties: vec![Royalty {
        //                 address: String::from("minter1") ,
        //                 royalty_rate: Decimal::from_atomics(3u64, 1).unwrap()
        //             }], 
        //             init_price: Uint128::from(100 as u128)  
        //         }
        //     }
        // );
    }


    // fn assert_config_state(deps: Deps, expected: Config) {
    //     let res = query(deps, mock_env(), QueryMsg::Config {}).unwrap();
    //     let value: Config = from_binary(&res).unwrap();
    //     assert_eq!(value, expected);
    // }

    // fn mock_init(deps: DepsMut) {
    //     let msg = InstantiateMsg {};

    //     let info = mock_info("creator", &coins(0, "utst"));
    //     let _res = instantiate(deps, mock_env(), info, msg)
    //         .expect("contract successfully handles InstantiateMsg");
    // }

    // fn mock_alice_place_listing(deps: DepsMut, sent: &[Coin]) {
    //     // alice can register an available name
    //     let info = mock_info("bob_key", sent);
    //     let msg = ExecuteMsg::PlaceListing {
    //         nft_contract_address: Addr::unchecked("contract").to_string(),
    //         id: "1".to_string(),
    //         minimum_bid: Some(coin(3, "utst")),
    //     };
    //     let _res = execute(deps, mock_env(), info, msg)
    //         .expect("contract successfully handles PlaceListing message");
    // }

    // fn mock_alice_place_bid(deps: DepsMut, sent: &[Coin]) {
    //     let info = mock_info("alice_key", sent);
    //     let msg = ExecuteMsg::BidListing {
    //         listing_id: "1".to_string(),
    //     };
    //     let _res = execute(deps, mock_env(), info, msg)
    //         .expect("contract successfully handles BidListing message");
    // }

    // fn mock_alice_withdraw_listing(deps: DepsMut, sent: &[Coin]) {
    //     let info = mock_info("alice_key", sent);
    //     let msg = ExecuteMsg::WithdrawListing {
    //         listing_id: "1".to_string(),
    //     };
    //     let mut env = mock_env();
    //     env.block.height = env.block.height + 70000;
    //     let _res = execute(deps, env, info, msg)
    //         .expect("contract successfully handles WithdrawListing message");
    // }

    // // instantiates the auction contract
    // #[test]
    // fn proper_init() {
    //     let mut deps = mock_dependencies(&[]);

    //     mock_init(deps.as_mut());

    //     assert_config_state(deps.as_ref(), Config { listing_count: 0 });
    // }

    // // Puts an NFT for Auction
    // #[test]
    // fn place_listing() {
    //     let mut deps = mock_dependencies(&[]);
    //     mock_init(deps.as_mut());
    //     mock_alice_place_listing(deps.as_mut(), &coins(0, "utst"));
    // }

    // // Puts an NFT for Auction
    // // Places a bid on that NFT
    // #[test]
    // fn place_bid() {
    //     let mut deps = mock_dependencies(&[]);
    //     mock_init(deps.as_mut());
    //     mock_alice_place_listing(deps.as_mut(), &coins(0, "utst"));
    //     mock_alice_place_bid(deps.as_mut(), &coins(4, "utst"));
    // }

    // // Test should fail since the bid placed is of a lesser amount
    // #[test]
    // fn fails_on_place_bid() {
    //     let mut deps = mock_dependencies(&[]);
    //     mock_init(deps.as_mut());
    //     mock_alice_place_listing(deps.as_mut(), &coins(0, "utst"));

    //     // less bid amount
    //     let info = mock_info("alice_key", &coins(3, "utst"));
    //     let msg = ExecuteMsg::BidListing {
    //         listing_id: "1".to_string(),
    //     };
    //     let _res = execute(deps.as_mut(), mock_env(), info, msg);
    //     match _res {
    //         Ok(_) => panic!("Must return error"),
    //         Err(_) => {}
    //     }
    // }

    // // Withdraws a listing and transfers the listing and token to the appropriate parties
    // #[test]
    // fn withdraw_listing() {
    //     let mut deps = mock_dependencies(&[]);
    //     mock_init(deps.as_mut());
    //     mock_alice_place_listing(deps.as_mut(), &coins(0, "utst"));
    //     mock_alice_place_bid(deps.as_mut(), &coins(4, "utst"));
    //     mock_alice_withdraw_listing(deps.as_mut(), &coins(0, "utst"))
    // }

    // // Test should fail since this simulates an environment of 40000 blocks from auction start while auction ends
    // #[test]
    // fn fails_on_withdraw_listing() {
    //     let mut deps = mock_dependencies(&[]);
    //     mock_init(deps.as_mut());
    //     mock_alice_place_listing(deps.as_mut(), &coins(0, "utst"));
    //     mock_alice_place_bid(deps.as_mut(), &coins(4, "utst"));
    //     // mock_alice_withdraw_listing(deps.as_mut(), &coins(0, "utst"))
    //     let info = mock_info("alice_key", &coins(0, "utst"));
    //     let msg = ExecuteMsg::WithdrawListing {
    //         listing_id: "1".to_string(),
    //     };
    //     let mut env = mock_env();

    //     // auction lasts for 50000 blocks so should fail for 40000
    //     env.block.height = env.block.height + 40000;
    //     let _res = execute(deps.as_mut(), env, info, msg);
    //     match _res {
    //         Ok(_) => panic!("Must return error"),
    //         Err(_) => {}
    //     }
    // }
}
