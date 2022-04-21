use cosmwasm_schema::{export_schema, remove_schemas, schema_for};
use std::env::current_dir;
use std::fs::create_dir_all;

use cw_auction::msg::{ExecuteMsg, InstantiateMsg, QueryMsg, ResolveListingResponse, GFMintMsg, Cw20HookMsg};
use cw_auction::asset::{Asset};
fn main() {
    let mut out_dir = current_dir().unwrap();
    out_dir.push("schema");
    create_dir_all(&out_dir).unwrap();
    remove_schemas(&out_dir).unwrap();

    export_schema(&schema_for!(InstantiateMsg), &out_dir);
    export_schema(&schema_for!(ExecuteMsg), &out_dir);
    export_schema(&schema_for!(QueryMsg), &out_dir);
    export_schema(&schema_for!(ResolveListingResponse), &out_dir);
    export_schema(&schema_for!(GFMintMsg), &out_dir);
    export_schema(&schema_for!(Cw20HookMsg), &out_dir);
    export_schema(&schema_for!(Asset), &out_dir);
}
