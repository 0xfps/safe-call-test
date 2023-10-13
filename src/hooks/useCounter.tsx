import { ethers } from "ethers"
import config from "../config/config.json"
import { useEffect, useState } from "react"

export default function useCounter() {
    const [count, setCount] = useState<number | null>(null)
    const [incrementTxn, setIncrementTxn] = useState({})

    const URL = "https://rpc.ankr.com/eth_goerli"
    const ADDRESS = config.address
    const ABI = config.abi

    const provider = new ethers.providers.JsonRpcProvider(URL)
    const Counter = new ethers.Contract(
        ADDRESS,
        ABI,
        provider
    )

    useEffect(() => {
        ; (async function () {
            const contractCount = await Counter.getCount()
            const txn = await Counter.populateTransaction.increment()

            setCount(contractCount)
            setIncrementTxn(txn)
        })()
    })

    return [count, incrementTxn]
}