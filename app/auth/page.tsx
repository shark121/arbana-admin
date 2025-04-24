"use client";
import { useState, useEffect } from "react";
import SignInComponent from "@/authentication/signInComponent";
import SignUpComponent from "@/authentication/signUpComponent";
import Link from "next/link";



export default function Auth() {
  const [hasAccount, setHasAccount] = useState(true);
 
  return (
    <div className="flex flex-col items-center justify-center ">
      {hasAccount ? <SignInComponent className="min-w-[50rem]" setHasAccount={setHasAccount}/> : <SignUpComponent />}
      <div className="text-[0.8rem] flex w-[15rem] cursor-pointer">
        {/* {hasAccount ? (
          <div className="w-full flex justify-between">
            <div onClick={() => setHasAccount(false)}>New here? Sign up</div>
            <Link
              className="text-blue-300"
              href={"/forgotPassword?verified=false"}
            >
              Forgot password?
            </Link>
          </div>
        ) : (
          <div onClick={() => setHasAccount(!hasAccount)} className="">
            Already have an account? sign in
          </div>
        )} */}
      </div>
    </div>
  );
}
