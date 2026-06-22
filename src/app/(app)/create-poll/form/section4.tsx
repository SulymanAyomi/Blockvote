"use client";

import {
  Plus,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Trash2,
  ImageIcon,
  MoveRightIcon,
} from "lucide-react";
import {
  Controller,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useEffect, useRef, useState } from "react";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import {
  candidateSchema,
  pollOptionsSchema,
} from "@/features/elections/new-poll/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import z from "zod";
import { DatePicker } from "@/components/date-picker";
import { usePollData } from "@/context/pollData";
import { toast } from "sonner";

const MIN_ITEMS = 2;

type PollType = "" | "Candidate" | "Options";

interface CandidateProps {
  id: string;
  name: string;
  profile: string;
  candidateImage: File | string;
  DOB: Date;
  partyName: string;
  partyImage: File | string;
}

interface OptionsProps {
  id: string;
  label: string;
  image: File | string;
}

function FilePreview({ file }: { file: File | string | null }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    if (typeof file === "string") {
      setUrl(file);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!url) {
    return (
      <Avatar className="size-10">
        <AvatarFallback>
          <ImageIcon className="size-7 text-neutral-400" />
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <div className="size-10 relative rounded-full overflow-hidden">
      <img
        src={url}
        alt="preview"
        className="object-cover w-full h-full rounded-full"
      />
    </div>
  );
}

function ItemCardHeader({
  title,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  title: string;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
      <div className="flex items-center gap-3">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onMoveUp}
          disabled={index === 0}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onMoveDown}
          disabled={index === total - 1}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={total <= MIN_ITEMS}
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </CardHeader>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">No options added yet.</p>
      </CardContent>
    </Card>
  );
}

export function PollOptionsSection() {
  const { pollData, setPollData } = usePollData();
  const [pollType, setPollType] = useState("");
  const [isOpenOption, setIsOpenOption] = useState(false);
  const [isOpenCandidate, setIsOpenCandidate] = useState(false);
  const [optionData, setOptionData] = useState<OptionsProps[]>([]);
  const [candidateData, setCandidateData] = useState<CandidateProps[]>([]);

  const openOption = () => setIsOpenOption(true);
  const openCandidate = () => setIsOpenCandidate(true);
  const closeOption = () => setIsOpenOption(false);
  const closeCandidate = () => setIsOpenCandidate(false);

  const addOption = (data: OptionsProps) => {
    setOptionData((prev) => [...prev, data]);
  };

  const addCandidate = (data: CandidateProps) => {
    setCandidateData((prev) => [...prev, data]);
  };

  function moveItem<T>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    index: number,
    direction: "up" | "down",
  ) {
    setter((prev) => {
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const updated = [...prev];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      return updated;
    });
  }

  function removeItem<T>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    index: number,
  ) {
    setter((prev) => prev.filter((_, i) => i !== index));
  }

  const handleSavePoll = () => {
    const payload = pollType === "Candidate" ? candidateData : optionData;
    // TODO: replace with your actual submit logic (API call, parent callback, etc.)
    console.log("Saving poll", { pollType, payload });
    if (pollType === "Candidate") {
      setPollData((prev) => ({
        ...prev,
        pollType: "Candidate",
        candidates: candidateData,
      }));
      if (candidateData.length < 2) {
        toast.error(
          "Candidates less than 2. Please add more candidates to continue!",
        );
        return;
      }
    } else {
      setPollData((prev) => ({
        ...prev,
        pollType: "Options",
        options: optionData,
      }));

      if (optionData.length < 2) {
        toast.error(
          "Options less than 2. Please add more options to continue!",
        );
        return;
      }
    }

    console.log(pollData);
    toast("You submitted the following values:", {
      description: (
        <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-code p-4 text-code-foreground">
          <code>{JSON.stringify(pollData, null, 2)}</code>
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
  };

  const addOptionButton = () => {
    if (!pollType) return null;
    if (pollType === "Candidate") {
      return (
        <div className="flex gap-2">
          <Button type="button" onClick={openCandidate} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      );
    }
    return (
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={openOption}>
          <Plus className="h-4 w-4 mr-2" />
          Add Option
        </Button>
      </div>
    );
  };

  const activeCount =
    pollType === "Candidate" ? candidateData.length : optionData.length;

  return (
    <section className="space-y-6">
      <CandidateModal
        close={closeCandidate}
        index={optionData.length}
        isOpen={isOpenCandidate}
        setIsOpen={setIsOpenCandidate}
        addCandidate={addCandidate}
      />
      <OptionsModal
        close={closeOption}
        index={optionData.length}
        isOpen={isOpenOption}
        setIsOpen={setIsOpenOption}
        addOption={addOption}
      />
      <div className="space-y-2">
        <FieldLabel>Poll type</FieldLabel>
        <Select
          value={pollType}
          onValueChange={(value) => setPollType(value as PollType)}
        >
          <SelectTrigger className="w-full bg-brand-ash">
            <SelectValue placeholder="Poll type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Select voting type</SelectLabel>
              <SelectItem value="Candidate">Candidate election</SelectItem>
              <SelectItem value="Options">Poll option</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="mt-4">{addOptionButton()}</div>
      </div>

      <div className="space-y-4">
        {pollType === "Candidate" ? (
          candidateData.length === 0 ? (
            <EmptyState />
          ) : (
            candidateData.map((field, index) => (
              <Card key={field.id}>
                <ItemCardHeader
                  title={`Candidate ${index + 1}`}
                  index={index}
                  total={candidateData.length}
                  onMoveUp={() => moveItem(setCandidateData, index, "up")}
                  onMoveDown={() => moveItem(setCandidateData, index, "down")}
                  onRemove={() => removeItem(setCandidateData, index)}
                />
                <CardContent className="space-y-3">
                  <div className="w-full flex items-center gap-3">
                    <FilePreview file={field.candidateImage} />
                    <Input
                      placeholder="Candidate name"
                      value={field.name}
                      disabled
                    />
                  </div>
                  {/* {field.partyName && (
                    <div className="flex items-center gap-2">
                      <FilePreview file={field.partyImage} />
                      <Input
                        placeholder="Party name"
                        value={field.partyName}
                        disabled
                      />
                    </div>
                  )} */}
                </CardContent>
              </Card>
            ))
          )
        ) : pollType === "Options" ? (
          optionData.length === 0 ? (
            <EmptyState />
          ) : (
            optionData.map((field, index) => (
              <Card key={field.id}>
                <ItemCardHeader
                  title={`Option ${index + 1}`}
                  index={index}
                  total={optionData.length}
                  onMoveUp={() => moveItem(setOptionData, index, "up")}
                  onMoveDown={() => moveItem(setOptionData, index, "down")}
                  onRemove={() => removeItem(setOptionData, index)}
                />
                <CardContent className="space-y-6">
                  <div className="w-full flex items-center gap-3">
                    <FilePreview file={field.image} />
                    <Input
                      placeholder="Enter option label"
                      value={field.label}
                      disabled
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )
        ) : (
          <EmptyState />
        )}
      </div>

      <Button
        className="w-full flex items-center gap-3"
        size={"lg"}
        onClick={handleSavePoll}
      >
        Save Poll <MoveRightIcon />
      </Button>
    </section>
  );
}

interface OptionsModalProps {
  isOpen: boolean;
  index: number;
  setIsOpen: (v: boolean) => void;
  close: () => void;
  addOption: ({ label, image, id }: OptionsProps) => void;
}
export const OptionsModal = ({
  isOpen,
  index,
  setIsOpen,
  close,
  addOption,
}: OptionsModalProps) => {
  const [data, setData] = useState<{
    label: string;
    image: File | null;
  }>({
    label: "",
    image: null,
  });
  const [error, setError] = useState({
    label: "",
    image: "",
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof pollOptionsSchema>>({
    resolver: zodResolver(pollOptionsSchema),
    defaultValues: {
      label: "",
      image: undefined,
    },
  });
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
    }
  };

  const onSubmit = (data: z.infer<typeof pollOptionsSchema>) => {
    const newData = {
      id: crypto.randomUUID(),
      ...data,
    };
    addOption(newData);
    console.log("newdata", newData);
    close();
    form.reset();
  };
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Option {index + 1}</h3>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="label"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Label</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Option label or name"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="image"
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
                        <p className="text-sm">Image</p>
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
            <div className="flex items-center justify-end gap-2 mt-2">
              <Button variant="outline" onClick={close} type="button">
                Cancle
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ResponsiveModal>
  );
};

interface CandidateModalProps {
  isOpen: boolean;
  index: number;
  setIsOpen: (v: boolean) => void;
  close: () => void;
  addCandidate: (data: CandidateProps) => void;
}
export const CandidateModal = ({
  isOpen,
  index,
  setIsOpen,
  close,
  addCandidate,
}: CandidateModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputRef1 = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof candidateSchema>>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      name: "",
      candidateImage: undefined,
      profile: "",
      partyName: "",
      partyImage: undefined,
      DOB: undefined,
    },
  });
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("candidateImage", file);
    }
  };
  const handleImageChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("partyImage", file);
    }
  };

  const onSubmit = (data: z.infer<typeof candidateSchema>) => {
    const newData = {
      id: crypto.randomUUID(),
      ...data,
    };
    addCandidate(newData);
    console.log("newData", newData);
    close();
    form.reset();
  };
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Candidate {index + 1}</h3>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Candidate Name</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Babatunde Shola"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="profile"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-description">
                      Candidate Profile
                    </FieldLabel>
                    <InputGroup className="bg-transparent rou focus-within:border-none focus-visible:shadow-none focus-visible:ring-0">
                      <InputGroupTextarea
                        {...field}
                        id="form-rhf-demo-description"
                        placeholder="Candidate profile or manifesto."
                        rows={6}
                        className="min-h-24 resize-none bg-transparent rounded-md"
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          0/100 characters
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="DOB"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="space-y-1 w-full">
                      <label className="text-sm text-neutral-600 ml-2">
                        Date of Birth
                      </label>
                      <DatePicker
                        className="bg-bg-color1 hover:bg-muted active:bg-transparent"
                        placeholder="dd/mm/yy"
                        {...field}
                      />
                    </div>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="partyName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Candidate Party/Org/Level
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Candidate party/level or any identifier"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="candidateImage"
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
                        <p className="text-sm">Candidate Image</p>
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
              <Controller
                control={form.control}
                name="partyImage"
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
                        <p className="text-sm">Party Image</p>
                        <p className="text-sm text-muted-foreground">
                          JPG, PNG, SVG or JPEG, max 1mb
                        </p>
                        <input
                          className="hidden"
                          type="file"
                          accept=".jpg, .png, .jpeg, .svg"
                          ref={inputRef1}
                          // disabled={isLoading}
                          onChange={handleImageChange1}
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

            <div className="flex items-center justify-end gap-2 mt-2">
              <Button variant="outline" onClick={close} type="button">
                Cancle
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ResponsiveModal>
  );
};
