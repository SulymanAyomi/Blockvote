"use client";
import { Btn } from "@/components/btn";
import { Modal } from "@/components/modal";
import { Notice } from "@/components/notice";
import { PageHead } from "@/components/pageHeader";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Accordion,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { STUDENT, H2 } from "@/lib/helpers";
import { CheckCircle2, Mail } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useGetUserInformation } from "@/features/auth/api/use-get-user";

function SupportModal({ onClose }: { onClose: () => void }) {
  const { data, isLoading, error, refetch } = useGetUserInformation();

  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (e: any) => {
    e.preventDefault();
    setBusy(true);
    setBusy(false);
    setSent(true);
  };
  if (isLoading) {
  }
  const student = data?.data;

  if (sent)
    return (
      <Modal
        title="Message sent"
        description={`Election Support will reply to ${student?.email} within one working day.`}
        onClose={onClose}
        footer={<Btn onClick={onClose}>Done</Btn>}
      >
        <Notice tone="ok" icon={CheckCircle2}>
          Your message has been sent.
        </Notice>
      </Modal>
    );

  return (
    <Modal
      title="Contact Election Support"
      description="Tell us what's happening and we'll help."
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="tp"
            className="text-base font-semibold text-slate-900"
          >
            What do you need help with?
          </Label>
          <select
            id="tp"
            defaultValue="verify"
            className="h-11 w-full rounded-md border border-slate-400 bg-white px-3 text-base text-slate-900"
          >
            <option value="verify">I can't verify my identity</option>
            <option value="elig">I can't see or vote in an election</option>
            <option value="vote">A problem with my ballot</option>
            <option value="other">Something else</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="ms"
            className="text-base font-semibold text-slate-900"
          >
            Message
          </Label>
          <Textarea
            id="ms"
            required
            className="min-h-32 border-slate-400"
            placeholder="Describe what happened. Don't include who you voted for."
          />
        </div>
        <p className="text-sm text-slate-600">
          We'll reply to {student?.email}.
        </p>
        <div className="flex justify-end gap-2">
          <Btn variant="secondary" onClick={onClose}>
            Cancel
          </Btn>
          <Btn type="submit" loading={busy} disabled={busy}>
            Send message
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
function HelpPage() {
  const [sup, setSup] = useState(false);
  const Q = ({
    v,
    q,
    children,
  }: {
    v: string;
    q: string;
    children: React.ReactNode;
  }) => (
    <AccordionItem
      value={v}
      className="rounded-xl border border-slate-200 bg-white px-4"
    >
      <AccordionTrigger className="text-left text-base font-semibold text-slate-900 hover:no-underline">
        {q}
      </AccordionTrigger>
      <AccordionContent className="text-base text-slate-700">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
  return (
    <div>
      <PageHead title="Help" sub="Answers to common questions about voting." />
      <Accordion type="single" collapsible className="space-y-2.5">
        <Q v="how" q="How do I vote?">
          <ol className="space-y-2">
            {[
              "Open an active election.",
              "Verify your identity.",
              "Enter the ballot.",
              "Select your candidates.",
              "Review your selections.",
              "Submit your ballot.",
              "Receive confirmation.",
            ].map((t, i) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-900">
                  {i + 1}
                </span>
                {t}
              </li>
            ))}
          </ol>
        </Q>
        <Q v="why" q="Why do I need identity verification?">
          <p>
            Identity verification confirms that only eligible students
            participate in the election.
          </p>
        </Q>
        <Q v="change" q="Can I change my vote?">
          <p>
            No. Once your ballot is successfully submitted, it cannot be
            changed.
          </p>
        </Q>
        <Q v="who" q="Can someone see who I voted for?">
          <p>
            The system is designed to keep your ballot choices private.{" "}
            <Link
              href="/how-voting-works"
              className="font-semibold text-blue-800 underline"
            >
              Learn how voting works
            </Link>
            .
          </p>
        </Q>
        <Q v="cant" q="I cannot verify my identity">
          <ul className="ml-5 list-disc space-y-1">
            <li>Move to a well-lit place and face the light.</li>
            <li>Remove sunglasses, hats or face coverings.</li>
            <li>Allow camera access in your browser settings.</li>
            <li>Hold your device at eye level and keep still.</li>
            <li>
              If it keeps failing, contact Election Support. They can help you
              verify another way.
            </li>
          </ul>
        </Q>
        <Q v="exp" q="My voting session expired">
          <p>
            Sessions are short for your security. Your selections are cleared,
            and you can verify again and start a new session while the election
            is still open.
          </p>
        </Q>
      </Accordion>
      <Card className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-blue-200 bg-blue-50 p-5">
        <div>
          <h2 className={H2}>Still need help?</h2>
          <p className="text-sm text-slate-700">
            Election Support replies within one working day.
          </p>
        </div>
        <Btn onClick={() => setSup(true)} icon={Mail}>
          Contact Election Support
        </Btn>
      </Card>
      {sup && <SupportModal onClose={() => setSup(false)} />}
    </div>
  );
}

export default HelpPage;
