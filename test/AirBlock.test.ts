import { expect, assert } from 'chai';
import { ethers } from 'hardhat';

describe('AirBlock', function (): void {
  const tenant = ethers.provider.getSigner(0);
  const landlord = ethers.provider.getSigner(1);

  beforeEach(async () => {
    const AirBlock = await ethers.getContractFactory('AirBlock');
    const airblock = await AirBlock.deploy();
    await airblock.deployed();
  });

  describe('listProperty', async function (): Promise<void> {
    let receipt: any;

    before(async () => {
      const AirBlock = await ethers.getContractFactory('AirBlock');
      const airblock = await AirBlock.deploy();
      await airblock.deployed();

      const price = ethers.utils.parseEther('0.25');

      const tx = await airblock
        .connect(landlord)
        .listProperty(
          'Casa Koko',
          'Contemporary craft architecture on the beach',
          price
        );

      receipt = await tx.wait();
    });

    it('should emit an `NewProperty` event', () => {
      const event = receipt.events.find((x: any) => x.event === 'NewProperty');
      assert(event, 'Event NewProperty not found!');
    });
  });

  describe('rentProperty', async function (): Promise<void> {
    const tenant = ethers.provider.getSigner(0);
    let airblock: any;

    before(async () => {
      const AirBlock = await ethers.getContractFactory('AirBlock');
      airblock = await AirBlock.deploy();
      await airblock.deployed();

      await airblock
        .connect(landlord)
        .listProperty(
          'Casa Koko',
          'Contemporary craft architecture on the beach',
          ethers.utils.parseEther('0.25')
        );
    });

    it('should revert if trying to book non-existent property', async () => {
      const propertyId = 2;
      let ex: any;

      try {
        const tx = await airblock.rentProperty(propertyId, 5, 7, {
          value: ethers.utils.parseEther('0.5'),
          from: tenant.getAddress()
        });

        await tx.wait();
      } catch (_ex) {
        ex = _ex;
      }

      assert(ex !== undefined);
    });

    it('should revert if trying to book non-available property', async () => {
      const propertyId = 0;
      let ex: any;
      let tx;

      tx = await airblock.rentProperty(propertyId, 5, 7, {
        value: ethers.utils.parseEther('0.5'),
        from: tenant.getAddress()
      });

      tx.wait();

      try {
        tx = await airblock.rentProperty(propertyId, 5, 7, {
          value: ethers.utils.parseEther('0.5'),
          from: tenant.getAddress()
        });

        await tx.wait();
      } catch (_ex) {
        ex = _ex;
      }

      assert(ex !== undefined);
    });

    it('should revert if trying to book property with insufficient value', async () => {
      const propertyId = 0;
      let ex: any;
      let tx;

      try {
        tx = await airblock.rentProperty(propertyId, 5, 7, {
          value: ethers.utils.parseEther('0.1'),
          from: tenant.getAddress()
        });

        await tx.wait();
      } catch (_ex) {
        ex = _ex;
      }

      assert(ex !== undefined);
    });
  });

  describe('markPropertyAsInactive', async function (): Promise<void> {
    let airblock: any;

    before(async () => {
      const AirBlock = await ethers.getContractFactory('AirBlock');
      airblock = await AirBlock.deploy();
      await airblock.deployed();

      const price = ethers.utils.parseEther('0.25');

      const tx = await airblock
        .connect(landlord)
        .listProperty(
          'Casa Koko',
          'Contemporary craft architecture on the beach',
          price
        );

      await tx.wait();
    });

    it('should revert if non-owner trying to mark property as inactive', async function (): Promise<void> {
      let ex;

      try {
        const tx = await airblock.connect(tenant).markPropertyAsInactive(0);
        await tx.wait();
      } catch (_ex) {
        ex = _ex;
      }

      assert(ex !== undefined);
    });

    it('should be able to mark property as inactive', async function (): Promise<void> {
      const tx = await airblock.connect(landlord).markPropertyAsInactive(0);
      await tx.wait();
    });
  });
});

// async function assertThrows(promise: any, msg: string | undefined) {
//   let ex;
//   try {
//     await promise;
//   } catch (_ex) {
//     console.log('_ex', _ex);
//     ex = _ex;
//   }
//   assert(ex, msg);
// }
