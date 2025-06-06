"use client";
import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import useGetBusinessByUser from "@/hooks/getBusinessbyUser";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
type PaymentFormProps = {
  title: string;
  description: string;
  amount: number;
};

export default function PaymentForm() {
  const { business } = useGetBusinessByUser();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [usdValue, setUsdValue] = useState<number | null>(null);
  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      amount: 0,
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      description: Yup.string().required("Description is required"),
      amount: Yup.number()
        .required("Amount is required")
        .positive("Amount must be positive")
        .min(10000, "Minimum amount is 10000 IDRX"),
    }),
    onSubmit: handleSubmit,
  });

  // Fetch exchange rate on mount
  useEffect(() => {
    async function fetchRate() {
      try {
        const res = await fetch(
          "https://api.exchangerate-api.com/v4/latest/IDR"
        );
        const data = await res.json();
        setExchangeRate(data.rates.USD);
      } catch {
        setExchangeRate(null);
      }
    }
    fetchRate();
  }, []);

  // Calculate IDR per USD
  const idrPerUsd = exchangeRate ? 1 / exchangeRate : null;

  // Update USD value when amount or rate changes
  useEffect(() => {
    if (exchangeRate && formik.values.amount > 0) {
      setUsdValue(formik.values.amount * exchangeRate);
    } else {
      setUsdValue(null);
    }
  }, [formik.values.amount, exchangeRate]);

  async function handleSubmit(values: PaymentFormProps) {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment-link/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            business_id: business?.id,
            title: values.title,
            description: values.description,
            amount: values.amount,
          }),
        }
      );
      const data = await response.json();
      console.log(data);
      toast.success("Payment link created successfully", {
        action: (
          <Link href={`/pay/${data.data.id}`} target="_blank">
            <Button>View link</Button>
          </Link>
        ),
      });
      setOpen(false); // Optionally close dialog on submit
      formik.resetForm();
    } finally {
      setLoading(false);
    }
  }

  function handleDialogChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) {
      formik.resetForm();
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleDialogChange}>
      <AlertDialogTrigger asChild>
        <Button size={"sm"}>
          <Plus /> Create link
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create a payment link</AlertDialogTitle>
          <AlertDialogDescription>
            Create a payment link to receive crypto payments for anything
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="example: Logo Design"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={!!(formik.touched.title && formik.errors.title)}
              aria-describedby="title-error"
            />
            {formik.touched.title && formik.errors.title && (
              <p id="title-error" className="text-destructive text-sm">
                {formik.errors.title}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              type="text"
              placeholder="example: Logo design for company website - 2 revisions included"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={
                !!(formik.touched.description && formik.errors.description)
              }
              aria-describedby="description-error"
            />
            {formik.touched.description && formik.errors.description && (
              <p id="description-error" className="text-destructive text-sm">
                {formik.errors.description}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Amount (IDRX)</Label>
            <div className="flex items-center gap-2 max-w-60 relative">
              <Input
                id="amount"
                name="amount"
                type="number"
                min={1}
                placeholder="example: 100"
                value={formik.values.amount === 0 ? "" : formik.values.amount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={!!(formik.touched.amount && formik.errors.amount)}
                aria-describedby="amount-error"
              />
              <Avatar className="absolute right-0">
                <AvatarImage src="/images/idrx.svg" />
                <AvatarFallback>IDRX</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-sm text-muted-foreground">
              {idrPerUsd
                ? `$1 = ${idrPerUsd.toLocaleString()} IDRX`
                : "Loading rate..."}
            </span>
            {formik.touched.amount && formik.errors.amount && (
              <p id="amount-error" className="text-destructive text-sm">
                {formik.errors.amount}
              </p>
            )}
          </div>
          <section>
            <h3 className="text-sm font-medium">
              Recieve{" "}
              <strong>
                {" "}
                {usdValue !== null
                  ? ` $${usdValue.toLocaleString()}`
                  : "$ 0"}{" "}
                USD
              </strong>
            </h3>
          </section>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Continue"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
