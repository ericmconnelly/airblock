import { assert } from 'chai';
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
          'Los Angeles',
          ['img1', 'img2'],
          price,
          'ETH'
        );

      receipt = await tx.wait();
    });

    it('should emit an `NewProperty` event', () => {
      const event = receipt.events.find((x: any) => x.event === 'NewProperty');
      assert(event, 'Event NewProperty not found!');
    });
  });

  describe('getAllProperties', async function (): Promise<void> {
    let airblock: any;

    before(async () => {
      const AirBlock = await ethers.getContractFactory('AirBlock');
      airblock = await AirBlock.deploy();
      await airblock.deployed();

      await airblock
        .connect(landlord)
        .listProperty(
          'property 1',
          'description 1',
          'location 1',
          ['img1', 'img2'],
          ethers.utils.parseEther('0.25'),
          'ETH'
        );

      await airblock
        .connect(landlord)
        .listProperty(
          'property 2',
          'description 2',
          'location 2',
          ['img1', 'img2'],
          ethers.utils.parseEther('0.05'),
          'ETH'
        );
    });

    it('should list all properties', async () => {
      let ex;
      let properties;

      try {
        properties = await airblock.getAllProperties();
      } catch (_ex) {
        ex = _ex;
      }

      assert(ex === undefined);
      assert(properties.length === 2);
    });
  });

  describe('getAllActiveProperties', async function (): Promise<void> {
    let airblock: any;

    before(async () => {
      const AirBlock = await ethers.getContractFactory('AirBlock');
      airblock = await AirBlock.deploy();
      await airblock.deployed();

      await airblock
        .connect(landlord)
        .listProperty(
          'property 1',
          'description 1',
          'location 1',
          ['img1', 'img2'],
          ethers.utils.parseEther('0.25'),
          'ETH'
        );

      await airblock
        .connect(landlord)
        .listProperty(
          'property 2',
          'description 2',
          'location 2',
          ['img1', 'img2'],
          ethers.utils.parseEther('0.05'),
          'ETH'
        );

      await airblock.connect(landlord).markPropertyAsInactive(0);
    });

    it('should list only active properties', async () => {
      let ex;
      let properties;

      try {
        properties = await airblock.connect(landlord).getAllActiveProperties();
      } catch (_ex) {
        ex = _ex;
      }

      assert(ex === undefined);
      assert(properties[0].name === 'property 2');
    });
  });

  describe('getPropertiesForOwner', async function (): Promise<void> {
    let airblock: any;
    const landlord1 = ethers.provider.getSigner(1);
    const landlord2 = ethers.provider.getSigner(2);

    before(async () => {
      const AirBlock = await ethers.getContractFactory('AirBlock');
      airblock = await AirBlock.deploy();
      await airblock.deployed();

      await airblock
        .connect(landlord1)
        .listProperty(
          'property 1',
          'description 1',
          'location 1',
          ['img1', 'img2'],
          ethers.utils.parseEther('0.25'),
          'ETH'
        );

      await airblock
        .connect(landlord1)
        .listProperty(
          'property 2',
          'description 2',
          'location 2',
          ['img1', 'img2'],
          ethers.utils.parseEther('0.05'),
          'ETH'
        );

      await airblock
        .connect(landlord2)
        .listProperty(
          'property 3',
          'description 3',
          'location 3',
          ['img1', 'img2'],
          ethers.utils.parseEther('0.08'),
          'ETH'
        );
    });

    it('should list all properties for landlord 1', async () => {
      let ex;
      let properties;

      try {
        properties = await airblock.connect(landlord1).getPropertiesForOwner();
      } catch (_ex) {
        ex = _ex;
      }

      assert(ex === undefined);
      assert(properties[0].name === 'property 1');
      assert(properties[1].name === 'property 2');
    });

    it('should list all properties for landlord 2', async () => {
      let ex;
      let properties;

      try {
        properties = await airblock.connect(landlord2).getPropertiesForOwner();
      } catch (_ex) {
        ex = _ex;
      }

      assert(ex === undefined);
      assert(properties[0].name === 'property 3');
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
          'Los Angeles',
          ['img1', 'img2'],
          ethers.utils.parseEther('0.25'),
          'ETH'
        );
    });

    it('should rent available property', async () => {
      const propertyId = 0;
      let ex: any;

      try {
        const tx = await airblock.rentProperty(
          propertyId,
          '2022-01-05',
          '2022-01-07',
          5,
          7
        );

        await tx.wait();
      } catch (_ex) {
        ex = _ex;
      }

      assert(ex === undefined);
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

  describe('deleteBooking', async function (): Promise<void> {
    let airblock: any;
    const tenant = ethers.provider.getSigner(2);

    before(async () => {
      const AirBlock = await ethers.getContractFactory('AirBlock');
      airblock = await AirBlock.deploy();
      await airblock.deployed();

      const tx1 = await airblock
        .connect(landlord)
        .listProperty(
          'Casa Koko',
          'Contemporary craft architecture on the beach',
          'Los Angeles',
          ['img1', 'img2'],
          ethers.utils.parseEther('0.25'),
          'ETH'
        );

      await tx1.wait();

      const tx2 = await airblock
        .connect(tenant)
        .rentProperty(0, '2022-01-04', '2022-01-09', 4, 9);

      await tx2.wait();
    });

    it('should delete booking property', async () => {
      const bookingId = 0;
      let ex: any;
      let allBookings;

      try {
        const tx = await airblock.connect(tenant).deleteBooking(bookingId);

        await tx.wait();
        allBookings = await airblock.getAllBookings();
      } catch (_ex) {
        ex = _ex;
      }

      assert(ex === undefined);
      assert(allBookings[0].isDeleted === true);
    });

    it('should revert if not the person make the booking booking property', async () => {
      const bookingId = 0;
      const tenant2 = ethers.provider.getSigner(3);
      let ex: any;

      try {
        const tx = await airblock.connect(tenant2).deleteBooking(bookingId);

        await tx.wait();
      } catch (_ex) {
        ex = _ex;
      }

      assert(ex !== undefined);
    });
  });

  describe('confirmBooking', async function (): Promise<void> {
    let airblock: any;
    const tenant = ethers.provider.getSigner(2);

    before(async () => {
      const AirBlock = await ethers.getContractFactory('AirBlock');
      airblock = await AirBlock.deploy();
      await airblock.deployed();

      const tx1 = await airblock
        .connect(landlord)
        .listProperty(
          'Casa Koko',
          'Contemporary craft architecture on the beach',
          'Los Angeles',
          ['img1', 'img2'],
          ethers.utils.parseEther('0.25'),
          'ETH'
        );

      await tx1.wait();

      const tx2 = await airblock
        .connect(tenant)
        .rentProperty(0, '2022-01-04', '2022-01-09', 4, 6);

      await tx2.wait();
    });

    it('should confirm booking property', async () => {
      const bookingId = 0;
      let ex: any;
      let allBookings;

      try {
        const tx = await airblock.connect(tenant).confirmBooking(bookingId, {
          value: ethers.utils.parseEther('0.5')
        });

        await tx.wait();
        allBookings = await airblock.getAllBookings();
      } catch (_ex) {
        ex = _ex;
      }
      assert(ex === undefined);
      assert(allBookings[0].isConfirmed === true);
    });

    it('should not confirm booking property if not the tenant made the booking', async () => {
      const bookingId = 0;
      let ex: any;
      const tenant5 = ethers.provider.getSigner(5);

      try {
        const tx = await airblock.connect(tenant5).confirmBooking(bookingId, {
          value: ethers.utils.parseEther('0.5')
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
          'Los Angeles',
          ['img1', 'img2'],
          price,
          'ETH'
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