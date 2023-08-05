
export interface pairs {
  pairs:pair[]
}

export interface pair  {
  asset_infos: Record<string,boolean>[]
  contract_addr: string
  liquidity_token: string
  asset_decimals: []
}

export interface token {
  token: {
    contract_addr: string
  }
}

export interface native_token {
  native_token: {
    denom: string
  }
}

export interface tokenlist {
  native_tokens:native_token[]
  tokens:token[]
}