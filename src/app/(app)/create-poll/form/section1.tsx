import { zodResolver } from "@hookform/resolvers/zod";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { ImageIcon, MoveRight } from "lucide-react";
import Image from "next/image";
import React, { useRef } from "react";
import { toast } from "sonner";
import z from "zod";
import { pollSection1Schema } from "@/features/elections/new-poll/schema";
import { Controller, useForm } from "react-hook-form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

interface Section1Props {
  onNext: () => void;
}

const Section1 = ({ onNext }: Section1Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("coverImage", file);
    }
  };

  const form = useForm<z.infer<typeof pollSection1Schema>>({
    resolver: zodResolver(pollSection1Schema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  function onSubmit(data: z.infer<typeof pollSection1Schema>) {
    toast("You submitted the following values:", {
      description: (
        <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-code p-4 text-code-foreground">
          <code>{JSON.stringify(data, null, 2)}</code>
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
  }
  return (
    <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Bug Title</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Login button not working on mobile"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-demo-description">
                Description
              </FieldLabel>
              <InputGroup className="bg-transparent rou focus-within:border-none focus-visible:shadow-none focus-visible:ring-0">
                <InputGroupTextarea
                  {...field}
                  id="form-rhf-demo-description"
                  placeholder="I'm having an issue with the login button on mobile."
                  rows={6}
                  className="min-h-24 resize-none bg-transparent rounded-md"
                  aria-invalid={fieldState.invalid}
                />
                <InputGroupAddon align="block-end">
                  <InputGroupText className="tabular-nums">
                    {field.value.length}/100 characters
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="coverImage"
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-y-2">
              <div className="flex items-center gap-x-5">
                {field.value ? (
                  <div className="size-18 relative rounded-md overflow-hidden">
                    <Image
                      src={
                        field.value instanceof File
                          ? URL.createObjectURL(field.value)
                          : (field.value as string)
                      }
                      fill
                      alt="logo"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <Avatar className="size-18">
                    <AvatarFallback>
                      <ImageIcon className="size-9 text-neutral-400" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="flex flex-col">
                  <p className="text-sm">Project Icon</p>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG, SVG or JPEG, max 1mb
                  </p>
                  <input
                    className="hidden"
                    type="file"
                    accept=".jpg, .png, .jpeg, .svg"
                    ref={inputRef}
                    // disabled={isLoading}
                    onChange={handleImageChange}
                  />
                  {field.value ? (
                    <Button
                      type="button"
                      // disabled={isLoading}
                      variant="destructive"
                      size="xs"
                      className="w-fit mt-2"
                      onClick={() => {
                        field.onChange(null);
                        if (inputRef.current) {
                          inputRef.current.value = "";
                        }
                      }}
                    >
                      Remove image
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      // disabled={isLoading}
                      variant="teritary"
                      size="xs"
                      className="w-fit mt-2"
                      onClick={() => inputRef.current?.click()}
                    >
                      Upload image
                    </Button>
                  )}
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </div>
              </div>
            </div>
          )}
        />
      </FieldGroup>
      <div className="w-full mt-6">
        <Button className="w-full flex items-center gap-3" size={"lg"}>
          Continue <MoveRight />
        </Button>
      </div>
    </form>
  );
};

export default Section1;
