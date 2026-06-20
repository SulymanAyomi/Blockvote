"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LucideArrowRight } from "lucide-react";
import { useState } from "react";

interface RegisterComponentProps {
  onNext: () => void;
}
export const RegisterComponent = ({ onNext }: RegisterComponentProps) => {
  const [Id, setID] = useState("");
  const [IdNumber, setIdNumber] = useState("");
  return (
    <div className="w-full h-full">
      <div className="flex flex-col justify-between flex-1 w-full  h-[90%]">
        <div className="">
          <div className="font-semibold text-2xl mb-2">Register</div>
          <p className="text-muted-foreground">Choose an ID and enter number</p>
          <div className="mt-10 space-y-3">
            <div className="space-y-1 w-full mb-2.5">
              <Select
                onValueChange={(e) => setID(e)}
                value={Id}
                // disabled={disabled}
              >
                <SelectTrigger className="w-full bg-brand-ash">
                  <SelectValue placeholder="Select ID" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select ID</SelectLabel>
                    <SelectItem value="nin">NIN</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 w-full">
              <Input
                className="w-full bg-brand-ash"
                value={IdNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                // onBlur={() => validateField("firstName")}
                // disabled={disabled}
                placeholder="Enter Id number"
              />
              {/* {passenger?.errors?.firstName && (
                <p className="ml-1 text-[10px] text-red-500">
                  {passenger.errors.firstName}
                </p>
              )} */}
            </div>
          </div>
        </div>
        <Button className="w-full" size={"lg"} onClick={onNext}>
          Proceed <LucideArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};

//    <Card className="shadow-none px-4 py-6 border-none sm:ring-0">
//           <CardHeader>
//             <CardTitle className="font-semibold">Register</CardTitle>
//             <CardDescription>Choose an ID and enter number</CardDescription>
//           </CardHeader>
//           <CardContent className="py-5 space-y-2.5"></CardContent>
//           <CardFooter className="w-full">

//           </CardFooter>
//         </Card>
