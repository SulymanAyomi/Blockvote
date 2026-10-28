"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cx } from "class-variance-authority";
import { ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Btn } from "@/components/btn";
import { ErrorState } from "@/features/error/error-state";
import { Notice } from "@/components/notice";
import { PageHead } from "@/components/pageHeader";
import { Skel } from "@/components/skeleton-cards";
import { Input } from "@/components/ui/input";
import { Av } from "@/components/user-avatar";
import { STUDENT, H2 } from "@/lib/helpers";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetUserInformation } from "@/features/auth/api/use-get-user";

function ProfilePage() {
  const { data, isLoading, error, refetch } = useGetUserInformation();
  const [phone, setPhone] = useState("");
  const [prefs, setPrefs] = useState({
    announcements: true,
    reminders: true,
    system: false,
  });
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<File | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const file = useRef(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      // onChange({ coverImage: url });
    } else {
      setImage(undefined);
    }
  };

  const save = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setSaving(false);
    // notify("Changes saved");
  };

  const student = data?.data;
  const prefers = [
    ["announcements", "Election announcements"],
    ["reminders", "Voting reminders"],
    ["system", "System notifications"],
  ];

  if (isLoading)
    return (
      <div role="status" aria-label="Loading">
        <Skel className="h-11 w-full max-w-sm" />
        <Skel className="mt-4 h-28 w-full" />
      </div>
    );

  if (!student || error)
    return <ErrorState error={error} retry={() => refetch()} />;

  return (
    <div>
      <PageHead
        title="Profile"
        sub="Your student details and notification settings."
      />
      <div className="space-y-5">
        <Card role="group" className="rounded-2xl p-6" aria-labelledby="pd">
          <div className="mb-5 flex items-center gap-4">
            {student.imageUrl ? (
              <img
                src={student.imageUrl}
                className="size-20 rounded-full object-center aspect-auto"
              />
            ) : (
              <Av name={student?.fullName!} size="md" />
            )}
            <div>
              <h2 id="pd" className={H2}>
                {student.fullName}
              </h2>
              <p className="text-slate-600">{STUDENT.studentId}</p>
              <input
                ref={file}
                type="file"
                accept="image/*"
                className="sr-only"
                tabIndex={-1}
                aria-label="Choose profile photo"
                onChange={handleImageChange}
              />
              <Button
                type="button"
                variant="ghost"
                className="-ml-3 h-10 px-3 font-semibold text-blue-800 underline hover:bg-blue-50"
                onClick={() => inputRef.current?.click()}
              >
                Change photo
              </Button>
            </div>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              ["Full name", student.fullName],
              ["Student ID", student.studentId],
              ["Department", student.department?.name],
              ["Faculty", student.faculty?.name],
              ["Level", student.level],
              ["Email", student.email],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-sm text-slate-600">{k}</dt>
                <dd className="wrap-break-word font-semibold text-slate-900">
                  {v}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-slate-600">
            These details come from the registrar and can't be changed here.
            Contact Election Support if something is wrong.
          </p>
        </Card>
        <Notice
          tone="info"
          icon={ShieldCheck}
          title="Your account is securely authenticated"
        >
          You signed in with your university account.
        </Notice>
        <Card className="rounded-2xl p-6">
          <form onSubmit={save} aria-labelledby="ct">
            <h2 id="ct" className={cx(H2, "mb-4")}>
              Contact and notifications
            </h2>

            <div className="max-w-sm space-y-1.5">
              <Label
                htmlFor="ph"
                className="text-base font-semibold text-slate-900"
              >
                Phone number
              </Label>
              <Input
                id="ph"
                type="tel"
                autoComplete="tel"
                className="h-11 border-slate-400"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <fieldset className="mt-5">
              <legend className="mb-1 font-semibold text-slate-900">
                Notify me about
              </legend>
              {prefers.map(([k, l]) => (
                <div className="flex items-center gap-3 py-2.5" key={k}>
                  <Checkbox
                    id={"pf-" + k}
                    className="h-5 w-5"
                    // @ts-ignore
                    checked={prefs[k]}
                    onCheckedChange={(v) =>
                      setPrefs({ ...prefs, [k]: v === true })
                    }
                  />
                  <Label
                    htmlFor={"pf-" + k}
                    className="cursor-pointer text-base font-normal text-slate-900"
                  >
                    {l}
                  </Label>
                </div>
              ))}
            </fieldset>
            <div className="mt-4">
              <Btn type="submit" loading={saving} disabled={saving}>
                Save changes
              </Btn>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default ProfilePage;
