import { useState, useMemo } from "react";
import { z } from "zod";
import { Eye, EyeOff, Check, X, Vote, LoaderCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataType } from "../type";
import { usePassword } from "../api/use-password";
import { useRouter } from "next/navigation";

// ---- Zod schema -------------------------------------------------
// 8+ characters, at least one capital letter, at least one symbol.
const passwordSchema = z
  .string()
  .min(8, "Needs at least 8 characters")
  .regex(/[A-Z]/, "Needs one capital letter")
  .regex(/[^A-Za-z0-9]/, "Needs one symbol");

const requirements = [
  { id: "length", label: "8+ characters", test: (v: any) => v.length >= 8 },
  {
    id: "capital",
    label: "One capital letter",
    test: (v: any) => /[A-Z]/.test(v),
  },
  {
    id: "symbol",
    label: "One symbol (!@#$...)",
    test: (v: any) => /[^A-Za-z0-9]/.test(v),
  },
];

interface PasswordComponentProps {
  //   onNext: () => void;
  data: DataType;
}

export default function BallotPasswordInput({ data }: PasswordComponentProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const { mutate, isPending } = usePassword();

  const result = useMemo(() => passwordSchema.safeParse(password), [password]);
  const isValid = result.success;
  const confirmMatches = confirm.length > 0 && confirm === password;
  const passedCount = requirements.filter((r) => r.test(password)).length;

  function handleSubmit(e: any) {
    e.preventDefault();
    setError("");
    setTouched(true);
    if (isValid && confirmMatches) {
      mutate(
        {
          json: {
            regSessionId: data.regSessionId,
            password,
          },
        },
        {
          onSuccess: (data) => {
            setSubmitted(true);
          },
          onError: (error) => {
            setError(error.message);
          },
        },
      );
    }
  }

  const pwBorder =
    touched && !isValid
      ? "border-[#B23A2E] focus:border-[#B23A2E]"
      : touched && isValid
        ? "border-[#2F6E4F] focus:border-[#2F6E4F]"
        : "border-[#D8D3C4] focus:border-[#1B2A41]";

  const confirmBorder =
    confirm.length > 0 && !confirmMatches
      ? "border-[#B23A2E] focus:border-[#B23A2E]"
      : confirmMatches
        ? "border-[#2F6E4F] focus:border-[#2F6E4F]"
        : "border-[#D8D3C4] focus:border-[#1B2A41]";

  if (submitted) {
    return (
      <div className="min-h-screen w-full flex  justify-center p-4 font-serif">
        <div className="w-full max-w-md bg-white rounded-sm p-8 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-full bg-[#2F6E4F] flex items-center justify-center">
              <Check size={28} className="text-[#F7F5EF]" strokeWidth={3} />
            </div>
          </div>
          <h2 className="text-xl text-[#1B2A41] mb-2">Ballot secured</h2>
          <p className="font-sans text-sm text-[#6B6656] leading-relaxed mb-5">
            Your voting credentials are set. Keep your password private. It's
            what protects your vote.
          </p>
          <Button
            className="font-sans text-[13px]"
            onClick={() => router.push("/login")}
          >
            Login in with your credentials
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex justify-center p-4 font-serif">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-md bg-white rounded-sm p-7 pt-0"
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className="w-9.5 h-9.5 rounded-full bg-[#FBEAE7] flex items-center justify-center shrink-0 mt-0.5">
            <Vote size={20} className="text-[#B23A2E]" strokeWidth={2.25} />
          </div>
          <div>
            <div className="font-mono text-[11px] tracking-wider uppercase text-[#B23A2E] font-semibold mb-1">
              Student Voting Platform
            </div>
            <h1 className="text-xl font-semibold text-[#1B2A41] leading-tight">
              Create your ballot password
            </h1>
          </div>
        </div>

        {/* Progress ticks */}
        <div className="flex gap-1.5 mb-5" aria-hidden="true">
          {requirements.map((r, i) => (
            <div
              key={r.id}
              className={`flex-1 h-0.75 rounded-full transition-colors duration-200 ${
                i < passedCount ? "bg-[#2F6E4F]" : "bg-[#E3DFD3]"
              }`}
            />
          ))}
        </div>

        {/* Password field */}
        <label
          htmlFor="pw"
          className="block font-sans text-xs font-semibold text-[#1B2A41] mb-1.5"
        >
          Password
        </label>
        <div className="relative flex items-center">
          <Input
            id="pw"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Type a password"
            aria-invalid={touched && !isValid}
            aria-describedby="pw-requirements"
            className={`w-full font-sans text-[15px] text-[#1B2A41] bg-white rounded-sm border-[1.5px] outline-none pl-3 pr-10 py-2.5 transition-colors ${pwBorder}`}
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            aria-label={showPw ? "Hide password" : "Show password"}
            className="absolute right-3 flex items-center justify-center text-[#6B6656] hover:text-[#1B2A41]"
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Requirement checklist */}
        <ul
          id="pw-requirements"
          className="mt-3 p-3 bg-[#F7F5EF] border border-[#EDE9DC] rounded-sm"
        >
          {requirements.map((r) => {
            const pass = r.test(password);
            return (
              <li key={r.id} className="flex items-center gap-2.5 py-[3px]">
                <span
                  className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${
                    pass
                      ? "bg-[#2F6E4F] border-[#2F6E4F]"
                      : "bg-transparent border-[#B7B2A2]"
                  }`}
                >
                  {pass && (
                    <Check
                      size={12}
                      className="text-[#F7F5EF]"
                      strokeWidth={3}
                    />
                  )}
                </span>
                <span
                  className={`font-mono text-[12.5px] ${
                    pass ? "text-[#1B2A41]" : "text-[#6B6656]"
                  }`}
                >
                  {r.label}
                </span>
              </li>
            );
          })}
        </ul>

        {/* Confirm field */}
        <label
          htmlFor="pw-confirm"
          className="block font-sans text-xs font-semibold text-[#1B2A41] mb-1.5 mt-4"
        >
          Confirm password
        </label>
        <div className="relative flex items-center">
          <Input
            id="pw-confirm"
            type={showPw ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Type it again"
            className={`w-full font-sans text-[15px] text-[#1B2A41] bg-white rounded-sm border-[1.5px] outline-none pl-3 pr-10 py-2.5 transition-colors ${confirmBorder}`}
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            aria-label={showPw ? "Hide password" : "Show password"}
            className="absolute right-3 flex items-center justify-center text-[#6B6656] hover:text-[#1B2A41]"
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {confirm.length > 0 && !confirmMatches && (
          <div className="flex items-center font-sans text-[12.5px] text-[#B23A2E] mt-2">
            <X size={13} className="mr-1.5 shrink-0" />
            Passwords don't match
          </div>
        )}

        {touched && !isValid && (
          <div className="flex items-center font-sans text-[12.5px] text-[#B23A2E] mt-2">
            <X size={13} className="mr-1.5 shrink-0" />
            {result.error.issues[0].message}
          </div>
        )}
        {error && (
          <div className="flex items-center font-sans text-[12.5px] text-[#B23A2E] mt-2">
            <X size={13} className="mr-1.5 shrink-0" />
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={!(isValid && confirmMatches)}
          className={`w-full mt-6 py-3 rounded-sm font-sans text-[14.5px] font-semibold tracking-wide transition-opacity ${
            isValid && confirmMatches
              ? "opacity-100 cursor-pointer"
              : "opacity-50 cursor-not-allowed"
          }`}
        >
          {isPending ? (
            <LoaderCircleIcon className="animate-spin text-white size-4" />
          ) : (
            <>Cast &amp; secure password</>
          )}
        </Button>
      </form>
    </div>
  );
}
