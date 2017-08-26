// Compiled bytecode for FreeBeer (using --bin)
var freeBeerBytecode = "0x6060604052341561000f57600080fd5b5b336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505b5b6101c6806100616000396000f3006060604052361561003f576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063fb5de8af14610070575b5b61006c336000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff163461007a565b505b005b61007861016a565b005b60008273ffffffffffffffffffffffffffffffffffffffff166108fc839081150290604051600060405180830381858888f193505050501561015e577fbc8f5a5cb90bc33d83a08f0663beb02c65e4c51522ef0c8230d36370088a0a19848484604051808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001828152602001935050505060405180910390a160019050610163565b600090505b9392505050565b610196336000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff163461007a565b505b5600a165627a7a723058200dfd10e15bfd60e5f57a16b1c48c1a72625f80e71a2d8f50b98b855b652178390029"

// Application Binary Interface (ABI) for FreeBeer (using --abi)
var freeBeerAbi = [
  {
    "constant": false,
    "inputs": [],
    "name": "gimme_money",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "payable": true,
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "MoneySent",
    "type": "event"
  }
]
