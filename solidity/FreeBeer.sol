pragma solidity ^0.4.16;

// FreeBeer
//
// This is a simple, HelloWorld style contract that allows anybody on the Ethereum
// network to send the contract owner some money. It illustrates:
//
// - Contract creation
// - Use of a payable method to transfer value
// - Event emission
contract FreeBeer {

  // Each time money is transferred, emit the following Event to track who sender and value sent
  event MoneySent(address sender, address recipient, uint256 amount);

  // Declare the recipient of the contract
  address recipient;

  // The contract's constructor. This is called once (and only once) on contract creation. All it
  // does is set the contract's recipient to the creator of the contract.
  function FreeBeer() {
    recipient = msg.sender;
  }

  // The contract's only usable method. It's marked with the payable keyword so it can accept
  // value when called. Sends whatever value is included with the calling transaction to the
  // owner of the contract (i.e., the recipient). If successful, emits a MoneySent event,
  // and returns true. Returns false if transaction fails.
  function gimmeMoney() payable returns (bool) {
    if (recipient.send(msg.value)) {
      MoneySent(msg.sender, recipient, msg.value);
      return true;
    }

    return false;
  }

  // The contract's fallback function. This is a catch-all function that is executed whenever a
  // contract is called and no public methods match, or no method was specified. In this case, just
  // call .gimmeMoney() to send the contract owner whatever money is in the transaction.
  function () payable {
    gimmeMoney();
  }
}
