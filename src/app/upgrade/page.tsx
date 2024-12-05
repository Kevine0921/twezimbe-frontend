"use client";

import { FaCheck } from "react-icons/fa";
import { closePaymentModal, useFlutterwave } from "flutterwave-react-v3";
import { useLayoutEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetProfileData } from "@/api/auth";
import { useUpdateGroup } from "@/api/group";
import { IoChevronBackCircleOutline } from "react-icons/io5";
import Cookies from "js-cookie";

const Upgrade = () => {
  const [amount, setAmount] = useState<undefined | number>();
  const [free, setFree] = useState(false);
  const { currentUser } = useGetProfileData();
  const { updateGroup } = useUpdateGroup();

  const params = new URLSearchParams(useSearchParams());

  let groupId = params.get("groupId");
  let groupName = params.get("groupName");

  const router = useRouter();

  const config = {
    tx_ref: Date.now().toString(),
    amount: amount ?? 0,
    currency: "USD",
    public_key: "FLWPUBK_TEST-61fd8c76063ac4c81570ea26a682c719-X",
    customer: {
      email: currentUser?.email || "",
      phone_number: currentUser?.phone || "",
      name: `${currentUser?.firstName} ${currentUser?.lastName}`,
    },
    payment_options: "card,mobilemoney,ussd",

    customizations: {
      title: `${groupName || ""} Membership`,
      description: `Membership Payment for ${groupName} Group`,
      logo: "https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg",
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  useLayoutEffect(() => {
    if (!groupName || !groupId) {
      router.replace("/groups");
    }
  }, [groupName, groupId]);

  const handleSubmit = () => {
    handleFlutterPayment({
      callback: async (e: any) => {
        try {
          if (e.status === "successful") {
            console.log("paid successfully", e);

            await updateGroup({ group_id: groupId as string, upgraded: true });
            await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bf/upgrade`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${Cookies.get("access-token")}`,
                },
                body: JSON.stringify({
                  groupId,
                  userId: currentUser?._id,
                  plan: "basic",
                  amount,
                }),
              }
            );
            router.replace(`/groups/${groupId}`);

            setTimeout(() => {
              closePaymentModal();
              // window.location.reload();
            }, 3000);
          }
        } catch (error) {
          console.log(error);
        }
      },
      onClose: () => {},
    });
  };
  return (
    <div className=" flex items-start ">
      <div className="mx-auto p-10 sticky top-0 w-[45%]  flex-1 h-screen hidden lg:flex flex-col items-end justify-start rounded-md overflow-hidden">
        <div className=" flex w-full">
          <button className=" text-primary-bg" onClick={() => router.back()}>
            <IoChevronBackCircleOutline size={44} />
          </button>
        </div>
        <img src="/logo.png" className="object-contain" alt="signup" />
      </div>
      <div className=" w-[65%] bg-gray-50 min-h-screen items-start p-10 flex-col flex">
        <div className=" w-full mt-10 flex-col flex ">
          <div>
            <span className=" text-xl">SELECT PLAN</span>
          </div>

          <div className=" mt-5 grid grid-cols-2 max-w-[800px] gap-5">
            <button
              className={`border flex flex-col justify-between  transition-all duration-700  p-5 rounded-xl ${
                free ? " border-2 border-primary-bg" : "bg-gray-100 "
              }`}
              onClick={() => {
                setAmount(undefined);
                setFree(!free);
              }}
            >
              <div className=" flex  flex-col items-start">
                <div className=" text-2xl font-bold">
                  $0
                  <span className=" text-[12px] font-light "> / monthly</span>
                </div>
                <h4 className="mt-2 pb-5 text-xl font-semibold ">
                  Free Plan (Basic Features)
                </h4>
                <p className="text-[12px] pb-4">
                  Features included in this plan:
                </p>
                <ul className="text-[12px] text-start space-y-2">
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Create and join groups (max 100 people per group)
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Basic SACCO management (limited transactions)
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Limited crowdfunding campaigns (cap on funding)
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Full family tree functionality
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Standard support (email only)
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Limited storage (e.g., 1GB)
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Unlimited group features (chat, audio, video, etc.)
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Access to 3 months of message archive
                    </span>
                  </li>
                </ul>
              </div>
              <div className=" mt-10 w-full">
                <button
                  onClick={() => {
                    setAmount(undefined);
                    setFree(!free);
                  }}
                  className={` text-[12px]  transition-all duration-700  text--slate-400  w-full py-3 rounded-[12px] uppercase ${
                    free
                      ? "bg-primary-bg text-white"
                      : "border   text--slate-400   border-slate-400"
                  }`}
                >
                  {!free ? "Choose Plan" : "Selected"}
                </button>
              </div>
            </button>

            <button
              onClick={() => {
                setAmount(9.99);
                setFree(false);
              }}
              className={`border flex flex-col justify-between  transition-all duration-700  p-5 rounded-xl ${
                amount === 9.99 ? " border-2 border-primary-bg" : "bg-gray-100 "
              }`}
            >
              <div className=" flex  flex-col items-start">
                <span
                  className={` uppercase rounded-full p-2 justify-center items-center flex mx-auto text-[12px] px-4 ${
                    amount === 9.99
                      ? " text-white bg-primary-bg"
                      : "  border-primary-bg border "
                  }`}
                >
                  most Popular
                </span>
                <div className=" text-2xl font-bold">
                  $9.99
                  <span className=" text-[12px] font-light "> / monthly</span>
                </div>
                <h4 className="mt-2 pb-5 text-xl font-semibold ">
                  Standard Plan
                </h4>
                <p className="text-[12px] pb-4">
                  Features included in this plan:
                </p>
                <ul className="text-[12px] text-start space-y-2">
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Enhanced SACCO management (higher transaction limits,
                      advanced analytics)
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      More crowdfunding campaigns (higher funding cap)
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Full family tree functionality
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Priority support (email and chat)
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Increased storage (e.g., 10GB)
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Access to standard reports and analytics
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Unlimited group members
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Unlimited old messages archive access
                    </span>
                  </li>
                </ul>
              </div>
              <div className=" mt-10 w-full">
                <button
                  onClick={() => {
                    setAmount(9.99);
                    setFree(false);
                  }}
                  className={` text-[12px]  transition-all duration-700  text--slate-400  w-full py-3 rounded-[12px] uppercase ${
                    amount === 9.99
                      ? "bg-primary-bg text-white"
                      : "border   text--slate-400   border-slate-400"
                  }`}
                >
                  {amount !== 9.99 ? "Choose Plan" : "Selected"}
                </button>
              </div>
            </button>

            <button
              onClick={() => {
                setAmount(29.99);
                setFree(false);
              }}
              className={`border flex flex-col justify-between  transition-all duration-700  p-5 rounded-xl ${
                amount === 29.99
                  ? " border-2 border-primary-bg"
                  : "bg-gray-100 "
              }`}
            >
              <div className=" flex  flex-col items-start">
                <span
                  className={` uppercase rounded-full p-2 justify-center items-center flex mx-auto text-[12px] px-4 ${
                    amount === 29.99
                      ? " text-white bg-primary-bg"
                      : "  border-primary-bg border "
                  }`}
                >
                  Get the most
                </span>
                <div className=" text-2xl font-bold">
                  $29.99
                  <span className=" text-[12px] font-light "> / monthly</span>
                </div>
                <h4 className="mt-2 pb-5 text-xl font-semibold ">
                  Premium Plan
                </h4>
                <p className="text-[12px] pb-4">
                  Features included in this plan:
                </p>
                <ul className="text-[12px]  text-start space-y-2">
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      All features of the Standard Plan
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Unlimited SACCO transactions
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Unlimited crowdfunding campaigns
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Full family tree builder with advanced genealogical tools
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Premium support (24/7 phone support)
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">Unlimited storage</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Advanced reports and analytics
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Customizable group settings and branding
                    </span>
                  </li>
                </ul>
              </div>
              <div className="w-full mt-10">
                <button
                  onClick={() => {
                    setAmount(29.99);
                    setFree(false);
                  }}
                  className={`  text-[12px]  transition-all duration-700  text--slate-400  w-full py-3 rounded-[12px] uppercase ${
                    amount === 29.99
                      ? "bg-primary-bg text-white"
                      : "border   text--slate-400   border-slate-400"
                  }`}
                >
                  {amount !== 29.99 ? "Choose Plan" : "Selected"}
                </button>
              </div>
            </button>

            <button
              onClick={() => {
                setAmount(5000);
                setFree(false);
              }}
              className={`border flex flex-col justify-between  transition-all duration-700  p-5 rounded-xl ${
                amount === 5000 ? " border-2 border-primary-bg" : "bg-gray-100 "
              }`}
            >
              <div className=" flex  flex-col items-start">
                <h4 className="mt-2 pb-5 text-xl text-start font-semibold ">
                  Enterprise Plan for corporates
                </h4>
                <p className="text-[12px] pb-4">
                  Features included in this plan:
                </p>
                <ul className="text-[12px]  text-start space-y-2">
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      All features of the Premium Plan
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Dedicated account manager
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Custom integrations and API access
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      On-site training and support
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      SLA with guaranteed uptime and response times
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Advanced security features (e.g., SSO, advanced
                      encryption)
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Tailored solutions for large organizations
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FaCheck
                      size={20}
                      className=" min-w-[20px] text-primary-bg"
                    />
                    <span className=" text-[12px]">
                      Pay one price for all your members so they access all
                      premium features at no additional cost.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="w-full mt-10">
                <button
                  onClick={() => {
                    if (amount === 5000)
                      return router.push("/public_pages/faqs#contact-us");
                    setAmount(5000);
                    setFree(false);
                  }}
                  className={`  text-[12px]  transition-all duration-700  text--slate-400  w-full py-3 rounded-[12px] uppercase ${
                    amount === 5000
                      ? "bg-primary-bg text-white"
                      : "border   text--slate-400   border-slate-400"
                  }`}
                >
                  {amount !== 5000 ? "Choose Plan" : "Contact Us"}
                </button>
              </div>
            </button>
          </div>
        </div>

        {amount && amount !== 5000 && (
          <div className="  flex  max-w-[800px] w-full ">
            <button
              onClick={() => {
                handleSubmit();
              }}
              className=" w-full bg-primary-bg px-10 text-white py-4 rounded-xl mt-10 font-semibold"
            >
              Proceed to Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upgrade;
