
  export interface MsgSend        {
    type: string 
    value: {
      from_address: string
      to_address: string
      amount: [
        {
          denom: string
          amount: string
        }
      ]
    }
  }
