// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LandChain {
    address public admin;

    struct Land {
        string plotNumber;
        string location;
        address owner;
        bool isRegistered;
    }

    mapping(string => Land) public lands;
    string[] public allPlotNumbers;

    event LandRegistered(string plotNumber, string location, address owner);
    event LandOwnershipTransferred(string plotNumber, address oldOwner, address newOwner);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    function registerLand(string memory _plotNumber, string memory _location, address _owner) public onlyAdmin {
        require(lands[_plotNumber].isRegistered == false, "Land is already registered");
        lands[_plotNumber] = Land(_plotNumber, _location, _owner, true);
        allPlotNumbers.push(_plotNumber);
        emit LandRegistered(_plotNumber, _location, _owner);
    }

    function transferOwnership(string memory _plotNumber, address _newOwner) public {
        require(lands[_plotNumber].isRegistered, "Land is not registered");
        require(msg.sender == lands[_plotNumber].owner || msg.sender == admin, "Only the current owner or admin can transfer ownership");
        
        address oldOwner = lands[_plotNumber].owner;
        lands[_plotNumber].owner = _newOwner;
        
        emit LandOwnershipTransferred(_plotNumber, oldOwner, _newOwner);
    }

    function getLand(string memory _plotNumber) public view returns (string memory, string memory, address, bool) {
        if (lands[_plotNumber].isRegistered == false) {
            return ("", "", address(0), false);
        }
        Land memory land = lands[_plotNumber];
        return (land.plotNumber, land.location, land.owner, land.isRegistered);
    }
}