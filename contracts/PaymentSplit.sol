// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";


contract PaymentSplitter is Ownable{
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _fedIds;
   

    struct Payment{
       uint256 itemId;
       address[] payees;
       uint256[] shares;
     }

    struct PaymentFederation{
        uint256 itemId;
        address federation;
        uint256 amount;
    }

   mapping(uint256 => PaymentFederation) private  FederationPay;
   mapping(uint256 => Payment) private Paymentlist;


    function PaymentSplit(uint256 itemId,address[] memory payees, uint256[] memory shares) internal {
      
        require(payees.length == shares.length, "PaymentSplitter: payees and shares length mismatch");
        require(payees.length > 0, "PaymentSplitter: no payees");
        for (uint256 i = 0; i < payees.length; i++) {
                _addPayee(itemId,payable(payees[i]),shares[i]);

        }
    }

    /**
     * @dev Getter for the total shares held by payees.
     */
    function totalShares(uint itemId) public view returns (uint256) {
            uint[] memory id= Paymentlist[itemId].shares;
            uint share ;
            for (uint256 i = 0; i < id.length; i++) {
                  share+=id[i];
            }
            return share;
        
        }
     

       
        function FederationsTransaction() public view returns (PaymentFederation[] memory) {
            
            uint totalItemCount = _fedIds.current();
            uint Count = 0;
            uint currentIndex = 0;

            for (uint i = 0; i < totalItemCount; i++) {
                    Count += 1;
                }


            PaymentFederation[] memory items = new PaymentFederation[](Count);
            for (uint i = 0; i < totalItemCount; i++) {
                uint currentId = i + 1;
                PaymentFederation storage currentItem = FederationPay[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
             
            }
            return items;
  }

  



  

   

    /**
     * @dev Triggers a transfer to `account` of the amount of Ether they are owed, according to their percentage of the
     * total shares and their previous withdrawals.
     */
    function Release(uint256 itemId ,uint price) public payable {
        // require(_shares > 0, "PaymentSplitter: account has no shares");
         _fedIds.increment();
        uint256 fedId = _fedIds.current();
        uint amount ;        
        uint256 payment = price - (price*40/(100));
        require(payment != 0, "PaymentSplitter: account is not due payment");
        payable(Paymentlist[itemId].payees[0]).transfer(payment);
        amount = price.sub(payment);
        payable(Paymentlist[itemId].payees[1]).transfer(amount);
        FederationPay[fedId]= PaymentFederation(
            itemId,
            Paymentlist[itemId].payees[1],
            amount
            );
    
    }

// owner: 104


    function _addPayee(uint256 itemId,address payees, uint256 shares) private {
               require(payees != address(0), "PaymentSplitter: account is the zero address");
                require(shares > 0, "PaymentSplitter: shares are 0");
                Paymentlist[itemId].itemId=itemId;
                Paymentlist[itemId].payees.push(payees);
                Paymentlist[itemId].shares.push(shares);

    }
}



