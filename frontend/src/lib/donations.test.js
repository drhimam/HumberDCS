import {
  getDonationConfig,
  createDonationOrder,
  captureDonationOrder,
  getDonationStats,
} from "./donations";

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

test("getDonationConfig retrieves remote config successfully", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      configured: true,
      clientId: "test_paypal_client_id",
      currency: "CAD",
      environment: "live",
    }),
  });

  const config = await getDonationConfig();
  expect(config.configured).toBe(true);
  expect(config.clientId).toBe("test_paypal_client_id");
  expect(config.currency).toBe("CAD");
});

test("createDonationOrder sends proper payload and returns order id", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      ok: true,
      orderId: "ORDER-12345",
      amount: 15,
      currency: "CAD",
    }),
  });

  const result = await createDonationOrder({
    amount: 15,
    currency: "CAD",
    donorEmail: "supporter@example.com",
    donorName: "Jane Doe",
  });

  expect(result.orderId).toBe("ORDER-12345");
  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining("/api/donations/create-order"),
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        amount: 15,
        currency: "CAD",
        donorEmail: "supporter@example.com",
        donorName: "Jane Doe",
      }),
    })
  );
});

test("captureDonationOrder handles capture confirmation and error throws", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      ok: true,
      status: "completed",
      orderId: "ORDER-12345",
      captureId: "CAPTURE-67890",
      amount: "15.00",
      currency: "CAD",
    }),
  });

  const result = await captureDonationOrder({ orderId: "ORDER-12345" });
  expect(result.status).toBe("completed");
  expect(result.captureId).toBe("CAPTURE-67890");

  // Error case
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ error: "Capture failed" }),
  });

  await expect(captureDonationOrder({ orderId: "ORDER-FAIL" })).rejects.toThrow("Capture failed");
});

test("getDonationStats returns stats or null on failure", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ ok: true, totalDonations: 12, totalAmountCad: "180.00" }),
  });

  const stats = await getDonationStats();
  expect(stats.totalDonations).toBe(12);

  global.fetch.mockRejectedValueOnce(new Error("Network error"));
  const failedStats = await getDonationStats();
  expect(failedStats).toBeNull();
});
