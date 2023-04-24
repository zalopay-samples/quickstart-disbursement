const helpers = require('./helpers');

describe('formatVND', () => {
  test('formats integers correctly', () => {
    expect(helpers.formatVND(1000)).toEqual('1,000');
    expect(helpers.formatVND(1000000)).toEqual('1,000,000');
    expect(helpers.formatVND(123456789)).toEqual('123,456,789');
  });

  test('formats floats correctly', () => {
    expect(helpers.formatVND(1000.5)).toEqual('1,000.5');
    expect(helpers.formatVND(1000000.123)).toEqual('1,000,000.123');
    expect(helpers.formatVND(123456789.9876543)).toEqual('123,456,789.9876543');
  });
});

describe('validatePhone', () => {
  test('returns error message for empty phone number', () => {
    expect(helpers.validatePhone('')).toEqual('Phone number is required');
  });

  test('returns error message for non-numeric phone number', () => {
    expect(helpers.validatePhone('abcd')).toEqual('Phone must be a number');
  });

  test('returns error message for phone number with incorrect length', () => {
    expect(helpers.validatePhone('123456789')).toEqual('Phone number must be 10 digits');
  });

  test('returns empty string for valid phone number', () => {
    expect(helpers.validatePhone('0123456789')).toEqual('');
  });
});

describe('validateAmount', () => {
  test('returns error message for empty amount', () => {
    expect(helpers.validateAmount('')).toEqual('Amount is required');
  });

  test('returns error message for non-numeric amount', () => {
    expect(helpers.validateAmount('abcd')).toEqual('Amount must be a number');
  });

  test('returns error message for negative amount', () => {
    expect(helpers.validateAmount('-1')).toEqual('Amount must be greater than zero');
  });

  test('returns error message for zero amount', () => {
    expect(helpers.validateAmount('0')).toEqual('Amount must be greater than zero');
  });

  test('returns empty string for valid amount', () => {
    expect(helpers.validateAmount('1000')).toEqual('');
  });
});