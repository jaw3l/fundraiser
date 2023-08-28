// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.21;


import "hardhat/console.sol";
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

    // Constructor
    constructor(
        string memory _title,
        string memory _image,
        string memory _description,
        uint _donationGoal,
        address _factoryOwner,
        address _creator,
        address payable _beneficiary
    ) {
        title = _title;
        image = _image;
        description = _description;
        donationGoal = _donationGoal;
        factoryOwner = _factoryOwner;
        beneficiary = _beneficiary;
        _setupRole(MODERATOR, _factoryOwner);
        _setupRole(BENEFICIARY, _beneficiary);
        _transferOwnership(_creator);
    }

    // Structs

    struct Donation {
        uint amount;
        uint donatedAt;
    }

    // Mappings

    mapping(address => Donation[]) public _donations;

    // Events

    event DonationReceived(address indexed donor, uint amount);

    // Modifiers

    modifier onlyPrivileged() {
        require(
            hasRole(MODERATOR, msg.sender) ||
                hasRole(BENEFICIARY, msg.sender) ||
                msg.sender == owner(),
            "Caller is not privileged"
        );
        _;
    }

    // Functions - Setter Functions

    function updateTitle(string memory _title) public onlyPrivileged {
        title = _title;
    }

    function updateDescription(
        string memory _description
    ) public onlyPrivileged {
        description = _description;
    }

    function updateImage(string memory _image) public onlyPrivileged {
        image = _image;
    }

    function updateDonationGoal(uint _donationGoal) public onlyPrivileged {
        donationGoal = _donationGoal;
    }

    function updateBeneficiary(
        address payable _beneficiary
    ) public onlyPrivileged {
        beneficiary = _beneficiary;
    }

    // Functions - Getter Functions

    function getDonationCount() public view returns (uint) {
        return donationCount.current();
    }

    // Functions - Core Functions

    function pause() public onlyRole(MODERATOR) {
        _pause();
    }

    function unpause() public onlyRole(MODERATOR) {
        _unpause();
    }
}
