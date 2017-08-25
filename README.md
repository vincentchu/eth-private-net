# eth-private-net
-----------------

## Identities

The private network comes with three identities (each secured with `foobar123` as the password):

 - alice: `0xdda6ef2ff259928c561b2d30f0cad2c2736ce8b6`
 - bob: `0x8691bf25ce4a56b15c1f99c944dc948269031801`
 - lily: `0xb1b6a66a410edc72473d92decb3772bad863e243`

Each user's identity is stored in `./[NAME]/keystore/UTC-...`.

Creating new identities is easy. Simply run:

```
geth --datadir=./[your dir] account new
```

You'll be prompted for a password. Afterwards, your account information, including the identity's account address will be stored under: `./[NAME]/keystore/UTC-...`.

## Initializing From Genesis Block

Since we're bootstrapping our own private chain, we'll need a genesis block. The definition for our block will be stored in `genesis.json`. Both Alice and Bob's addresses are pre-allocated with 1 ether (or 1e+18 [wei](http://ethdocs.org/en/latest/ether.html)). Each account can be initialized with the convenience script `eth-private-net init`, or by running (e.g., for `alice`):

```
geth --datadir=./alice --networkid=8888 init genesis.json
```

## Running a Private Test Net

Nodes for the `alice`, `bob`, and `lily` identities can be started easily with the `start` action of the convenience script:

```
vince@local:eth-private-net (master *) → ./eth-private-net start alice
Starting node for alice on port: 40301, RPC port: 8101. Console logs sent to ./alice/console.log
Welcome to the Geth JavaScript console!
```

The first thing you can do is  check the balances for alice, which should show exactly 1e+18 wei (1 ether).

```
> eth.getBalance("0xdda6ef2ff259928c561b2d30f0cad2c2736ce8b6")
1000000000000000000
```

You can also determine the running node's `enode` identifier:

```
> admin.nodeInfo.enode
"enode://f15b1...@[::]:40301?discport=0"
```

Take this identifier and use it to connect from another running client:

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

## Mining

The console allows you to begin mining easily. Simply execute `miner.start()`:

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
INFO [08-25|16:20:53] 🔨 mined potential block                  number=6 hash=3ed256…3ef7c2
INFO [08-25|16:20:53] Commit new mining work                   number=7 txs=0 uncles=0 elapsed=444.679µs
```
