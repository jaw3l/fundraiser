// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.21;

import "./Fundraiser.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract FundraiserFactory {
    using Counters for Counters.Counter;
    Counters.Counter private _fundraiserCount;
    Fundraiser[] public _fundraisers;
    address public _factoryOwner;

    // Constructor
    constructor() {
        _factoryOwner = msg.sender;
    }

    // Events
    event FundraiserCreated(
        address indexed fundraiserAddress,
        address indexed creator,
        address indexed beneficiary
    );

    // Functions

    function createFundraiser(
        string memory _title,
        string memory _description,
        string memory _image,
        uint _donationGoal,
        address payable _beneficiary
    ) public {
        Fundraiser fundraiser = new Fundraiser(
            _title,
            _description,
            _image,
            _donationGoal,
            _factoryOwner,
            msg.sender,
            _beneficiary
        );
        // Add fundraiser to list of fundraisers
        _fundraisers.push(fundraiser);

        // Increment counter for total fundraisers created
        _fundraiserCount.increment();

        // Emit Event
        emit FundraiserCreated(address(fundraiser), msg.sender, _beneficiary);
    }

    // Functions - Getter Functions

    function getFundraisersInRange(uint startIndex, uint endIndex) public view returns (Fundraiser[] memory) {
        Fundraiser[] memory fundraisersInRange = new Fundraiser[](endIndex - startIndex);
        for (uint i = startIndex; i < endIndex; i++) {
            fundraisersInRange[i - startIndex] = _fundraisers[i];
        }
        return fundraisersInRange;
    }

    function getFundraiser(uint index) public view returns (Fundraiser) {
        return _fundraisers[index];
    }

    function getFundraisersCount() public view returns (uint) {
        return _fundraiserCount.current();
    }
}