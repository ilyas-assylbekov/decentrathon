const EmploymentContract = artifacts.require("EmploymentContract");

module.exports = function (deployer) {
  deployer.deploy(EmploymentContract);
};