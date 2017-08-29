# eth-private-net

`eth-private-net` is a simple tutorial that allows you to quickly setup a three-node private Ethereum network running locally on your personal computer. The network comes with three pre-made accounts (Alice, Bob, and Lily) and walks you through simple actions like mining and sending Ether from account to account, and culminates with the deployment and execution of a simple smart contract called `FreeBeer`. A convenience script (`eth-private-net`) is provided to make initializing, starting, and connecting nodes fast and easy.

**Prerequisites:** Make sure `geth` is installed and in the `$PATH`. You can find installation instructions [here](https://www.ethereum.org/cli). We'll also be referring to various denominations of Ether (Wei, GWei, Szabo, etc.). This [site](https://etherconverter.online/) gives an overview of the various denominations, and allows you to convert between them.

## Identities

The private network comes with three identities (each secured with `foobar123` as the password):

 - Alice: `0xdda6ef2ff259928c561b2d30f0cad2c2736ce8b6`
 - Bob: `0x8691bf25ce4a56b15c1f99c944dc948269031801`
 - Lily: `0xb1b6a66a410edc72473d92decb3772bad863e243`

Each user's identity is stored in `./[NAME]/keystore/UTC-...`.

## Initializing From Genesis Block

Since we're bootstrapping our own private chain, we'll need a [genesis block](https://github.com/ethereum/go-ethereum/wiki/Private-network#creating-the-genesis-block). The definition for our block will be stored in `genesis.json`. Both Alice and Bob's addresses are pre-allocated with 1 Ether (or 1e+18 [Wei](http://ethdocs.org/en/latest/ether.html)). Just run:

```
→ ./eth-private-net init
```

**Note:** Tearing down your private network and resetting all account balances is easy. Just run:

```
→ ./eth-private-net clean
```

## Running a Private Test Net

Nodes for `alice`, `bob`, or `lily` can be started easily with the `start` action of the convenience script:

```
→ ./eth-private-net start alice
Starting node for alice on port: 40301, RPC port: 8101. Console logs sent to ./alice/console.log
Welcome to the Geth JavaScript console!
```

This starts a running Ethereum node, loads whatever identity you specified on the command line, and starts a console where you can begin interacting with your private net. The console itself is a Javascript REPL with all of the commands you need to begin working with Ethereum preloaded. You can check out all of the available commands [here](https://github.com/ethereum/go-ethereum/wiki/JavaScript-Console#management-api-reference).

The first thing you can do is check Alice's balance, which should show exactly 1e+18 Wei (1 Ether).

```
# As alice:

> eth.getBalance("0xdda6ef2ff259928c561b2d30f0cad2c2736ce8b6")
1000000000000000000
```

For convenience, the addresses for alice, bob, and lily have been aliased to variables (see: [`identities.js`](https://github.com/vincentchu/eth-private-net/blob/master/identities.js)) allowing you to use them quickly and easily:

```
> bob
"0x8691bf25ce4a56b15c1f99c944dc948269031801"

> [ eth.getBalance(alice), eth.getBalance(bob), eth.getBalance(lily) ]
[1000000000000000000, 1000000000000000000, 0]
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

The convenience method `./eth-private-net connect` allows you to connect two running nodes together. For instance, the following will create a three node net between Alice, Bob, and Lily:

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

**Note:** The first time you begin to mine, you'll need to generate a 1GB [Directed Acyclic Graph (DAG)](https://github.com/ethereum/wiki/wiki/Ethash-DAG). This dataset is used as part of Ethereum's Proof-of-Work system, Ethash, and is stored in `~/.ethash/`. This will take about a minute and you'll see the following lines in your node's `console.log`:

```
INFO [08-26|16:07:23] Generating DAG in progress               epoch=0 percentage=0 elapsed=304.599ms
INFO [08-26|16:07:23] Generating DAG in progress               epoch=0 percentage=1 elapsed=550.655ms
INFO [08-26|16:07:23] Generating DAG in progress               epoch=0 percentage=2 elapsed=798.006ms
```

After a single block is mined, the balance of the account (or `eth.coinbase`) should increase by 5 ether. The current `blockNum` should then increase exactly by 1. Evidence of the mining should be present in the node's logfile (in this case, `alice/console.log`):

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

## Transferring Ether

Now that we've mined a few blocks, let's try transferring some Ethereum. Let's start from a clean network. Shutdown any running nodes by typing `exit` at the console prompt. Clean and reinitialize the network by executing:

```
→ ./eth-private-net clean

→ ./eth-private-net init
```

Start nodes for alice, bob, and lily (using `eth-private-net start [alice | bob | lily]`), and connect the three nodes using:

```
→ ./eth-private-net connect alice bob

→ ./eth-private-net connect alice lily

→ ./eth-private-net connect bob lily
```

**Note:** The following examples assume that Bob is mining (to ensure transactions are processed); start his miner with `miner.start()`.

Let's say Alice wants to transfer 1 Szabo (defined as 1 µEth or 1e+12 Wei) to Lily. We can have Alice send Lily some Ethereum by unlocking her account (with `foobar123` as the password), then sending a transaction with `.sendTransaction(...)`:

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

Therefore, the transaction fee was `gas x gasPrice = 2.1e+04 x 1.8e+10 = 3.78e+14 Wei`. This accounts for the discrepancy in Alice's account (and the additional 3.78e+14 Wei that appears in Bob's account). In general, the gas used for executing transactions on the network (e.g., transferring ether, deploying a smart contract, or calling one) can be found with `eth.getTransactionReceipt`:

```
> eth.getTransactionReceipt("0xb0fa9985cd6549258d6d96823d24398ba339f7f555fa0a58ca4b980bbbbebfe5").cumulativeGasUsed
21000
```

A good metaphor for gas and gas price is electricity. In this metaphor, gas is equivalent to the amount of electricity, in kilowatt-hours (kW-h), used by various appliances in your house; gas price is then equivalent to the dollar cost of a kW-h charged by your utility. In the same way that running a lightbulb for an hour costs a fixed amount of kW-h (dictated by the physical characteristics of the bulb), an ether transfer costs a fixed amount of gas, regardless of the prevailing cost of electricity or gas.

## Deploying and Running Smart Contracts

One of the most interesting features of the Ethereum blockchain is the ability to deploy and run [smart contracts](https://en.wikipedia.org/wiki/Smart_contract) on the blockchain. In this section, we'll go through a simple example of writing, deploying, and running a smart contract called `FreeBeer`.

### FreeBeer - A simple, HelloWorld-esque Smart Contract

I've included a sample contract called `FreeBeer` in [`solidity/FreeBeer.sol`](https://github.com/vincentchu/eth-private-net/blob/master/solidity/FreeBeer.sol). The contract itself is simple and written in [Solidity](https://en.wikipedia.org/wiki/Solidity), a statically-typed language for writing smart contracts. It allows anybody on the Ethereum network to send the contract holder some money. Though it is simple, it illustrates some basic concepts around using smart contracts to send Ether.

To deploy a Solidity contract, you'll need to compile it into an [Application Binary Interface (ABI)](https://github.com/vincentchu/eth-private-net/blob/master/solidity/FreeBeer_sol_FreeBeer.abi) and Ethereum Virtual Machine (EVM) [bytecode](https://github.com/vincentchu/eth-private-net/blob/master/solidity/FreeBeer_sol_FreeBeer.bin). The ABI itself is a bit of JSON that defines the contract's interface--- e.g., what methods it exposes or the types of its arguments. The bytecode is a hex-encoded string that allows the contract to be run on the Ethereum Virtual Machine (EVM) when the contract is called.

**Note:** Installing `solc-js` isn't strictly necessary, but you'll need it if you want to play around with your own smart contracts. Running `npm install` installs the executable under `./node_modules/.bin/solcjs`.

I've pre-compiled FreeBeer's ABI and bytecode (both in `solidity/`) using [`sol-js`](https://github.com/ethereum/solc-js) and wrapped both in a simple javascript file that allows easy use inside the geth console:

```
# As alice:

> loadScript('solidity/FreeBeer.sol.js')
true

> freeBeerBytecode
"0x6060604052341561000f57600080fd5b5b60008054600160a060020a03191633600160a060020a03161790555b5b6101558061003c6000396000f3006060604052361561003e5763ffffffff7c0100000000000000000000000000000000000000000000000000000000600035041663944d1ea1811461004b575b5b610047610067565b505b005b610053610067565b604051901515815260200160405180910390f35b6000805473ffffffffffffffffffffffffffffffffffffffff163480156108fc0290604051600060405180830381858888f1935050505015610122576000547fbc8f5a5cb90bc33d83a08f0663beb02c65e4c51522ef0c8230d36370088a0a1990339073ffffffffffffffffffffffffffffffffffffffff163460405173ffffffffffffffffffffffffffffffffffffffff9384168152919092166020820152604080820192909252606001905180910390a1506001610126565b5060005b905600a165627a7a723058203dc9952621b6fb093a9c28af6f0e086c9794dd6f8a60a5b27aa463833ffefc9f0029"
```

### Deploying

Note: Make sure you unlock the accounts before deploying a contract or executing calls against it. You can do so by running `personal.unlockAccount(...)` and using `foobar123` as the password. Also **make sure that a miner is running** (in these examples, Lily is the sole running miner).

Suppose Alice wishes to deploy `FreeBeer` to allow anybody to send her some Ether. First, she'll need to prepare a transaction specifying the contract's compiled bytecode as data. We'll also provide 20,000 gas to pay for the deployment, and use `eth.estimateGas(...)` to check that our supplied gas is sufficient to pay for the contract's deployment:

```
# As alice:

> var deployTxn = { from: alice, data: freeBeerBytecode, gas: 200000 }
undefined

> eth.estimateGas(deployTxn)
165815
```

Next, we'll create an instance of the contract from its ABI, and deploy it using the transaction. We can then obtain the deployed contract's address from the receipt (**Note:** The address of the deployed contract is `0x48c1bd...` in the example, but will be different for you):

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

> receipt.gasUsed
165814
```

We see that we used 165,814 gas in the deployment--- just 1 off of our initial estimate! After deployment, Alice's account balance decreased by 2,984,652 Gwei (1 Gwei = 1 Shannon = 1 Nano Ether), which is just the cost of 165,814 gas as the prevailing price of 18 Gwei.

```
> eth.getBalance(alice)
997015348000000000

> web3.toWei(1, "ether") - eth.getBalance(alice) == 165814 * eth.gasPrice
true
```

### Using FreeBeer to Transfer Money

Now that our contract is deployed, let's have Bob use it to send some money to Alice via the contract. To do so, Bob will take the compiled ABI and bind it to the deployed contract's address. Bob can then use this contract to call the `.gimmeMoney` method, sending 100 Finneys (1 Finney = 1 milliEther) to the contract owner (Alice):

```
# As bob:

> loadScript('solidity/FreeBeer.sol.js')
true

> var freeBeerContract = eth.contract(freeBeerAbi)
undefined

> var freeBeerDeployed = freeBeerContract.at("0x48c1bdb954c945a57459286719e1a3c86305fd9e")
undefined

> freeBeerDeployed.gimmeMoney.sendTransaction({ from: bob, value: web3.toWei(0.1, 'ether')})
"0xe42b7d3d113f8670528ee5f14ec6cd65e94d15c12b4ca31187e1134c80e884ff"
```

Checking our account balances after the transaction shows that Alice's account has indeed increased by 100 Finneys, while Bob's has decreased by about 100.56 Finneys. Again, the discrepancy is due to the gas cost of executing the smart contract. In this case, the cost (at the prevailing gas price) was 30,979 gas:

```
> [ eth.getBalance(alice), eth.getBalance(bob)]
[1097015348000000000, 899442378000000000]
```

### Events on Smart Contracts

The last concept we'll cover are events. Each time money is successfully sent, the contract emits an [event](https://github.com/vincentchu/eth-private-net/blob/master/solidity/FreeBeer.sol#L31). The following calls will allow us examine these events in greater detail.

```
> var outputEvent = function (e, result) { console.log(JSON.stringify(result)); }
undefined

> freeBeerDeployed.MoneySent({}, { fromBlock: 0, toBlock: 'latest' }).get(outputEvent)
[
  {
    "address": "0x48c1bdb954c945a57459286719e1a3c86305fd9e",
    "args": {
      "amount": "100000000000000000",
      "recipient": "0xdda6ef2ff259928c561b2d30f0cad2c2736ce8b6",
      "sender": "0x8691bf25ce4a56b15c1f99c944dc948269031801"
    },
    "blockHash": "0xe05737f1a0cbebac566e21e9d22986d36a50f42e115c058e7fe45cf14429dd4f",
    "blockNumber": 111,
    "event": "MoneySent",
    "logIndex": 0,
    "removed": false,
    "transactionHash": "0xf838b6be4d68de91ac1af91b933bb5bdfcae1e49c287184795b7933e654f2c14",
    "transactionIndex": 0
  }
]
```

## Fin

I hope you've enjoyed this tutorial. I wrote it mostly to help my own understanding about smart contracts and the Ethereum blockchain. It's by no means complete, but hopefully others can get some use out of it. Questions, comments, or hate? Find me on Twitter as [@vincentchu](https://twitter.com/vincentchu).

_Building something interesting? [Initialized Capital](https://twitter.com/@initializedcap) would love to chat with you._

_Thanks:_ Brett Gibson for reading through this tutorial and providing feedback and comments.
