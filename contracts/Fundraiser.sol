// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.21;

// Ownable - Used to transfer ownership of contracts to the creator of the contract.
import "@openzeppelin/contracts/access/Ownable.sol";
// Counter - Used to generate unique IDs for each fundraiser.
import "@openzeppelin/contracts/utils/Counters.sol";
// Pausable - Used to pause and unpause certain functions.
import "@openzeppelin/contracts/security/Pausable.sol";
// AccessControl - Used to restrict access to certain functions.
import "@openzeppelin/contracts/access/AccessControl.sol";
// SafeMath - Used to prevent overflow and underflow.
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
    
    // Roles
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
    event Withdrawal(uint amount, address indexed beneficiary);

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

    // Functions

    function donate() public payable whenNotPaused {
        require(msg.value > 0, "Donation must be greater than 0");
        
        // Donation value should not exceed donation goal
        require(
            totalTokenDonated.add(msg.value) <= donationGoal,
            "Value exceeds donation goal"
        );

        // Pause the contract if donation goal is reached
        if (totalTokenDonated.add(msg.value) == donationGoal) {
            _pause();
        }

        // Increment donation count for this fundraiser
        donationCount.increment();

        // Add donation amount to totalTokenDonated
        totalTokenDonated = totalTokenDonated.add(msg.value);
        
        Donation memory donation = Donation({
            amount: msg.value,
            donatedAt: block.timestamp
        });

        // Add current donation to donations mapping
        _donations[msg.sender].push(donation);

        // Emit Event
        emit DonationReceived(msg.sender, msg.value);
    }

    /**
     * @dev Withdraw funds from the contract
     * @notice By using whenPaused modifier, we can ensure that the donation goal has been reached
     */
    function withdraw() public onlyRole(BENEFICIARY) whenPaused {
        // Get current balance of contract
        uint balance = address(this).balance;

        // Transfer balance to beneficiary
        beneficiary.transfer(balance);

        // Emit Event
        emit Withdrawal(balance, beneficiary);
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

    function getUserDonations() public view returns (uint[] memory amount, uint[] memory donatedAt) {
        uint length = _donations[msg.sender].length;
        amount = new uint[](length);
        donatedAt = new uint[](length);

        for (uint i = 0; i < length; i++) {
            Donation storage donation = _donations[msg.sender][i];
            amount[i] = donation.amount;
            donatedAt[i] = donation.donatedAt;
        }

        return (amount, donatedAt);
    }

    function getUserDonationCount() public view returns (uint) {
        return _donations[msg.sender].length;
    }

    // Functions - Core Functions

    function pause() public onlyRole(MODERATOR) {
        _pause();
    }

    function unpause() public onlyRole(MODERATOR) {
        _unpause();
    }
}
