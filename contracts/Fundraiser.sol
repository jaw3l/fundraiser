// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.21;

// Counter - Used to generate unique IDs for each fundraiser.
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Fundraiser is Pausable, AccessControl, Ownable {
    using SafeMath for uint;
    using Counters for Counters.Counter;

    string public title;
    string public image;
    string public description;
    uint public donationGoal;
    address payable public beneficiary;
    address public factoryOwner;
    uint public totalTokenDonated;
    Counters.Counter private donationCount;
    bytes32 public constant MODERATOR = keccak256("MODERATOR");
    bytes32 public constant BENEFICIARY = keccak256("BENEFICIARY");
    bytes32 public constant CREATOR = keccak256("CREATOR");

    constructor(
        string memory _title,
        string memory _description,
        string memory _image,
        uint _donationGoal,
        address payable _beneficiary,
        address _creator
    ) {
        title = _title;
        description = _description;
        image = _image;
        donationGoal = _donationGoal;
        beneficiary = _beneficiary;
        factoryOwner = msg.sender;
        _setupRole(MODERATOR, msg.sender);
        _setupRole(BENEFICIARY, _beneficiary);
        _setupRole(CREATOR, _creator);
    }


    // Functions - Core Functions

    function pause() public onlyRole(MODERATOR) {
        _pause();
    }

    function unpause() public onlyRole(MODERATOR) {
        _unpause();
    }
}
