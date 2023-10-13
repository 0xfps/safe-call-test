import { Web3AuthModalPack, Web3AuthConfig } from '@safe-global/auth-kit'
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from '@web3auth/base'
import { Web3AuthOptions } from '@web3auth/modal'
import { OpenloginAdapter } from '@web3auth/openlogin-adapter'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import useCounter from '../hooks/useCounter'

// https://web3auth.io/docs/sdk/pnp/web/modal/initialize#arguments
const options: Web3AuthOptions = {
    clientId: process.env.REACT_APP_CLIENT_ID as string, // https://dashboard.web3auth.io/
    web3AuthNetwork: 'testnet',
    chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: '0x5',
        // https://chainlist.org/
        rpcTarget: 'https://rpc.ankr.com/eth_goerli'
    },
    uiConfig: {
        theme: 'dark',
        loginMethodsOrder: ['google', 'facebook']
    }
}

// https://web3auth.io/docs/sdk/pnp/web/modal/initialize#configuring-adapters
const modalConfig = {
    [WALLET_ADAPTERS.TORUS_EVM]: {
        label: 'torus',
        showOnModal: false
    },
    [WALLET_ADAPTERS.METAMASK]: {
        label: 'metamask',
        showOnDesktop: true,
        showOnMobile: false
    }
}

// https://web3auth.io/docs/sdk/pnp/web/modal/whitelabel#whitelabeling-while-modal-initialization
const openloginAdapter = new OpenloginAdapter({
    loginSettings: {
        mfaLevel: 'mandatory'
    },
    adapterSettings: {
        uxMode: 'popup',
        whiteLabel: {
            name: 'Safe'
        }
    }
})

const web3AuthConfig: Web3AuthConfig = {
    txServiceUrl: 'https://safe-transaction-goerli.safe.global'
}

export default function Safe() {
    const [web3AuthModalPack, setWeb3AuthModalPack] = useState<any>(null)
    const [isSignedIn, setIsSignedIn] = useState(false)
    const [address, setAddress] = useState<string | `0x${string}` | null>(null)
    const [signature, setSignature] = useState<string | null>(null)
    const [txn, setTxn] = useState<string | null>(null)

    const [count, incrementTxn] = useCounter()

    useEffect(function () {
        // Instantiate and initialize the pack
        ; (async function () {
            const web3AuthModalPackInit = new Web3AuthModalPack(web3AuthConfig)
            await web3AuthModalPackInit.init({ options, adapters: [openloginAdapter], modalConfig })
            setWeb3AuthModalPack(web3AuthModalPackInit)
        })()
    }, [])

    async function signInUser() {
        const safeData = await web3AuthModalPack.signIn()
        setIsSignedIn(current => true)
        setAddress(safeData.eoa)
    }

    async function signMessage() {
        const provider = new ethers.providers.Web3Provider(web3AuthModalPack.getProvider() as any)
        const signer = provider.getSigner()
        const signature = await signer.signMessage("Hello!")
        setSignature(signature)
    }

    async function sendSafeTransaction() {
        const provider = new ethers.providers.Web3Provider(web3AuthModalPack.getProvider() as any)
        const signer = provider.getSigner()
        if (incrementTxn) {
            console.log("Transaction populated, sending...")
            const txn = await signer.sendTransaction(incrementTxn)
            console.log(txn)
        } else {
            console.log("Transaction not populated yet.")
        }
    }

    return (
        <>
            {(count === null) ? "Null count!" : `Contract count is ${count}`}
            <br /><br />
            {!web3AuthModalPack && "Loading..."}
            {(web3AuthModalPack && !address) && <button onClick={async () => await signInUser()}>Safe</button>}
            {address && `Your address is ${address}!`}
            <br /><br />
            {(isSignedIn && address && incrementTxn) &&
                <>
                    <button onClick={async () => await signMessage()}>Sign Message "Hello!"</button> <span style={{ visibility: "hidden" }}>POP</span>
                    <button onClick={async () => await sendSafeTransaction()}>Send Transaction</button>
                </>
            }
            <br /><br />
            {signature && `Your signature is ${signature}!`}
        </>
    )
}