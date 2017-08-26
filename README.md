# eth-private-net

Prerequisites: Make sure `geth` is installed and in the `$PATH`. You can find installation instructions [here](https://www.ethereum.org/cli). We'll also be using [solc-js](https://www.npmjs.com/package/solc) to compile our Solidity contracts. Just run `npm install` to install.

## Identities

The private network comes with three identities (each secured with `foobar123` as the password):

 - Alice: `0xdda6ef2ff259928c561b2d30f0cad2c2736ce8b6`
 - Bob: `0x8691bf25ce4a56b15c1f99c944dc948269031801`
 - Lily: `0xb1b6a66a410edc72473d92decb3772bad863e243`

Each user's identity is stored in `./[NAME]/keystore/UTC-...`.

Creating new identities is easy. Simply run:

```
→ geth --datadir=./[your dir] account new
```

You'll be prompted for a password. Afterwards, your account information, including the identity's account address will be stored under: `./[NAME]/keystore/UTC-...`.

## Initializing From Genesis Block

Since we're bootstrapping our own private chain, we'll need a genesis block. The definition for our block will be stored in `genesis.json`. Both Alice and Bob's addresses are pre-allocated with 1 Ether (or 1e+18 [Wei](http://ethdocs.org/en/latest/ether.html)). Each account can be initialized with the convenience script `eth-private-net init`, or by running (e.g., for `alice`):

```
→ geth --datadir=./alice --networkid=8888 init genesis.json
```

## Running a Private Test Net

Nodes for `alice`, `bob`, and `lily` can be started easily with the `start` action of the convenience script:

```
→ ./eth-private-net start alice
Starting node for alice on port: 40301, RPC port: 8101. Console logs sent to ./alice/console.log
Welcome to the Geth JavaScript console!
```

The first thing you can do is check Alice's balance, which should show exactly 1e+18 Wei (1 ether).

```
> eth.getBalance("0xdda6ef2ff259928c561b2d30f0cad2c2736ce8b6")
1000000000000000000
```

You can also determine the running node's `enode` identifier:

```
> admin.nodeInfo.enode
"enode://f15b1...@[::]:40301?discport=0"
```

Take this identifier and use it to manually connect from another running client:

```
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
> miner.start()
null

> eth.getBalance(eth.coinbase)
6000000000000000000

> miner.stop()
true

> eth.blockNumber
1
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

Let's say Alice wants to transfer 1 Szabo (defined as 1 µEth or 1e+12 Wei) to Lily. With Bob mining (to ensure transactions are processed), we can have Alice send Lily some Ethereum by unlocking her account (with `foobar123` as the password), then sending a transaction with `.sendTransaction(...)`:

```
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
