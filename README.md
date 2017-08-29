# eth-private-net

`eth-private-net` is a simple tutorial that allows you to quickly setup a three-node private Ethereum network on your laptop. The network comes with three pre-made accounts (Alice, Bob, and Lily) and walks you through simple actions like mining and sending Ether from account to account, and culminates with the deployment and execution of a simple smart contract called `FreeBeer`. A convenience script (`eth-private-net`) is provided to make initializing, starting, and connecting nodes fast and easy.

**Prerequisites:** Make sure `geth` is installed and in the `$PATH`. You can find installation instructions [here](https://www.ethereum.org/cli). We'll also be referring to various denominations of Ether (Wei, GWei, Szabo, etc.). This [site](https://etherconverter.online/) gives an overview of the various denominations, and allows you to convert between them.

## Identities

The private network comes with three identities (each secured with `foobar123` as the password):

 - Alice: `0xdda6ef2ff259928c561b2d30f0cad2c2736ce8b6`
 - Bob: `0x8691bf25ce4a56b15c1f99c944dc948269031801`
 - Lily: `0xb1b6a66a410edc72473d92decb3772bad863e243`

Each user's identity is stored in `./[NAME]/keystore/UTC-...`.

## Initializing From Genesis Block

Since we're bootstrapping our own private chain, we'll need a genesis block. The definition for our block will be stored in `genesis.json`. Both Alice and Bob's addresses are pre-allocated with 1 Ether (or 1e+18 [Wei](http://ethdocs.org/en/latest/ether.html)). Just run:

```
→ ./eth-private-net init
```

**Note:** Tearing down your private network and resetting all account balances is easy. Just run:

```
→ ./eth-private-net clean
```

## Running a Private Test Net

Nodes for `alice`, `bob`, and `lily` can be started easily with the `start` action of the convenience script:

```
→ ./eth-private-net start alice
Starting node for alice on port: 40301, RPC port: 8101. Console logs sent to ./alice/console.log
Welcome to the Geth JavaScript console!
```

The first thing you can do is check Alice's balance, which should show exactly 1e+18 Wei (1 Ether).

```
# As alice:

> eth.getBalance("0xdda6ef2ff259928c561b2d30f0cad2c2736ce8b6")
1000000000000000000
```

You can also determine the Alice's [`enode`](https://github.com/ethereum/wiki/wiki/enode-url-format), a unique identifier for her node on the network:

```
# As alice:

> admin.nodeInfo.enode
"enode://f15b1...@[::]:40301?discport=0"
```

Take this identifier and use it to connect Bob's node to Alice (make sure to start Bob's node with: `./eth-private-net start bob`):

```
# As bob:

> admin.peers
[]

admin.addPeer("enode://f15b1...@[::]:40301?discport=0")

> admin.peers
[{
    caps: ["eth/63"],
    id: "f15b12b1293d578b3ff35075d742f33bb7fe9c7357c309ba711bbae68a0263dcbde30ecdc4597dba100ad4f4ad353edc18198101b993ecf4188ca2c42a1443ee",
    name: "Geth/v1.6.7-stable-ab5646c5/darwin-amd64/go1.8.3",
    network: {
      localAddress: "[::1]:60273",
      remoteAddress: "[::1]:40301"
    },
    protocols: {
      eth: {
        difficulty: 400000,
        head: "0xa528aeb0f22594c4ff224d87833cdbfbb6b0818b7892356ec1dea9a02c08b398",
        version: 63
      }
    }
}]
```

The convenience method `./eth-private-net connect` allows you to connect two nodes together. For instance, the following will create a three node net between Alice, Bob, and Lily:

```
→ ./eth-private-net connect alice bob
true

→ ./eth-private-net connect alice lily
true

→ ./eth-private-net connect bob lily
true
```

## Mining

The console allows you to begin mining on our private network easily. Simply execute `miner.start()`:

```
# As alice:

> miner.start()
null

> eth.getBalance(eth.coinbase)
6000000000000000000

> miner.stop()
true

> eth.blockNumber
1
```

**Note:** The first time you begin to mine, you'll need to generate a 1GB [Directed Acyclic Graph (DAG)](https://github.com/ethereum/wiki/wiki/Ethash-DAG). This dataset is used as part of Ethereum's Proof-of-Work system, Ethash and is stored in `~/.ethash/`. This will take about a minute and you'll see the following lines in your node's `console.log`:

```
INFO [08-26|16:07:23] Generating DAG in progress               epoch=0 percentage=0 elapsed=304.599ms
INFO [08-26|16:07:23] Generating DAG in progress               epoch=0 percentage=1 elapsed=550.655ms
INFO [08-26|16:07:23] Generating DAG in progress               epoch=0 percentage=2 elapsed=798.006ms
```

After a single block is mined, the balance of the account (or `eth.coinbase`) should increase by 5 ether. The current `blockNum` should then increase exactly by 1. Evidence of the mining should be present in the node's `console.log`:

```
INFO [08-25|16:20:45] Starting mining operation
INFO [08-25|16:20:45] Commit new mining work                   number=6 txs=0 uncles=0 elapsed=389.815µs
DEBUG[08-25|16:20:45] Loaded old ethash dataset from disk      epoch=0
DEBUG[08-25|16:20:45] Loaded old ethash dataset from disk      epoch=1
INFO [08-25|16:20:53] Successfully sealed new block            number=6 hash=3ed256…3ef7c2
DEBUG[08-25|16:20:53] Trie cache stats after commit            misses=15 unloads=0
INFO [08-25|16:20:53] 🔨 mined potential block                 number=6 hash=3ed256…3ef7c2
INFO [08-25|16:20:53] Commit new mining work                   number=7 txs=0 uncles=0 elapsed=444.679µs
```

## Transferring Ethereum

Now that we've mined a few blocks, let's try transferring some Ethereum. Let's start from a clean network. Shutdown any running nodes by typing `exit` at the console prompt. Clean and reinitialize the network by executing:

```
→ ./eth-private-net clean

→ ./eth-private-net init
```

Start nodes for alice, bob, and lily, and connect the three nodes using:

```
→ ./eth-private-net connect alice bob

→ ./eth-private-net connect alice lily

→ ./eth-private-net connect bob lily
```

Let's say Alice wants to transfer 1 Szabo (defined as 1 µEth or 1e+12 Wei) to Lily. With Bob mining (to ensure transactions are processed), we can have Alice send Lily some Ethereum by unlocking her account (with `foobar123` as the password), then sending a transaction with `.sendTransaction(...)`:

```
# As alice:

> personal.unlockAccount(eth.coinbase)
Unlock account 0xdda6ef2ff259928c561b2d30f0cad2c2736ce8b6
Passphrase:
true

> txn = eth.sendTransaction({ from: alice, to: lily, value: web3.toWei(1, "szabo") })
"0xb0fa9985cd6549258d6d96823d24398ba339f7f555fa0a58ca4b980bbbbebfe5"
```

Note: `alice`, and `lily` are variables that contain Alice's and Lily's addresses, respectively.

After the transaction has been processed, our account balances are now:

```
> [ eth.getBalance(alice), eth.getBalance(bob), eth.getBalance(lily) ]
[999621000000000000, 31000378000000000000, 1000000000000]
```

We see that Lily now has 1 Szabo, as expected. However, Alice's new balance contains _less_ ether than we'd expect from the transaction. The difference is the _transaction fee_ that arises from the transfer and is given to Bob, the miner, as an incentive for processing transactions. Each transfer costs a fixed 21,000 gas. To convert this into Wei, we can run use `eth.gasPrice` to find the current cost of gas:

```
> eth.gasPrice
18000000000
```

Therefore, the transaction fee was `gas x gasPrice = 2.1e+04 x 1.8e+10 = 3.78e+14 Wei`. This accounts for the discrepancy in Alice's account (and the additional 3.78e+14 Wei that appears in Bob's account).

A good metaphor for gas and gas price is electricity. In this metaphor, gas is equivalent to the amount of electricity, in kilowatt-hours (kW-h), used by various appliances in your house; gas price is then equivalent to the dollar cost of a kW-h charged by your utility. In the same way that running a lightbulb for an hour costs a fixed amount of kW-h (dictated by the physical characteristics of the bulb), an ether transfer costs a fixed amount of gas, regardless of the prevailing cost of electricity or gas.

## Deploying and Running Smart Contracts

One of the most interesting features of the Ethereum blockchain is the ability to deploy and run [smart contracts](https://en.wikipedia.org/wiki/Smart_contract) on the blockchain. In this section, we'll go through a simple example of writing, deploying, and running a smart contract called `FreeBeer`.

### FreeBeer - A simple, HelloWorld-esque Smart Contract

I've included a sample contract called `FreeBeer` in [`solidity/FreeBeer.sol`](https://github.com/vincentchu/eth-private-net/blob/master/solidity/FreeBeer.sol). The contract itself is simple; it allows anybody on the Ethereum network to send the contract holder some money. Though it is simple, it illustrates some basic concepts around using smart contracts to send Ether.

I've pre-compiled FreeBeer's ABI and byte code (both in `solidity/`) using [`sol-js`](https://github.com/ethereum/solc-js) and wrapped both in a simple javascript file that allows easy use inside the geth console:

```
# As alice:

> loadScript('solidity/FreeBeer.sol.js')
true

> freeBeerBytecode
"0x6060604052341561000f57600080fd5b5b336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505b5b6101c6806100616000396000f3006060604052361561003f576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063fb5de8af14610070575b5b61006c336000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff163461007a565b505b005b61007861016a565b005b60008273ffffffffffffffffffffffffffffffffffffffff166108fc839081150290604051600060405180830381858888f193505050501561015e577fbc8f5a5cb90bc33d83a08f0663beb02c65e4c51522ef0c8230d36370088a0a19848484604051808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001828152602001935050505060405180910390a160019050610163565b600090505b9392505050565b610196336000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff163461007a565b505b5600a165627a7a723058200dfd10e15bfd60e5f57a16b1c48c1a72625f80e71a2d8f50b98b855b652178390029"
```

Note: Installing `solc-js` isn't strictly necessary, but you'll need it if you want to play around with your own smart contracts. Running `npm install` installs the executable under `./node_modules/.bin/solcjs`.

### Deploying

Note: Make sure you unlock the accounts before deploying a contract or executing calls against it. You can do so by running `personal.unlockAccount(...)` and using `foobar123` as the password. Also make sure that a miner is running (in these examples, Lily is the sole running miner).

Suppose Alice wishes to deploy `FreeBeer` to allow anybody to send her some Ether. First, she'll need to prepare a transaction from herself, and specifies the contract's compiled bytecode as data. We'll also provide 20,000 gas to pay for the deployment, and use `eth.estimateGas(...)` to check that our supplied gas is sufficient to pay for the contract's deployment:

```
# As alice:

> var deployTxn = { from: alice, data: freeBeerBytecode, gas: 200000 }
undefined

> eth.estimateGas(deployTxn)
198218
```

Next, we'll create an instance of the transaction, and deploy it. We can then obtain the deployed contract's address from the receipt (`0x48c1bdb954c945a57459286719e1a3c86305fd9e` in the example):

```
# As alice:

> var freeBeerContract = eth.contract(freeBeerAbi)
undefined

> var freeBeerInstance = freeBeerContract.new(deployTxn)
undefined

> var receipt = eth.getTransactionReceipt(freeBeerInstance.transactionHash)
undefined

> receipt.contractAddress
"0x48c1bdb954c945a57459286719e1a3c86305fd9e"
```

After the contract has been deployed, let's look at Alice's account balance. She started with exactly 1 Ether in her account. After deploying the account, her balance went down by 3,567,906 Gwei (1 Gwei = 1 Shannon = 1 Nano Ether). At the prevailing gas price of 18 Gwei, that means our deployment cost 198,217 gas--- just 1 off of our initial estimate!

```
> eth.getBalance(alice)
996432094000000000

> (web3.toWei(1, "ether") - eth.getBalance(alice)) / eth.gasPrice
198217
```

### Using FreeBeer to Transfer Money

Now that our contract is deployed, let's have Bob use it to send some money to Alice via the contract. To do so, Bob will take the compiled ABI and bind it to the deployed contract's address. Bob can then use this contract to call the `.gimme_money` method, sending 100 Finneys (1 Finney = 1 milliEther) to the contract owner (Alice):

```
# As bob:

> var freeBeerContract = eth.contract(freeBeerAbi)
undefined

> var freeBeerDeployed = freeBeerContract.at("0x48c1bdb954c945a57459286719e1a3c86305fd9e")
undefined

> freeBeerDeployed.gimme_money.sendTransaction({ from: bob, value: web3.toWei(0.1, 'ether')})
"0xe42b7d3d113f8670528ee5f14ec6cd65e94d15c12b4ca31187e1134c80e884ff"
```

Checking our account balances after the transaction shows that Alice's account has indeed increased by 100 Finneys, while Bob's has decreased by about 100.555 Finneys. Again, the discrepancy is due to the gas cost of executing the smart contract. In this case, the cost (at the prevailing gas price) was 30,824 gas:


```
> [ eth.getBalance(alice), eth.getBalance(bob)]
[1096432094000000000, 899445168000000000]
```

### Events on Smart Contracts

The last concept we'll cover are events. Each time money is successfully sent, the contract emits an [event](https://github.com/vincentchu/eth-private-net/blob/master/solidity/FreeBeer.sol#L31). The following calls will allow us examine these events in greater detail.

```
> var outputEvent = function (e, result) { console.log(JSON.stringify(result)); }
undefined

> freeBeerDeployed.MoneySent({}, { fromBlock: 0, toBlock: 'latest' }).get(outputEvent)
[
  {
    // Contract Address
    "address": "0x48c1bdb954c945a57459286719e1a3c86305fd9e",

    // Arguments passed to the MoneySent event
    "args": {
      "amount": "100000000000000000",
      "recipient": "0xdda6ef2ff259928c561b2d30f0cad2c2736ce8b6",
      "sender": "0x8691bf25ce4a56b15c1f99c944dc948269031801"
    },
    "blockHash": "0xd487568b3ce132da7da4a957c8396058b5e945db959b5bfa20a6873649f9dfa9",
    "blockNumber": 15,
    "event": "MoneySent",
    "logIndex": 0,
    "removed": false,
    "transactionHash": "0xe42b7d3d113f8670528ee5f14ec6cd65e94d15c12b4ca31187e1134c80e884ff",
    "transactionIndex": 0
  }
]
```

## Fin

I hope you've enjoyed this tutorial. I wrote it mostly to help my own understanding about smart contracts and the Ethereum blockchain. It's by no means complete, but hopefully others can get some use out of it. Questions, comments, or hate? Find me on Twitter as [@vincentchu](https://twitter.com/vincentchu).
