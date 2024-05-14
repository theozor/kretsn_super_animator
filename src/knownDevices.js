import { decimalToHex } from './helper';

// Vendor ID, Product ID
const knownDevices = {
  9114: {
    name: 'Adafruit Industries LLC',
    32782: 'Itsy Bitsy 5V 16MHz',
  },
  11914: {
    name: 'Raspberry Pi Foundation',
    266: 'Raspberry Pi Pico W',
  },
  6790: {
    name: 'Wemos',
    29987: 'Lolin32 Lite',
  },
};

function getKnownDevice(device) {
  if (knownDevices[device.usbVendorId]) {
    if (knownDevices[device.usbVendorId][device.usbProductId]) {
      return knownDevices[device.usbVendorId][device.usbProductId];
    }
    return `Device from ${
      knownDevices[device.usbVendorId].name
    } (${decimalToHex(device.usbProductId)})`;
  }

  return `Unknown USB device (${decimalToHex(
    device.usbVendorId,
  )}, ${decimalToHex(device.usbProductId)})`;
}

export default getKnownDevice;
