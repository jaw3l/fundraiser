import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import "@nomicfoundation/hardhat-chai-matchers";

describe("FundraiserFactory", function () {
    const fundraiserName = "Save The Leaves";
    const fundraiserImage = "https://picsum.photos/id/159/200/300";
    const fundraiserDescription = "Donate BNB to save the leaves!"
    const fundingGoal = "100"


    async function deployContractFixture() {
        const [factoryOwner, creator, beneficiary] = await ethers.getSigners();
        const contract = await ethers.deployContract("FundraiserFactory");
        await contract.waitForDeployment();
        return {contract, factoryOwner, creator, beneficiary};
    }

    describe("Deployment", function () {

        it("Should deploy the contract", async function () {
            const { contract } = await loadFixture(deployContractFixture);
            expect(contract.address).to.not.equal(0);
        });

        it("Should set the right owner", async function () {
            const { contract, factoryOwner } = await loadFixture(deployContractFixture);
            expect(await contract._factoryOwner()).to.equal(factoryOwner.address);
        });
    });

    describe("Fundraiser Creation", function () {

        it("Should create a fundraiser", async function () {
            const { beneficiary, contract } = await loadFixture(deployContractFixture);
            await contract.createFundraiser(
                fundraiserName,
                fundraiserImage,
                fundraiserDescription,
                fundingGoal,
                beneficiary.address,
            );
            expect(await contract._fundraisers(0)).to.not.equal(0);
        });

        it("Should emit a fundraiser created event", async function () {
            const { beneficiary, contract } = await loadFixture(deployContractFixture);
            await expect(contract.createFundraiser(
                fundraiserName,
                fundraiserImage,
                fundraiserDescription,
                fundingGoal,
                beneficiary.address,
            )).to.emit(contract, "FundraiserCreated");
        });
    });

    describe("Fundraiser Data Check", function () {
        it("Should check the fundraiser count", async function () {
            const { beneficiary, contract } = await loadFixture(deployContractFixture);
            await contract.createFundraiser(
                fundraiserName,
                fundraiserImage,
                fundraiserDescription,
                fundingGoal,
                beneficiary.address,
            );
            expect(await contract.getFundraisersCount()).to.equal(1);
        });
    });
});