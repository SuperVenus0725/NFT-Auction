const { calculateFee, GasPrice } = require("@cosmjs/stargate");
const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");
const { SigningCosmWasmClient, CosmWasmClient } = require("@cosmjs/cosmwasm-stargate");
const _ = require("fs");

const rpcEndpoint = "https://rpc.cliffnet.cosmwasm.com:443";

// Example user from scripts/wasmd/README.md
const contract_owner = {
    mnemonic: "rare race capable trend seven pilot silent couple battle zone camera clarify laundry fix ship citizen good crater ribbon cloud journey paddle bulk much",
    address: "wasm1mgl5svtz8sy3s6aavx9589txu789djd0ewsqdl",
};

const minter = {
    mnemonic: "target below announce scorpion six broccoli viable tail dance leave cradle young rescue brick merry mean duty because clog hat shop hub that enter",
    address: "wasm1km7eq7csp9my73994c5c8m5hec4wkl9mnsyf0q",
};

const nft_owner = {
    mnemonic: "oblige apple beef tomato husband bacon nothing monster tell phone able grunt purchase manage exotic scrap fish plunge zone rose device dove bid bar",
    address: "wasm12z2lfyv4297tzs0ck3taswfesx86x78rypm30l",
};

const anyone = {
    mnemonic: "width divide aspect upper service cake cave ahead base panic special dance page abstract talent swallow husband huge gold bridge brief area plug coil",
    address: "wasm1arceqe2pct82n8ujn2dltasmjkxfunpjv5h37p",
};

function objectToBase64(input) {
    const stringified = JSON.stringify(input)
    return Buffer.from(stringified).toString('base64')
}

async function main() {
    // const escrowWasmPath =  "./cw_escrow.wasm";
    const gasPrice = GasPrice.fromString("0.05upebble");

    // Upload contract
    const sender_wallet = await DirectSecp256k1HdWallet.fromMnemonic(sender.mnemonic, { prefix: "wasm" });
    const sender_client = await SigningCosmWasmClient.connectWithSigner(rpcEndpoint, sender_wallet);
    const wasm = _.readFileSync(escrowWasmPath);
    const uploadFee = calculateFee(2_000_000, gasPrice);
    const uploadReceipt = await sender_client.upload(sender.address, wasm, uploadFee, "Upload hackatom contract");
    console.log("Upload succeeded. Receipt:", uploadReceipt);

    // Instantiate
    const instantiateFee = calculateFee(500_000, gasPrice);
	const msg = {} ;
    const { contractAddress } = await sender_client.instantiate(
        sender.address,
        uploadReceipt.codeId,
        msg,
        "My instance",
        instantiateFee,
        { memo: `Create a hackatom instance` },
    );
    console.info(`Contract instantiated at: `, contractAddress);

    // const contractAddress = "wasm16g5nklyw9ztcmkpnx0qxara0md6xqdkv7ck2cm339fwcanv87fcq7t27td";
    // Create escrow contract
    const executeFee = calculateFee(300_000, gasPrice);
    const escrow_id = "random";
    const create_result = await sender_client.execute(
        sender.address, 
        contractAddress,  
        {
            create: {
                arbiter: arbiter.address, 
                recipient: recipient.address, 
                id: escrow_id,
            }
        }, 
        executeFee,
        "",
        [{denom: "upebble", amount: "10000"}]
    );

    console.info("escrow create execution result: ", create_result);

    // Approve
    const arbiter_wallet = await DirectSecp256k1HdWallet.fromMnemonic(arbiter.mnemonic, { prefix: "wasm" });
    const arbiter_client = await SigningCosmWasmClient.connectWithSigner(rpcEndpoint, arbiter_wallet);
    const approve_result = await arbiter_client.execute(
        arbiter.address, 
        contractAddress,  
        {
            approve: {
                id: escrow_id,
            }
        }, 
        executeFee,
    );
    console.info("escrow approve result: ", approve_result);

    // escrow with cw20
    const escrow_id1 = "random1";
    const create_msg = {            
        create: {
            arbiter: arbiter.address, 
            recipient: recipient.address, 
            id: escrow_id1,
        }
    };
    const create_result1 = await sender_client.execute(
        sender.address,  // token address
        contractAddress,  
        {
            receive: {
                amount: "10_000_000", 
                msg: Buffer.from(create_msg, 'base64'),
                sender: sender.address,
            }
        }, 
        executeFee,
    );

    console.info("escrow create execution result: ", create_result1);

	// query
	const client = await CosmWasmClient.connect(rpcEndpoint);
	const query_result = await client.queryContractSmart(contractAddress, {details:{id: "random"}});
	console.info("query result", query_result);
}

const uploadContract = async (wasmPath) => {
    const gasPrice = GasPrice.fromString("0.05upebble");

    // Upload contract
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(contract_owner.mnemonic, { prefix: "wasm" });
    const client = await SigningCosmWasmClient.connectWithSigner(rpcEndpoint, wallet);
    const wasm = _.readFileSync(wasmPath);
    const uploadFee = calculateFee(2_500_000, gasPrice);
    const uploadReceipt = await client.upload(contract_owner.address, wasm, uploadFee, "Upload hackatom contract");
    console.log("Upload succeeded. Receipt:", uploadReceipt);

    return uploadReceipt.codeId;
}

const auction_instantiate = async (codeId, msg) => {
    // Upload contract
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(contract_owner.mnemonic, { prefix: "wasm" });
    const client = await SigningCosmWasmClient.connectWithSigner(rpcEndpoint, wallet);
    const gasPrice = GasPrice.fromString("0.05upebble");
    const instantiateFee = calculateFee(500_000, gasPrice);
    const { contractAddress } = await client.instantiate(
        contract_owner.address,
        codeId,
        msg,
        "My instance",
        instantiateFee,
        { memo: `Create a hackatom instance` },
    );
    console.info(`Contract instantiated at: `, contractAddress);
    return contractAddress;
};

const create_collection = async (codeId, msg) => {
    // Upload contract
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(minter.mnemonic, { prefix: "wasm" });
    const client = await SigningCosmWasmClient.connectWithSigner(rpcEndpoint, wallet);
    const gasPrice = GasPrice.fromString("0.05upebble");
    const instantiateFee = calculateFee(500_000, gasPrice);
    const { contractAddress } = await client.instantiate(
        minter.address,
        codeId,
        msg,
        "My instance",
        instantiateFee,
        { memo: `Create a hackatom instance` },
    );
    console.info(`Contract instantiated at: `, contractAddress);
    return contractAddress;
};

const auction_deploy = async () => {
    const codeId = await uploadContract( "./cw_auction.wasm");
    const contractAddress = await auction_instantiate( codeId, {});
    return contractAddress;
}

const updateMinters = async (contractAddress) => {
    const gasPrice = GasPrice.fromString("0.05upebble");

    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(contract_owner.mnemonic, { prefix: "wasm" });
    const client = await SigningCosmWasmClient.connectWithSigner(rpcEndpoint, wallet);

    const executeFee = calculateFee(300_000, gasPrice);
    const escrow_id = "random";
    const create_result = await client.execute(
        contract_owner.address, 
        contractAddress,
        {
            update_minter: {
                minter: minter.address, 
            }
        }, 
        executeFee,
        "",
        [{denom: "upebble", amount: "10000"}]
    );
    console.log("res: ", create_result);
}

const mint = async (contractAddress, nft_addr) => {
    const gasPrice = GasPrice.fromString("0.05upebble");

    const sender_wallet = await DirectSecp256k1HdWallet.fromMnemonic(minter.mnemonic, { prefix: "wasm" });
    const sender_client = await SigningCosmWasmClient.connectWithSigner(rpcEndpoint, sender_wallet);

    const executeFee = calculateFee(300_000, gasPrice);
    const create_result = await sender_client.execute(
        minter.address, 
        contractAddress,  
        {
            mint: {
                "nft_addr": nft_addr,
                "description": "glassflow nfts",
                "external_link": "https://external",
                "image_uri": "https://image/image.png",
                "init_price": "10000",
                "name": "mynft1",  
                "num_nfts": "1",
                "num_real_repr": "1", 
                "royalties": [
                    {
                        "address": nft_owner.address,
                        "royalty_rate": "0.1"
                    },
                    {
                        "address": minter.address,
                        "royalty_rate": "0.2"
                    }
                ]
            }
        }, 
        executeFee,
        "",
        [] 
    );
}


const queryMinters = async (contractAddress) => {
    const client = await CosmWasmClient.connect(rpcEndpoint);
	const query_result = await client.queryContractSmart(contractAddress, {"query_minter": {}} );
	console.info("query result", query_result);
}

const queryNFTInfo = async (contractAddress, nft_addr) => {
    console.log("query nft info");
    const client = await CosmWasmClient.connect(rpcEndpoint);
	const query_result = await client.queryContractSmart(
        contractAddress, 
        {
            "query_nft_info": {
                "token_id": "GF.6",
                "nft_addr": nft_addr
            }
        } );
	console.info("query result", query_result);
}

const queryNFTIds = async (contractAddress, cw721_address) => {
    const client = await CosmWasmClient.connect(rpcEndpoint);
	const query_result = await client.queryContractSmart(
        contractAddress, 
        {
            "all_tokens": {
                "nft_addr": cw721_address
             }
        } );
	console.info("query result", query_result);
}

// const contractAddress = "wasm1sxywggndhctyh6y78tkx6pzehfv85hvgf02n5z5y38skwcats8zqcs9qtq";

const placeListing = async (contract_address, cw721_address) => {
    const gasPrice = GasPrice.fromString("0.05upebble");

    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(minter.mnemonic, { prefix: "wasm" });
    const client = await SigningCosmWasmClient.connectWithSigner(rpcEndpoint, wallet);

    const executeFee = calculateFee(400_000, gasPrice);

    const change_ownership_res = await client.execute(
        minter.address,
        cw721_address,
        {
            approve: {
                spender: contract_address,
                token_id: "GF.1",
            }
        },
        executeFee,
        "",
        []
    )

    const create_result = await client.execute(
        minter.address, 
        contract_address,  
        {
            place_listing: {
                id: "GF.1",  //nft address
                minimum_bid: {
                    amount: "12000",
                    info: {
                        // token: {
                        //     contract_addr: "terraxxx"
                        // },
                        native_token: {
                            denom: "upebble"
                        }
                    },
                },
                nft_addr: cw721_address
            }
        },
        executeFee,
        "",
        []
    );
    console.log("res: ", create_result);
}

const bidListing = async (contract_address) => {
    const gasPrice = GasPrice.fromString("0.05upebble");

    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(anyone.mnemonic, { prefix: "wasm" });
    const client = await SigningCosmWasmClient.connectWithSigner(rpcEndpoint, wallet);

    const executeFee = calculateFee(400_000, gasPrice);
    const create_result = await client.execute(
        anyone.address, 
        contract_address,  
        {
            bid_listing: {
                listing_id: "AUCTION.1",  //nft address
                bid_price: {
                    amount: "20000",
                    info: {
                        // token: {
                        //     contract_addr: "terraxxx"
                        // },
                        native_token: {
                            denom: "upebble"
                        }
                    },                   
                },
            }
        },
        executeFee,
        "",
        [{denom: "upebble", amount: "20000"}]
    );
    console.log("res: ", create_result);
}

const withdrawListing = async (contract_address) => {
    const gasPrice = GasPrice.fromString("0.05upebble");

    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(minter.mnemonic, { prefix: "wasm" });
    const client = await SigningCosmWasmClient.connectWithSigner(rpcEndpoint, wallet);

    const executeFee = calculateFee(400_000, gasPrice);
    const create_result = await client.execute(
        minter.address, 
        contract_address,  
        {
            withdraw_listing: {
                listing_id: "AUCTION.1",  //nft address
            }
        },
        executeFee,
        "",
        []
    );
    console.log("res: ", create_result);
}

const queryAuctionIds = async (contractAddress) => {
    const client = await CosmWasmClient.connect(rpcEndpoint);
	const query_result = await client.queryContractSmart(
        contractAddress, 
        {
            "all_auction_ids": { }
        } );
	console.info("query result", query_result);
}

const test = async () => {
    contractAddress = "wasm1dy8rzv9fvaehucjt0yzgs44tgpju5pc3fppd22k80pvnum4td98qel0ah7";
    nft_codeId = 301
    // nft_address = "wasm1u5wgj5jgp73rmlre5lq774h7lc0uv74hhxm32je0uzgd5hkrdrrsev88fg";
    /*------------------- deploy auction contract and register minters. only the contract owner can do this ---------*/
    // const contractAddress = await auction_deploy();
    // const nft_codeId = await uploadContract( "./cw721_base.wasm");

    await updateMinters(contractAddress);   

    await queryMinters(contractAddress);

    /*------------- create a collection ------------*/
    const nft_address = await create_collection(nft_codeId,        
         { 
        "name": "glassflow_nft",  
        "symbol": "GF", 
        "minter": contractAddress,
        "collection_name": "collection_1"
    });

    /*--------------  minting NFTs ----------------*/

    await mint(contractAddress, nft_address); 
    await queryNFTIds(contractAddress, nft_address);
    await queryNFTInfo(contractAddress, nft_address);

    /*-------------- auction ----------------*/
    await placeListing(contractAddress, nft_address);
    await queryNFTInfo(contractAddress, nft_address);  // check if is_listing is true after auction starts

    await queryAuctionIds(contractAddress);
    await bidListing(contractAddress);

    await withdrawListing(contractAddress);
    await queryNFTInfo(contractAddress, nft_address);  // check if is_listing is false after auction ends


    const nft_address_2 = await create_collection(nft_codeId,        
        { 
       "name": "glassflow_nft",  
       "symbol": "GF", 
       "minter": contractAddress,
       "collection_name": "collection_2"
   });

   
   await mint(contractAddress, nft_address_2); 
   await queryNFTIds(contractAddress, nft_address_2);
   await queryNFTInfo(contractAddress, nft_address_2);
}

test();