"use client";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  return (
    <div className="w-full bg-white font-sans dark:bg-black py-5 flex flex-1 items-center justify-center">
      <main className="w-full max-w-3xl mx-auto p-4  dark:bg-black rounded-md min-w-sm h-full">
        <div className="flex flex-1 flex-col gap-4 items-center justify-center pb-8">
          <div className="flex flex-col items-center justify-center gap-4 pt-8 pb-8">
            {/* <div className="rounded-full p-3 bg-primary-col w-fit">
              <CheckIcon className="size-10 text-white" />
            </div> */}
            <div>
              <img src="/alk.png" className="h-50 w-full object-cover" />
            </div>
            <p className="text-primary-col text-4xl font-semibold">
              AL-HIKMAH University Election
            </p>
            <p className="text-center text-muted-foreground">
              A secured verified platform designed for fair and transparent
              elections.
            </p>
          </div>
          <p className="text-primary-col font-semibold">
            Your voice matters. Register to participate in the upcoming
            elections.
          </p>
          <Button
            size={"lg"}
            className="py-4 w-full md:w-1/2"
            onClick={() => router.push("/register")}
          >
            Get Started
          </Button>
          <p className="my-4 text-sm">
            Already Register?
            <Link
              href="/login"
              className="text-sm ml-3 text-primary-col hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

const HomeShow1 = () => {
  return (
    <main className="w-full max-w-3xl mx-auto p-4 bg-sec-col dark:bg-black rounded-md min-w-sm h-full">
      <div className="flex flex-1 flex-col gap-4 items-center justify-center pb-8">
        <div className="flex flex-col items-center justify-center gap-4 pt-8 pb-24">
          <div className="rounded-full p-3 bg-primary-col w-fit">
            <CheckIcon className="size-10 text-white" />
          </div>
          <p className="text-primary-col text-4xl font-semibold">Block Vote</p>
        </div>
        <p className="text-primary-col text-xl ">A Vote Anytime, Anywhere.</p>
      </div>
    </main>
  );
};
