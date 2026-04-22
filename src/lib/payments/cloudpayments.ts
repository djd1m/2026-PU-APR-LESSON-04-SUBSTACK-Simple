const API_URL = "https://api.cloudpayments.ru";

export interface CloudPaymentsWidgetConfig {
  publicId: string;
  description: string;
  amount: number;
  currency: string;
  accountId: string;
  data: {
    subscriptionId: string;
    cloudPayments: {
      recurrent: {
        interval: string;
        period: number;
      };
    };
  };
}

export function getWidgetConfig(
  publicId: string,
  amount: number,
  description: string,
  accountId: string,
  subscriptionId: string,
  plan: "MONTHLY" | "YEARLY"
): CloudPaymentsWidgetConfig {
  return {
    publicId,
    description,
    amount: amount / 100, // kopecks → rubles
    currency: "RUB",
    accountId,
    data: {
      subscriptionId,
      cloudPayments: {
        recurrent: {
          interval: plan === "MONTHLY" ? "Month" : "Year",
          period: 1,
        },
      },
    },
  };
}

export async function cancelRecurrent(subscriptionId: string) {
  const apiSecret = process.env.CLOUDPAYMENTS_API_SECRET;
  if (!apiSecret) throw new Error("CLOUDPAYMENTS_API_SECRET not set");

  const res = await fetch(`${API_URL}/subscriptions/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`:${apiSecret}`).toString("base64")}`,
    },
    body: JSON.stringify({ Id: subscriptionId }),
  });

  return res.json();
}
