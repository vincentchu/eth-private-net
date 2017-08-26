pragma solidity ^0.4.16;

// FreeBeer
//
// This is a simple, HelloWorld style contract that allows anybody on the Ethereum
// network to send the contract owner some money. It illustrates:
//
// - Contract creation
// - Use of an private, internal method
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

  // Private helper function that actually effects the transaction. Sends value to a given
  // address. If successful, emits a MoneySent event, and returns true. Returns false if
  // transaction fails.
  function send_amount(address sender, address dest, uint256 amount) private returns (bool) {
    if (dest.send(amount)) {
      MoneySent(sender, dest, amount);
      return true;
    }

    return false;
  }

  // The contract's only usable method. It's marked with the payable keyword so it can accept
  // value when called. Delegates immediately to send_amount.
  function gimme_money() payable {
    send_amount(msg.sender, recipient, msg.value);
  }

  // The contract's fallback function. This is a catch-all function that is executed whenever a
  // contract is called and no public methods match, or no method was specified. In this case, just
  // send whatever value was in the transaction back to the owner.
  function () payable {
    send_amount(msg.sender, recipient, msg.value);
  }
}
