"use client";
import React from "react";
import { useAccount } from "wagmi";
import DisconnectPage from "@/components/layouts/DisconnectPage";
import BoxNavigation from "@/components/layouts/dashboard/home/BoxNavigation";
import BalanceUser from "@/components/layouts/dashboard/home/BalanceUser";
import ChartBalance from "@/components/layouts/dashboard/home/ChartBalance";
import RecentPayments from "@/components/layouts/dashboard/home/RecentPayments";
import RecentOrders from "@/components/layouts/dashboard/home/RecentOrders";
import UserForm from "@/components/layouts/UserForm";
import BusinessForm from "@/components/layouts/BusinessForm";
import useGetUsers from "@/hooks/getUsers";
import useGetBusinessByUser from "@/hooks/getBusinessbyUser";
import GreetingText from "@/components/layouts/dashboard/home/GreetingText";
import RecentPaymentLinks from "@/components/layouts/dashboard/home/RecentPaymentLinks";
import Rebalancing from "../../components/Rebalancing";

export default function Page() {
  const { address } = useAccount();
  const { users } = useGetUsers();
  const { business } = useGetBusinessByUser();

  if (!address) {
    return <DisconnectPage />;
  }
  if (address && !users?.id) {
    return <UserForm />;
  }
  if (address && users?.id && !business?.id) {
    return <BusinessForm />;
  }
  if (address && users?.id && business?.id) {
    return (
      <main className="space-y-5">
        <BoxNavigation />
        <GreetingText />
        <BalanceUser />
        <Rebalancing />
        <ChartBalance />
        <RecentPaymentLinks />
        <RecentPayments />
        <RecentOrders />
      </main>
    );
  }
}
