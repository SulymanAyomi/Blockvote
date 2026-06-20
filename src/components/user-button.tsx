"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  ChevronRight,
  Loader2Icon,
  LogOut,
  Settings,
  User2Icon,
  UserX2Icon,
} from "lucide-react";
// import { signOut, useSession } from "next-auth/react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
// import { useGetProfile } from "../api/use-get-profile";
import { useConfirm } from "@/hooks/use-confirm";

export const UserButton = () => {
  const router = useRouter();
  // const { data: session, status } = useSession();
  // const { data, isPending } = useGetProfile();
  const [ConfirmDialog, confirm] = useConfirm(
    "Log out",
    "You will be logged out of the app",
    "destructive",
  );
  const onLogout = async () => {
    const ok = await confirm();
    if (!ok) return;
    // await signOut({ callbackUrl: "/sign-in" });
  };
  const data = {
    imageUrl: "/img-1.png",
    name: "Sulyman Ayo",
    email: "sulymanayomi@gmail.com",
  };

  // if (status == "loading" || isPending) {
  //   return (
  //     <div className="size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
  //       <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
  //     </div>
  //   );
  // }
  if (!data) {
    return (
      <div className="size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
        <UserX2Icon className="size-4 text-muted-foreground" />
      </div>
    );
  }
  const image = data.imageUrl;
  const name = data.name;
  const email = data.email!;
  const avatarFallback = name
    ? name.charAt(0).toUpperCase()
    : email.charAt(0).toUpperCase();
  return (
    <>
      <ConfirmDialog />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="outline-none relative">
          {image ? (
            <div className="rounded-full size-10 overflow-hidden border">
              <img src={image} className="w-full h-full object-cover " />
            </div>
          ) : (
            <Avatar className="size-10 hover:opacity-75 transition border border-neutral-300">
              <AvatarFallback className="bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="bottom"
          className="w-60"
          sideOffset={10}
        >
          <div className="flex flex-col items-center justify-center gap-2 px-2.5 py-4">
            {image ? (
              <div className="rounded-full size-10 overflow-hidden border">
                <img src={image} className="w-full h-full object-cover " />
              </div>
            ) : (
              <Avatar className="size-13 transition border border-white">
                <AvatarFallback className="bg-brand1 text-xl font-medium text-white flex items-center justify-center">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex flex-col items-center justify-center ">
              <p className="text-sm font-medium text-neutral-900">{name}</p>
              <p className="text-xs text-neutral-500 ">{email}</p>
            </div>
          </div>
          <DropdownMenuItem
            onClick={() => router.push("/user/profile")}
            className="h-10 flex items-center justify-between font-medium cursor-pointer px-3"
          >
            <div className="flex items-center gap-2">
              <User2Icon className="size-4" />
              My Profile
            </div>
            <ChevronRight className="size-4" />
          </DropdownMenuItem>
          <Separator className="mb-1" />
          <DropdownMenuItem
            onClick={() => router.push("/user/settings")}
            className="h-10 flex items-center justify-between font-medium cursor-pointer px-3"
          >
            <div className="flex items-center gap-2">
              <Settings className="size-4" />
              Account Settings
            </div>
            <ChevronRight className="size-4" />
          </DropdownMenuItem>
          <Separator className="mb-1" />
          <DropdownMenuItem
            onClick={onLogout}
            className="h-10 flex items-center justify-between text-amber-700 hover:text-amber-600 font-medium cursor-pointer px-3"
          >
            <div className="flex items-center gap-2">
              <LogOut className="size-4" />
              Log out
            </div>
            <ChevronRight className="size-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
