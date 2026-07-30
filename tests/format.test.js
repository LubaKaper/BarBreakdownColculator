import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { fmtMoney, fmtInt } from "../js/utils/format.js";

describe("fmtMoney", () => {
  test("formats a typical amount with cents and a thousands separator", () => {
    assert.equal(fmtMoney(3607.5362318840577), "$3,607.54");
  });

  test("formats zero", () => {
    assert.equal(fmtMoney(0), "$0.00");
  });

  test("always shows exactly two decimal places", () => {
    assert.equal(fmtMoney(11.5), "$11.50");
    assert.equal(fmtMoney(12700), "$12,700.00");
  });
});

describe("fmtInt", () => {
  test("rounds up (ceil), not to nearest — the app always over-estimates drinks needed", () => {
    // this is a safety margin, not a rounding bug: 36.01 drinks/day should
    // read as 37, never 36, or the target would under-count.
    assert.equal(fmtInt(36.01), "37");
    assert.equal(fmtInt(36.99), "37");
  });

  test("exact integers pass through unchanged", () => {
    assert.equal(fmtInt(1100), "1,100");
  });

  test("any positive fraction, however small, rounds up to the next integer", () => {
    assert.equal(fmtInt(0.001), "1");
  });

  test("zero stays zero", () => {
    assert.equal(fmtInt(0), "0");
  });

  test("adds thousands separators", () => {
    assert.equal(fmtInt(1104.35), "1,105");
  });
});
