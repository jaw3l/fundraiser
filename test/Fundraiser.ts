import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import "@nomicfoundation/hardhat-chai-matchers";

describe("Fundraiser", function () {

    const fundraiserName = "Save The Leaves";
    const fundraiserImage = "https://picsum.photos/id/159/200/300";
    const fundraiserDescription = "Donate BNB to save the leaves!"
    const fundingGoal = ethers.parseEther("100");

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

        it("set the right owner", async function () {
            const { creator, fundraiser } = await loadFixture(deployContractFixture);
            expect(await fundraiser.owner()).to.equal(creator.address);
        });

        it("set the right beneficiary", async function () {
            const { beneficiary, fundraiser } = await loadFixture(deployContractFixture);
            expect(await fundraiser.beneficiary()).to.equal(beneficiary.address);
        });

        it("set the right factory owner", async function () {
            const { factoryOwner, fundraiser } = await loadFixture(deployContractFixture);
            expect(await fundraiser.factoryOwner()).to.equal(factoryOwner.address);
        });
    });

    describe("Data Check", function () {
        it("set the right title", async function () {
            const { fundraiser } = await loadFixture(deployContractFixture);
            expect(await fundraiser.title()).to.equal(fundraiserName);
        });

        it("set the right image url", async function () {
            const { fundraiser } = await loadFixture(deployContractFixture);
            expect(await fundraiser.image()).to.equal(fundraiserImage);
        });

        it("set the right description", async function () {
            const { fundraiser } = await loadFixture(deployContractFixture);
            expect(await fundraiser.description()).to.equal(fundraiserDescription);
        });

        it("set the right funding goal", async function () {
            const { fundraiser } = await loadFixture(deployContractFixture);
            expect(await fundraiser.donationGoal()).to.equal(fundingGoal);
        });
    });

    describe("Manage Fundraiser", function () {
        it("update the beneficiary", async function () {
            const { factoryOwner, beneficiary, fundraiser } = await loadFixture(deployContractFixture);
            const newBeneficiary = factoryOwner.address;
            // Since beneficiary is "Priveleged" it be able to update the beneficiary
            await fundraiser.connect(beneficiary).updateBeneficiary(newBeneficiary);
            expect(await fundraiser.beneficiary()).to.equal(newBeneficiary);
        });

        it("update the title", async function () {
            const { factoryOwner, fundraiser } = await loadFixture(deployContractFixture);
            const newTitle = "New Title";
            await fundraiser.connect(factoryOwner).updateTitle(newTitle);
            expect(await fundraiser.title()).to.equal(newTitle);
        });

        it("update the image", async function () {
            const { factoryOwner, fundraiser } = await loadFixture(deployContractFixture);
            const newImage = "New Image";
            await fundraiser.connect(factoryOwner).updateImage(newImage);
            expect(await fundraiser.image()).to.equal(newImage);
        });

        it("update the description", async function () {
            const { factoryOwner, fundraiser } = await loadFixture(deployContractFixture);
            const newDescription = "New Description";
            await fundraiser.connect(factoryOwner).updateDescription(newDescription);
            expect(await fundraiser.description()).to.equal(newDescription);
        });

        it("update the donation goal", async function () {
            const { factoryOwner, fundraiser } = await loadFixture(deployContractFixture);
            const newGoal = ethers.parseEther("10");
            await fundraiser.connect(factoryOwner).updateDonationGoal(newGoal);
            expect(await fundraiser.donationGoal()).to.equal(newGoal);
        });
    });

    describe("Donations", function () {
        it("make donations", async function () {
            const { fundraiser, factoryOwner } = await loadFixture(deployContractFixture);
            const donationAmount = ethers.parseEther("1");
            const donationTx = await fundraiser.connect(factoryOwner).donate({ value: donationAmount });
            await donationTx.wait();
            expect(await fundraiser.getDonationCount()).to.equal(1);
        });

        it("update user donation count", async function () {
            const { fundraiser, factoryOwner } = await loadFixture(deployContractFixture);
            const donationAmount = ethers.parseEther("1");
            const donationTx = await fundraiser.connect(factoryOwner).donate({ value: donationAmount });
            await donationTx.wait();
            expect(await fundraiser.connect(factoryOwner).getUserDonationCount()).to.equal(1);
        });

        it("include the donation in donations mapping", async function () {
            const { fundraiser, factoryOwner } = await loadFixture(deployContractFixture);
            const donationAmount = ethers.parseEther("1");
            const donationTx = await fundraiser.connect(factoryOwner).donate({ value: donationAmount });
            await donationTx.wait();
            const [amounts, donatedAt] = await fundraiser.getUserDonations();
            expect(amounts.length).to.equal(1);
            expect(amounts[0]).to.equal(donationAmount);
            const currentTimestamp = Math.floor(Date.now() / 1000);
            // 5 seconds to account for the time it takes to run the test
            expect(donatedAt[0]).to.be.closeTo(currentTimestamp, 5);
        });

        it("emit a donation event", async function () {
            const { fundraiser, factoryOwner } = await loadFixture(deployContractFixture);
            const donationAmount = ethers.parseEther("1");
            await expect(fundraiser.connect(factoryOwner).donate({ value: donationAmount })).to.emit(fundraiser, "DonationReceived");
        });

        it("don't allow donations if the donation value exceeds goal", async function () {
            const { fundraiser, factoryOwner } = await loadFixture(deployContractFixture);
            const newDonationGoal = ethers.parseEther("1");
            const donationAmount = ethers.parseEther("10");
            await fundraiser.connect(factoryOwner).updateDonationGoal(newDonationGoal);
            await expect(fundraiser.connect(factoryOwner).donate({ value: donationAmount })).to.be.revertedWith("Value exceeds donation goal")
        });
    });

    describe("Withdrawal", function () {
        it("don't allow to withdraw donations if the fundraiser is not complete", async function () {
            const { fundraiser, factoryOwner, beneficiary } = await loadFixture(deployContractFixture);
            const donationAmount = ethers.parseEther("1");
            await fundraiser.updateBeneficiary(beneficiary.address);
            await fundraiser.connect(factoryOwner).donate({ value: donationAmount });
            await expect(fundraiser.connect(beneficiary).withdraw()).to.be.revertedWith("Pausable: not paused");
        });

        it("allow to withdraw donations if the fundraiser is complete", async function () {
            const { fundraiser, factoryOwner, beneficiary } = await loadFixture(deployContractFixture);
            const donationAmount = ethers.parseEther("100");
            await fundraiser.updateBeneficiary(beneficiary.address);
            await fundraiser.connect(factoryOwner).donate({ value: donationAmount });
            await expect(fundraiser.connect(beneficiary).withdraw()).not.to.be.revertedWith("Pausable: not paused");
            expect(await fundraiser.totalTokenDonated()).to.equal(donationAmount);
        });

        it("don't allow to withdraw donations if withrawer is not the beneficiary", async function () {
            const { fundraiser, factoryOwner, beneficiary } = await loadFixture(deployContractFixture);
            const donationAmount = ethers.parseEther("100");
            await fundraiser.updateBeneficiary(beneficiary.address);
            await fundraiser.connect(factoryOwner).donate({ value: donationAmount });
            const regex = new RegExp(/AccessControl: account .* is missing role .*/);
            await expect(fundraiser.connect(factoryOwner).withdraw()).to.be.revertedWith(regex);
        });

        it("transfer the funds to the beneficiary", async function () {
            const { fundraiser, factoryOwner, beneficiary } = await loadFixture(deployContractFixture);
            const beneficiaryBalanceBefore = await ethers.provider.getBalance(beneficiary.address);
            const donationAmount = ethers.parseEther("100");
            await fundraiser.updateBeneficiary(beneficiary.address);
            await fundraiser.connect(factoryOwner).donate({ value: donationAmount });
            await fundraiser.connect(beneficiary).withdraw();
            expect(await ethers.provider.getBalance(beneficiary.address)).to.be.above(beneficiaryBalanceBefore);
        });
    });
});