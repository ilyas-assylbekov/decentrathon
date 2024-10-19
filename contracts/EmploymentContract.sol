// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EmploymentContract {
    address public employer;
    address public employee;
    string public contractFile;
    bool public employerSigned;
    bool public employeeSigned;

    constructor() {
        employer = msg.sender;
    }

    function setEmployee(address _employee, string memory _contractFile) public {
        require(msg.sender == employer, "Only the employer can set the employee and contract file");
        employee = _employee;
        contractFile = _contractFile;
    }

    function signAsEmployer() public {
        require(msg.sender == employer, "Only the employer can sign this contract");
        employerSigned = true;
    }

    function signAsEmployee() public {
        require(msg.sender == employee, "Only the employee can sign this contract");
        employeeSigned = true;
    }

    function isSigned() public view returns (bool) {
        return employerSigned && employeeSigned;
    }
}