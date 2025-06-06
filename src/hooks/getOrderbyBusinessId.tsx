"use client";
import React from "react";

export type OrderItem = {
  id: string;
  order_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
};

export type Order = {
  id: string;
  client_id: string;
  chain_id: number;
  destination_address_wallet: string;
  sender_address_wallet: string | null;
  total_price: number;
  expired_at: string;
  payment_url: string;
  success_url: string;
  status_message: string;
  transaction_hash: string | null;
  created_at: string;
  updated_at: string;
  business_id: string;
  items: OrderItem[];
};

export default function useGetOrderbyBusinessId(
  business_id: string | undefined
) {
  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!business_id) return; // Only fetch if business_id is valid
    const fetchBusiness = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/order/business/${business_id}`,
          {
            cache: "no-store",
          }
        );
        const data = await response.json();
        setOrder(data.data);
        setLoading(false);
      } catch (error) {
        setError(error as Error);
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [business_id]);

  return { order, loading, error };
}
