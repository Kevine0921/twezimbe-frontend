"use client";
import { useRouter } from "next/navigation";
import { IoChevronBackCircleOutline } from "react-icons/io5";

const StepOne = () => {
  const router = useRouter();
  return (
    <div className=" flex items-start ">
      <div className=" w-[40%] p-10 pr-24">
        <div className=" flex w-full">
          <button className=" text-primary-bg" onClick={() => router.back()}>
            <IoChevronBackCircleOutline size={26} />
          </button>
        </div>
        <img
          src="/logo.png"
          className="object-contain w-auto mb-20 h-[40px] "
          alt="signup"
        />

        <div className=" font-light">1 of 5</div>

        <div>
          <h4 className="  my-10 text-5xl font-semibold">
            Tell us who you're raising funds for
          </h4>
          <p>
            This information helps us get to knoe you and your fundraising
            needs.
          </p>
        </div>
      </div>

      <div className=" flex-1 h-screen flex flex-col bg-gray-200"></div>
    </div>
  );
};

export default StepOne;
