"use client";
import { GroupContext } from "@/context/GroupContext";
import React, { useContext, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import LoadingButton from "@/components/LoadingButton";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { generateProfileID } from "@/utils/generateID";
import { countryCodes } from "@/constants";
import { useGetProfileData } from "@/api/auth";
import { useQuery } from "react-query";
import { getGroupBf } from "@/lib/bf";
import MainLoader from "@/components/MainLoader";

type Props = {};

interface FormData {
  fundName: string;
  fundDetails: string;
  accountType: "bank" | "mobile" | "wallet";
  bankName: string;
  bankAccountNumber: string;
  accountName: string;
  accountCurrency: string;
  accountInfo: string;
  walletAddress: string;
  countryCode: string;
  mobileNumber?: string;
}

function SettingInfo({}: Props) {
  const { selectedGroup: group } = useContext(GroupContext);
  const router = useRouter();
  const wallet = useRef("");
  const searchParams = useSearchParams();
  const { currentUser } = useGetProfileData();

  useEffect(() => {
    wallet.current = generateProfileID("");
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isLoading, isSubmitting },
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      fundName: group?.group_name || "",
      fundDetails: "",
      accountType: "bank",
      bankName: "",
      bankAccountNumber: "",
      accountName: "",
      accountCurrency: "",
      accountInfo: "",
      walletAddress: wallet.current,
      countryCode: "+256",
      mobileNumber: "",
    },
  });

  // Watch the accountType field to dynamically change validation
  const accountType = watch("accountType");

  // Watch the countryCode field
  const countryCode = watch("countryCode");



  const { data , isLoading: isLoadingData} = useQuery({
    queryFn: () => getGroupBf(group?._id || ""),
    queryKey: [`${group?._id} - group-bf`],
    enabled: !!group?._id,
  });

  console.log(data, "group-data");

  const onSubmit = async (values: FormData) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bf/${data?.fund?._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("access-token")}`,
          },
          body: JSON.stringify({ ...values, groupId: group?._id }),
        }
      );
      const results = await res.json();
      if (!results.status)
        throw new Error(results.error || results.errors || results.message);
      toast.success("Fund Edited successfully. redirecting ...");
      if (searchParams.get("admin") === "true") {
        router.push(`/manager_pages/bfs`);
      } else {
        router.push(`/groups/${group?._id}`);
      }
    } catch (error: any) {
      console.error("Error creating fund:", error);
      toast.error(error.message || "Something went wrong.Please try again");
    }
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountryCode = e.target.value;
    setValue("countryCode", selectedCountryCode);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (/^\d*$/.test(input)) {
      // Allows only digits
      setValue("mobileNumber", input);
    }
  };


  useEffect(() => {
    if (data?.fund) {
      setValue("fundName", group?.group_name || "");
      setValue("fundDetails", data?.fund?.fundDetails);
      setValue("accountType", data?.fund?.accountType || "bank");
      setValue("bankName", data?.fund?.bankName || "");
      setValue("bankAccountNumber", data?.fund?.bankAccountNumber || "");
      setValue("accountName", data?.fund?.accountName || "");
      setValue("accountCurrency", data?.fund?.accountCurrency || "");
      setValue("accountInfo", data?.fund?.accountInfo || "");
      setValue("walletAddress", wallet.current);
      setValue("countryCode", data?.fund?.countryCode || "");
      setValue("mobileNumber", data?.fund?.mobileNumber || "");
    }
  }, [data]);


  if (isLoadingData) return <MainLoader />;

  return (
    <div className=" min-h-screen flex flex-col text-black items-center py-10 px-6 overflow-auto">
      <h1 className="text-3xl text-white md:text-4xl font-bold mb-6 text-center">
        Edit Bereavement Fund for {group?.group_name}
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-lg bg-gray-50 p-8 rounded-lg shadow-md space-y-6"
      >
        {/* Fund Name */}
        <div>
          <label
            className="block text-black text-sm font-semibold mb-2"
            htmlFor="fundName"
          >
            Name of Fund
          </label>
          <input
            type="text"
            id="fundName"
            {...register("fundName", { required: "Fund name is required" })}
            className={`w-full px-4 py-2 border ${
              errors.fundName ? "border-red-500" : "border-gray-300"
            } rounded-md focus:border-blue-800 focus:ring focus:ring-blue-200`}
            placeholder="Enter fund name"
          />
          {errors.fundName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.fundName.message}
            </p>
          )}
        </div>

        {/* Account Type Selection */}
        <div>
          <label className="block text-black text-sm font-semibold mb-2">
            Account Type
          </label>
          <select
            {...register("accountType")}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-blue-800 focus:ring focus:ring-blue-200"
          >
            <option value="bank">Bank Account</option>
            <option value="mobile">Mobile Money Account</option>
            {/* <option value="wallet">BF Virtual Wallet</option> */}
          </select>
        </div>

        {accountType === "bank" ? (
          <>
            <div>
              <label
                className="block text-black text-sm font-semibold mb-2"
                htmlFor="bankName"
              >
                Bank Name
              </label>
              <input
                type="text"
                id="bankName"
                {...register("bankName", { required: "Bank name is required" })}
                className={`w-full px-4 py-2 border ${
                  errors.bankName ? "border-red-500" : "border-gray-300"
                } rounded-md focus:border-blue-800 focus:ring focus:ring-blue-200`}
                placeholder="Enter bank name"
              />
              {errors.bankName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.bankName.message}
                </p>
              )}
            </div>

            {/* Bank Account Number */}
            <div>
              <label
                className="block text-black text-sm font-semibold mb-2"
                htmlFor="bankAccountNumber"
              >
                Bank Account Number
              </label>
              <input
                type="text"
                id="bankAccountNumber"
                {...register("bankAccountNumber", {
                  required: "Bank account number is required",
                })}
                className={`w-full px-4 py-2 border ${
                  errors.bankAccountNumber
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:border-blue-800 focus:ring focus:ring-blue-200`}
                placeholder="Enter bank account number"
              />
              {errors.bankAccountNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.bankAccountNumber.message}
                </p>
              )}
            </div>

            {/* Account Name */}
            <div>
              <label
                className="block text-black text-sm font-semibold mb-2"
                htmlFor="accountName"
              >
                Account Name
              </label>
              <input
                type="text"
                id="accountName"
                {...register("accountName", {
                  required: "Account name is required",
                })}
                className={`w-full px-4 py-2 border ${
                  errors.accountName ? "border-red-500" : "border-gray-300"
                } rounded-md focus:border-blue-800 focus:ring focus:ring-blue-200`}
                placeholder="Enter account name"
              />
              {errors.accountName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.accountName.message}
                </p>
              )}
            </div>

            {/* Account Currency */}
            <div>
              <label
                className="block text-black text-sm font-semibold mb-2"
                htmlFor="accountCurrency"
              >
                Account Currency
              </label>
              <input
                type="text"
                id="accountCurrency"
                {...register("accountCurrency", {
                  required: "Account currency is required",
                })}
                className={`w-full px-4 py-2 border ${
                  errors.accountCurrency ? "border-red-500" : "border-gray-300"
                } rounded-md focus:border-blue-800 focus:ring focus:ring-blue-200`}
                placeholder="Enter account currency"
              />
              {errors.accountCurrency && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.accountCurrency.message}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <div>
              <label
                className="block text-black text-sm font-semibold mb-2"
                htmlFor="accountName"
              >
                Mobile Money Name
              </label>
              <input
                type="text"
                id="accountName"
                {...register("accountName", {
                  required: "Mobile money name is required",
                })}
                className={`w-full px-4 py-2 border ${
                  errors.accountName ? "border-red-500" : "border-gray-300"
                } rounded-md focus:border-blue-800 focus:ring focus:ring-blue-200`}
                placeholder="Enter mobile money Name"
              />
              {errors.accountName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.accountName.message}
                </p>
              )}
            </div>

            <div>
              <div className="w-full flex cursor-pointer border-2  rounded-md">
                <select
                  className="text-black rounded-l-md pl-3"
                  defaultValue={"+256"}
                  value={countryCode}
                  onChange={handleCountryCodeChange}
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.value}>
                      {country.label} ({country.code})
                    </option>
                  ))}
                </select>
                <input
                  className="text-black p-2 rounded-r w-full"
                  type="text"
                  maxLength={10}
                  id="mobileNumber"
                  placeholder="Enter mobile phone number"
                  // value={payForm.data.phone}
                  {...register("mobileNumber", {
                    required: "Mobile Number name is required",
                  })}
                  defaultValue={currentUser?.phone}
                  onChange={handlePhoneChange}
                />
              </div>
              {errors.mobileNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.mobileNumber.message}
                </p>
              )}
            </div>
          </>
        )}

        <div>
          <label
            className="block text-black text-sm font-semibold mb-2"
            htmlFor="fundDetails"
          >
            Fund Details
          </label>
          <textarea
            id="fundDetails"
            {...register("fundDetails", {
              required: "Fund details are required",
            })}
            className={`w-full px-4 py-2 border ${
              errors.fundDetails ? "border-red-500" : "border-gray-300"
            } rounded-md focus:border-blue-800 focus:ring focus:ring-blue-200`}
            placeholder="Enter fund details"
            rows={4}
          />
          {errors.fundDetails && (
            <p className="text-red-500 text-sm mt-1">
              {errors.fundDetails.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="text-center">
          {isLoading || isSubmitting ? (
            <LoadingButton />
          ) : (
            <button
              type="submit"
              className="w-full bg-orange-500 text-white font-semibold py-3 rounded-md hover:bg-orange-600 transition duration-200"
            >
              Save
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default SettingInfo;
