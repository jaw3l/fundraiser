import { ethers } from "hardhat";
import { expect } from "chai";
import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import "@nomicfoundation/hardhat-chai-matchers";

describe("Fundraiser", function () {

    const fundraiserName = "Save The Leaves";
    const fundraiserImage = "https://picsum.photos/id/159/200/300";
    const fundraiserDescription = "Donate BNB to save the leaves!"
    const fundingGoal = "100"

    async function deployContractFixture() {
        const [factoryOwner, creator, beneficiary] = await ethers.getSigners();
        const Fundraiser = await ethers.getContractFactory("Fundraiser");
        const contract = await Fundraiser
            .deploy(
                fundraiserName,
                fundraiserImage,
                fundraiserDescription,
                fundingGoal,
                factoryOwner.address,
                creator.address,
                beneficiary.address,
            );
        await contract.waitForDeployment();
        return { factoryOwner, creator, beneficiary, fundraiser: contract };
    }

    describe("Deployment", function () {

        it("Should set the right owner", async function () {
            const { creator, fundraiser } = await loadFixture(deployContractFixture);
            expect(await fundraiser.owner()).to.equal(creator.address);
        });

        it("Should set the right beneficiary", async function () {
            const { beneficiary, fundraiser } = await loadFixture(deployContractFixture);
            expect(await fundraiser.beneficiary()).to.equal(beneficiary.address);
        });

        it("Should set the right factory owner", async function () {
            const { factoryOwner, fundraiser } = await loadFixture(deployContractFixture);
            expect(await fundraiser.factoryOwner()).to.equal(factoryOwner.address);
        });
    });

    describe("Data Check", function () {
        it("Should set the right title", async function () {
            const { fundraiser } = await loadFixture(deployContractFixture);
            expect(await fundraiser.title()).to.equal(fundraiserName);
        });

        it("Should set the right image url", async function () {
            const { fundraiser } = await loadFixture(deployContractFixture);
            expect(await fundraiser.image()).to.equal(fundraiserImage);
        });

});