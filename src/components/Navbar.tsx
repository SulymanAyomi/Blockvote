"use client";
// import { useOpenLoginModal } from "@/features/auth/hook/use-login";
import { cn } from "@/lib/utils";
import { MenuIcon, UserCircleIcon, WalletMinimalIcon } from "lucide-react";
// import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { UserButton } from "./user-button";

interface NavbarProps {
  className: string;
}
export const Navbar = () => {
  // const { open, close } = useOpenLoginModal();
  // const { data } = useSession();

  // useEffect(() => {
  //   if (data) {
  //     close();
  //   }
  // }, [data]);

  return (
    <div className="mb-0 pt-2 px-4 border-b bg-white">
      <div className="flex justify-between  items-center mb-4">
        <UserButton />
        <div className="px-2 py-3 rounded-sm bg-primary-col text-white flex items-center hover:bg-primary-col/80">
          <WalletMinimalIcon className="mr-2 size-4" />
          <span className="text-xs tracking-tight">Connect wallet</span>
        </div>
      </div>
    </div>
  );
};

const UserNavbar = ({
  email,
  className,
}: {
  email: string;
  className: string;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "px-2 rounded-sm ring-booking flex items-center p-1 border",
            className == "black" && "border-black/70",
          )}
        >
          <UserCircleIcon className="mr-2 size-4" />
          <MenuIcon className="size-4" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="rounded-sm min-w-50">
        <div className="grid">
          <div className="flex items-center justify-center w-full gap-2 mb-3">
            <UserCircleIcon className="size-8 text-muted-foreground" />
            <div className="flex flex-col text-sm">
              <p>{email}</p>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
          <div className="border-t pt-1">
            <Link href="/trips">
              <div className="cursor-pointer hover:bg-neutral-300 rounded-sm px-4 py-2">
                <p className="text-muted-foreground text-sm p-1">My trips</p>
              </div>
            </Link>
            <Link href="/my-profile">
              <div className="cursor-pointer hover:bg-neutral-300 rounded-sm px-4 py-2">
                <p className="text-muted-foreground text-sm p-1">My Profile</p>
              </div>
            </Link>
          </div>
          <div className="space-y-2 border-t pt-1">
            <div
              className="cursor-pointer hover:bg-neutral-300 rounded-sm px-4 py-2"
              // onClick={() =>
              //   signOut({
              //     redirect: false,
              //   })
              // }
            >
              <p className="text-muted-foreground text-sm p-1">Sign out</p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const MobileMenu = ({
  email,
  className,
}: {
  email: string;
  className: string;
}) => {
  // const { open } = useOpenLoginModal();

  return (
    <Popover>
      <PopoverTrigger asChild>
        {email ? (
          <div
            className={cn(
              "px-2 rounded-sm ring-booking flex items-center p-1 border",
              className == "black" && "border-black/70",
            )}
          >
            <UserCircleIcon className="mr-2 size-4" />
            <MenuIcon className="size-4" />
          </div>
        ) : (
          <div className="flex justify-between gap-6 md:hidden">
            <UserCircleIcon
              className={cn(
                "size-5",
                className == "white" ? "text-white" : "text-black",
              )}
              onClick={() => open()}
            />
            <MenuIcon
              className={cn(
                "size-5",
                className == "white" ? "text-white" : "text-black",
              )}
            />
          </div>
        )}
      </PopoverTrigger>
      <PopoverContent className="rounded-sm min-w-50">
        <div className="grid">
          {email && (
            <div className="flex items-center justify-center w-full gap-2 mb-3">
              <UserCircleIcon className="size-8 text-muted-foreground" />
              <div className="flex flex-col text-sm">
                <p>{email}</p>
                <p className="text-xs text-muted-foreground">{email}</p>
              </div>
            </div>
          )}
          <div className={cn("pt-1", email && "border-t")}>
            <Link href="/flights">
              <div className="cursor-pointer hover:bg-neutral-300 rounded-sm px-4 py-2">
                <p className="text-muted-foreground text-sm p-1">Flights</p>
              </div>
            </Link>
            <Link href="/">
              <div className="cursor-pointer hover:bg-neutral-300 rounded-sm px-4 py-2">
                <p className="text-muted-foreground text-sm p-1">Hotels</p>
              </div>
            </Link>
          </div>
          {email && (
            <div className="border-t pt-1">
              <Link href="/trips">
                <div className="cursor-pointer hover:bg-neutral-300 rounded-sm px-4 py-2">
                  <p className="text-muted-foreground text-sm p-1">My trips</p>
                </div>
              </Link>
              <Link href="/my-profile">
                <div className="cursor-pointer hover:bg-neutral-300 rounded-sm px-4 py-2">
                  <p className="text-muted-foreground text-sm p-1">
                    My Profile
                  </p>
                </div>
              </Link>
            </div>
          )}
          <div className="space-y-2 border-t pt-1">
            {email ? (
              <div
                className="cursor-pointer hover:bg-neutral-300 rounded-sm px-4 py-2"
                // onClick={() =>
                //   signOut({
                //     redirect: false,
                //   })
                // }
              >
                <p className="text-muted-foreground text-sm p-1">Sign out</p>
              </div>
            ) : (
              <div
                className="cursor-pointer rounded-sm px-4 py-2 bg-brand1 text-white text-center"
                // onClick={() => open()}
              >
                <p className="text-white font-semibold p-1 ">Sign in</p>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
