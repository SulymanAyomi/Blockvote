"use client";
import { Button } from "@/components/ui/button";
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
import {
  LoaderCircleIcon,
  LucideArrowRight,
  MoveRightIcon,
  Vote,
} from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { idSelectionSchema } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataType } from "../type";
import { toast } from "sonner";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useVerifyNin } from "../api/use-verify";

interface RegisterComponentProps {
  onNext: () => void;
  handleData: (value: DataType) => void;
  data: DataType;
}

export const RegisterComponent = ({
  onNext,
  handleData,
  data,
}: RegisterComponentProps) => {
  const [error, setError] = useState("");
  const { mutate, isPending } = useVerifyNin();

  const form = useForm<z.infer<typeof idSelectionSchema>>({
    resolver: zodResolver(idSelectionSchema),
    defaultValues: {
      id: data.id ?? undefined,
      idNumber: data.idNumber,
    },
  });

  function onSubmit(data: z.infer<typeof idSelectionSchema>) {
    setError("");
    const value = {
      id: data.id,
      idNumber: data.idNumber,
      regSessionId: "",
    };
    console.log(data);

    mutate(
      {
        json: {
          idType: data.id,
          idNumber: data.idNumber,
        },
      },
      {
        onSuccess: (data) => {
          console.log(data);
          // @ts-ignore
          value.regSessionId = data.data.regSessionId;
          handleData(value);
          toast("You submitted the following values:", {
            description: (
              <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-code p-4 text-code-foreground">
                <code>{JSON.stringify(value, null, 2)}</code>
              </pre>
            ),
            position: "bottom-right",
            classNames: {
              content: "flex flex-col gap-2",
            },
            style: {
              "--border-radius": "calc(var(--radius)  + 4px)",
            } as React.CSSProperties,
          });
          onNext();
        },
        onError: async (error) => {
          setError(error.message);
        },
      },
    );
  }
  return (
    <div className="w-full h-full">
      <div className="flex flex-col justify-between flex-1 w-full  h-full">
        <div className="">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-9.5 h-9.5 rounded-full bg-[#FBEAE7] flex items-center justify-center shrink-0 mt-0.5">
              <Vote size={20} className="text-[#B23A2E]" strokeWidth={2.25} />
            </div>
            <div>
              <div className="font-mono text-[11px] tracking-wider uppercase text-[#B23A2E] font-semibold mb-1">
                Student Voting Platform
              </div>
              <h1 className="text-xl font-semibold text-[#1B2A41] leading-tight">
                Register
              </h1>
              <p className="text-muted-foreground">
                Choose an ID and enter number
              </p>
            </div>
          </div>
          <form
            className="mt-10 space-y-3"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FieldGroup>
              <Controller
                name="id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full bg-brand-ash">
                        <SelectValue placeholder="Identification Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>
                            Please Select an identification type
                          </SelectLabel>
                          <SelectItem value={"NIN"}>
                            National Identification Number (NIN)
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="idNumber"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter Identification number"
                      autoComplete="off"
                      className="bg-white"
                      type="text"
                      inputMode="numeric"
                      maxLength={11}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button className="w-full mt-6" size={"lg"}>
              {isPending ? (
                <LoaderCircleIcon className="animate-spin text-white size-4" />
              ) : (
                <>
                  Proceed <MoveRightIcon className="size-4" />
                </>
              )}
            </Button>
          </form>
        </div>
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
