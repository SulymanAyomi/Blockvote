"use client";
import React, { useMemo, useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  X,
  Check,
  ArrowLeft,
  Users,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Loader2,
  SlidersHorizontal,
  Ticket,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useElectionId } from "@/features/elections/hooks/use-get-election-id";
import { useGetAllVoters } from "../api/use-get-all-voters";
import { useGetAllPositions } from "../api/use-get-all-positions";
import PageLoading from "@/app/loading";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAllElectionCandidates } from "../api/use-get-all-candidates";
import { voterType } from "@/features/candidate/type";
import { useGetAllDepartments } from "../api/use-get-all-departments";
import { departmentNameTruncate } from "@/lib/utils";

const DEPARTMENTS = [
  "Computer Science",
  "Economics",
  "Mass Communication",
  "Accounting",
  "Political Science",
  "Microbiology",
  "Law",
  "Architecture",
];

const FACULTIES = {
  "Computer Science": "Science",
  Economics: "Social Sciences",
  "Mass Communication": "Arts",
  Accounting: "Management Sciences",
  "Political Science": "Social Sciences",
  Microbiology: "Science",
  Law: "Law",
  Architecture: "Environmental Sciences",
};

const LEVELS = ["100", "200", "300", "400", "500"];
const GENDERS = ["Male", "Female"];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
const AVATAR_PALETTE = [
  ["#EEF2FF", "#16308F"],
  ["#EAF7EE", "#157F3C"],
  ["#FBF2E2", "#B4740E"],
  ["#FDECEA", "#C4291D"],
  ["#F1EEFC", "#5B31C9"],
];
function avatarColors(seed: string) {
  let n = 0;
  for (const ch of seed) n += ch.charCodeAt(0);
  return AVATAR_PALETTE[n % AVATAR_PALETTE.length];
}

function Avatar({ name }: { name: string }) {
  const [bg, fg] = avatarColors(name);
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold"
      style={{ background: bg, color: fg, fontFamily: "Manrope, sans-serif" }}
    >
      {initials(name)}
    </div>
  );
}

const PAGE_SIZE = 8;

type PositionVoters = Record<string, Set<string>>;

const SelectCandidate = () => {
  const electionId = useElectionId();
  const position_max = 5;
  // const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [voters, setVoters] = useState([]);

  const { data, isLoading } = useGetAllVoters({
    electionId,
  });
  const { data: positionData, isLoading: positionDataLoading } =
    useGetAllPositions({
      electionId,
    });
  const { data: candidates, isLoading: candidatesLoading } =
    useGetAllElectionCandidates({
      electionId,
    });
  const { data: depData, isLoading: depDataLoading } = useGetAllDepartments({
    electionId,
  });

  const [positionId, setPositionId] = useState("");
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState(null);
  const [faculty, setFaculty] = useState(null);
  const [level, setLevel] = useState(null);
  const [gender, setGender] = useState(null);
  const [eligOnly, setEligOnly] = useState(true);

  //   // selections keyed by position id -> Set of voter ids
  const [selections, setSelections] = useState<PositionVoters>({});
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState(null);
  const [limitNotice, setLimitNotice] = useState(false);

  useEffect(() => {
    if (positionId) return;
    if (positionData) {
      setPositionId(positionData.positions[0].id);
    }
  }, [positionData]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!limitNotice) return;
    const t = setTimeout(() => setLimitNotice(false), 2400);
    return () => clearTimeout(t);
  }, [limitNotice]);

  const position = positionData?.positions.find((p) => p.id === positionId);
  const selectedSet = selections[positionId] || new Set();

  const alreadyCandidateCount = useMemo(
    () => data?.voters.filter((v) => isAlreadyCandidateFor(v.id)).length,
    [data, positionId],
  );

  const totalAssigned = (alreadyCandidateCount ?? 0) + selectedSet.size;
  const limitReached = position_max != null && totalAssigned >= position_max;

  useEffect(() => {
    setPage(1);
  }, [query, dept, faculty, level, gender, eligOnly, positionId]);

  function isAlreadyCandidateFor(id: string) {
    return candidates?.candidates.some(
      (v) => v.voterId === id && v.electionPositionId === positionId,
    );
  }

  function isAlreadyCandidateSomewhere(id: string) {
    return candidates?.candidates.some((v) => v.voterId === id);
  }
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data?.voters.filter((v) => {
      if (
        q &&
        !(v.fullName.toLowerCase().includes(q) || v.idNumber.includes(q))
      )
        return false;
      if (dept && v.department !== dept) return false;
      // if (faculty && v.faculty !== faculty) return false;
      if (level && v.level !== level) return false;
      // if (gender && v.gender !== gender) return false;
      // if (eligOnly && !v.eligible) return false;
      return true;
    });
  }, [data, query, dept, faculty, level, gender, eligOnly]);

  const totalPages = Math.max(
    1,
    Math.ceil((filtered?.length ?? 0) / PAGE_SIZE),
  );
  const pageVoters = filtered?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selectableOnPage = pageVoters?.filter((v) =>
    isAlreadyCandidateFor(v.id),
  );
  const allPageSelected =
    (selectableOnPage?.length ?? 0) > 0 &&
    selectableOnPage?.every((v) => selectedSet.has(v.id));

  function toggleVoter(v: voterType) {
    if (isAlreadyCandidateFor(v.id)) return;
    setSelections((prev) => {
      const cur = new Set(prev[positionId] || []);
      if (cur.has(v.id)) {
        cur.delete(v.id);
      } else {
        if (
          position_max != null &&
          alreadyCandidateCount! + cur.size >= position_max
        ) {
          setLimitNotice(true);
          return prev;
        }
        cur.add(v.id);
      }
      return { ...prev, [positionId]: cur };
    });
  }

  function toggleSelectAllOnPage() {
    setSelections((prev) => {
      const cur = new Set(prev[positionId] || []);
      if (allPageSelected) {
        selectableOnPage?.forEach((v) => cur.delete(v.id));
        return { ...prev, [positionId]: cur };
      }
      let room =
        position_max == null
          ? Infinity
          : position_max - alreadyCandidateCount! - cur.size;
      let hitLimit = false;

      for (const v of selectableOnPage!) {
        if (cur.has(v.id)) continue;
        if (room <= 0) {
          hitLimit = true;
          break;
        }
        cur.add(v.id);
        room--;
      }
      if (hitLimit) setLimitNotice(true);
      return { ...prev, [positionId]: cur };
    });
  }

  function removeSelected(voterId: string) {
    setSelections((prev) => {
      const cur = new Set(prev[positionId] || []);
      cur.delete(voterId);
      return { ...prev, [positionId]: cur };
    });
  }

  function clearFilters() {
    setQuery("");
    setDept(null);
    setFaculty(null);
    setLevel(null);
    setGender(null);
    setEligOnly(true);
  }

  const backendCandidates = candidates?.candidates.filter(
    (v) => v.electionPositionId == positionId,
  );
  const selectedCandidates = data?.voters.filter((v) => selectedSet.has(v.id));
  const hasFiltersActive =
    query || dept || faculty || level || gender || !eligOnly;

  // function handleConfirm() {
  //   setConfirming(true);
  //   setTimeout(() => {
  //     setVoters((prev) =>
  //       prev.map((v) =>
  //         selectedSet.has(v.id) ? { ...v, candidateFor: positionId } : v,
  //       ),
  //     );
  //     setSelections((prev) => ({ ...prev, [positionId]: new Set() }));
  //     setConfirming(false);
  //     setConfirmOpen(false);
  //     setToast(
  //       `${selectedCandidates.length} candidate${selectedCandidates.length !== 1 ? "s" : ""} added for ${position.label}`,
  //     );
  //   }, 900);
  // }

  // if (isLoading || positionDataLoading || candidatesLoading) {
  //   return <PageLoading />;
  // }
  const loading =
    isLoading || positionDataLoading || candidatesLoading || depDataLoading;
  if (!positionData) {
    return <div>Error position</div>;
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: "#F6F8FB", fontFamily: "Inter, sans-serif" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-30 border-b border-slate-200 px-5 py-3.5 sm:px-8"
        style={{ background: "#16308F" }}
      >
        <div className="mx-auto flex max-w-350 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white">
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className="text-[16.5px] font-bold text-white"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  Select Candidates
                </h1>
                <Badge variant={"green"}>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#157F3C]" />{" "}
                  Voting open
                </Badge>
              </div>
              <p className="text-[12.5px] text-white/70">
                Student Union Election · 2026/2027
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-[12.5px] font-medium text-white/90 sm:flex">
            <Users size={14} />
            {
              data?.voters.filter((v) => isAlreadyCandidateFor(v.id)).length
            }{" "}
            total candidates so far
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-350 px-5 py-6 sm:px-8">
        {/* Position bar */}
        <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <label className="text-[12.5px] font-semibold uppercase tracking-wide text-slate-400">
              Position{" "}
            </label>
            <div className="relative">
              <Select
                value={positionId}
                onValueChange={(e) => setPositionId(e)}
                // className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-[14px] font-semibold text-slate-800 outline-none transition-colors focus:border-[#2454E8]"
                // style={{ fontFamily: "Manrope, sans-serif" }}
                defaultValue={positionId}
              >
                <SelectTrigger className="w-full min-w-32 bg-brand-ash py-2 text-[14px] font-semibold text-slate-800 outline-none">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {positionData?.positions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.position.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-[13px] text-slate-500">
              <span
                className="mr-1 font-bold text-slate-800"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                {totalAssigned}
              </span>
              {position_max != null ? (
                <>
                  of{" "}
                  <span style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    {position_max}
                  </span>{" "}
                  candidates assigned
                </>
              ) : (
                "candidates assigned"
              )}
            </div>
            {position_max != null && (
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (totalAssigned / position_max) * 100)}%`,
                    background: limitReached ? "#C4291D" : "#2454E8",
                  }}
                />
              </div>
            )}
            {limitReached && <Badge variant={"amber"}>Limit reached</Badge>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          {/* Left: search/filters + table */}
          <div>
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name or student ID…"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-[14px] text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-[#2454E8] focus:bg-white"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowFilters((s) => !s)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[13px] font-medium text-slate-600 hover:border-slate-300 lg:hidden"
                  >
                    <SlidersHorizontal size={14} /> Filters
                  </button>
                  <div
                    className={`${showFilters ? "flex" : "hidden lg:flex"} flex-wrap items-center gap-2`}
                  >
                    <FilterChip
                      label="Department"
                      value={dept}
                      options={depData?.departments.map((d) => d.name)}
                      onChange={setDept}
                    />
                    <FilterChip
                      label="Faculty"
                      value={faculty}
                      options={depData?.faculty.map((d) => d.name)}
                      onChange={setFaculty}
                    />
                    <FilterChip
                      label="Level"
                      value={level}
                      options={LEVELS}
                      onChange={setLevel}
                    />
                    <FilterChip
                      label="Gender"
                      value={gender}
                      options={GENDERS}
                      onChange={setGender}
                    />
                    <button
                      onClick={() => setEligOnly((e) => !e)}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors ${
                        eligOnly
                          ? "border-[#2454E8] bg-[#EEF2FF] text-[#16308F]"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      Eligible only
                    </button>
                    {hasFiltersActive && (
                      <button
                        onClick={clearFilters}
                        className="text-[13px] font-medium text-slate-400 hover:text-[#C4291D]"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Table card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-2 text-[13px] text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {filtered?.length}
                  </span>{" "}
                  eligible voters found
                </div>
                {selectedSet.size > 0 && (
                  <span className="rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[12px] font-semibold text-[#16308F]">
                    {selectedSet.size} selected
                  </span>
                )}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
                  <Loader2 size={22} className="animate-spin" />
                  <p className="text-[13.5px]">Loading eligible voters…</p>
                </div>
              ) : errored ? (
                <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FDECEA] text-[#C4291D]">
                    <AlertTriangle size={20} />
                  </div>
                  <p className="text-[14px] font-semibold text-slate-700">
                    Couldn't load voters
                  </p>
                  <p className="max-w-xs text-[13px] text-slate-500">
                    Something went wrong reaching the voter roll. Check your
                    connection and try again.
                  </p>
                  <button
                    onClick={() => setErrored(false)}
                    className="mt-1 rounded-lg bg-[#2454E8] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1D42C4]"
                  >
                    Retry
                  </button>
                </div>
              ) : filtered?.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Search size={20} />
                  </div>
                  <p className="text-[14px] font-semibold text-slate-700">
                    No voters match these filters
                  </p>
                  <p className="max-w-xs text-[13px] text-slate-500">
                    Try a different search term or clear filters to see the full
                    voter roll.
                  </p>
                  {hasFiltersActive && (
                    <button
                      onClick={clearFilters}
                      className="mt-1 rounded-lg border border-slate-200 px-4 py-2 text-[13px] font-semibold text-slate-600 hover:border-slate-300"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11.5px] font-semibold uppercase tracking-wide text-slate-400">
                        <th className="w-11 px-4 py-2.5">
                          <input
                            type="checkbox"
                            checked={allPageSelected}
                            onChange={toggleSelectAllOnPage}
                            className="h-4 w-4 rounded accent-[#2454E8]"
                          />
                        </th>
                        <th className="px-2 py-2.5">Voter</th>
                        <th className="px-2 py-2.5">Student ID</th>
                        <th className="px-2 py-2.5">Department</th>
                        <th className="px-2 py-2.5">Faculty</th>
                        <th className="px-2 py-2.5">Level</th>
                        <th className="px-2 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageVoters?.map((v) => {
                        const isCandidateHere = isAlreadyCandidateFor(v.id);
                        const isCandidateElsewhere =
                          isAlreadyCandidateSomewhere(v.id);
                        const checked = selectedSet.has(v.id);
                        const disabled = isCandidateHere;
                        return (
                          <tr
                            key={v.id}
                            onClick={() => toggleVoter(v)}
                            className={`border-b border-slate-50 text-[13.5px] transition-colors last:border-0 ${
                              disabled
                                ? "cursor-not-allowed opacity-60"
                                : "cursor-pointer hover:bg-slate-50"
                            } ${checked ? "bg-[#F5F7FF]" : ""}`}
                          >
                            <td
                              className="px-4 py-2.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={disabled}
                                onChange={() => toggleVoter(v)}
                                className="h-4 w-4 rounded accent-[#2454E8] disabled:opacity-40"
                              />
                            </td>
                            <td className="px-2 py-2.5">
                              <div className="flex items-center gap-2.5">
                                {v.imageUrl ? (
                                  <img
                                    className="h-9 w-9 object-cover rounded-full"
                                    src={v.imageUrl}
                                  />
                                ) : (
                                  <Avatar name={v.fullName} />
                                )}
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-slate-800">
                                    {v.fullName}
                                  </p>
                                  <p className="truncate text-[12px] text-slate-400">
                                    {v.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td
                              className="px-2 py-2.5 text-slate-500"
                              style={{
                                fontFamily: "JetBrains Mono, monospace",
                              }}
                            >
                              {v.idNumber}
                            </td>
                            <td className="px-2 py-2.5 text-slate-600">
                              {v.department?.name}
                            </td>
                            <td className="px-2 py-2.5 text-slate-500">
                              {v.faculty?.name}
                            </td>
                            <td className="px-2 py-2.5 text-slate-500">
                              {v.level}L
                            </td>
                            <td className="px-2 py-2.5">
                              {isCandidateHere ? (
                                <Badge variant="green">
                                  <Check size={11} /> Candidate
                                </Badge>
                              ) : isCandidateElsewhere ? (
                                <Badge variant="blue">
                                  Running · other role
                                </Badge>
                              ) : (
                                // : !v.eligible ? (
                                //   <Badge variant="red">Not eligible</Badge>
                                // )
                                <Badge variant="neutral">Eligible</Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                    <p className="text-[12.5px] text-slate-400">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-slate-300 disabled:opacity-40"
                      >
                        <ChevronLeft size={15} />
                      </button>
                      <button
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-slate-300 disabled:opacity-40"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right: ballot-stub selection panel */}
          <div className="space-y-2">
            <aside className="lg:sticky lg:top-[88px] lg:h-fit">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* serrated stub edge */}
                <div
                  className="flex justify-between px-3"
                  style={{
                    background: "#16308F",
                    backgroundImage:
                      "radial-gradient(circle at 8px 0, #F6F8FB 7px, transparent 7.5px)",
                    backgroundSize: "16px 8px",
                    backgroundRepeat: "repeat-x",
                    backgroundPosition: "bottom",
                    paddingTop: "14px",
                    paddingBottom: "18px",
                  }}
                >
                  <div className="flex items-center gap-2 text-white">
                    <Ticket size={16} />
                    <span
                      className="text-[13.5px] font-bold"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      Selected candidates
                    </span>
                  </div>
                  <span
                    className="rounded-full bg-white/15 px-2 py-0.5 text-[12px] font-bold text-white"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  >
                    {selectedSet.size}
                  </span>
                </div>

                <div className="px-4 pb-4 pt-3">
                  <p className="mb-3 text-[12px] font-medium text-slate-400">
                    Contesting for{" "}
                    <span className="text-slate-600">
                      {position?.position.name}
                    </span>
                  </p>

                  {selectedCandidates?.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 px-3 py-8 text-center">
                      <p className="text-[13px] text-slate-400">
                        No candidates selected yet. Tick voters from the list to
                        add them here.
                      </p>
                    </div>
                  ) : (
                    <ul className="mb-3 max-h-90 space-y-1 overflow-y-auto">
                      {selectedCandidates?.map((c, i) => (
                        <li
                          key={c.id}
                          className="group flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50/60 px-2.5 py-2 transition-colors animate-[fadeIn_.2s_ease]"
                        >
                          <span
                            className="w-5 shrink-0 text-[11px] font-semibold text-slate-400"
                            style={{ fontFamily: "JetBrains Mono, monospace" }}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {c.imageUrl ? (
                            <img
                              className="h-9 w-9 object-cover rounded-full"
                              src={c.imageUrl}
                            />
                          ) : (
                            <Avatar name={c.fullName} />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-semibold text-slate-800">
                              {c.fullName}
                            </p>
                            <p
                              className="text-[11px] text-slate-400"
                              style={{
                                fontFamily: "JetBrains Mono, monospace",
                              }}
                            >
                              {c.idNumber}
                            </p>
                          </div>
                          <button
                            onClick={() => removeSelected(c.id)}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-300 opacity-0 transition-opacity hover:bg-[#FDECEA] hover:text-[#C4291D] group-hover:opacity-100"
                            title="Remove"
                          >
                            <X size={13} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {limitNotice && (
                    <p className="mb-2 flex items-center gap-1.5 rounded-lg bg-[#FBF2E2] px-2.5 py-1.5 text-[12px] font-medium text-[#8A5A09]">
                      <AlertTriangle size={13} /> Limit of {position_max}{" "}
                      reached for {position?.position.name}
                    </p>
                  )}

                  <button
                    onClick={() =>
                      (selectedCandidates?.length ?? 0) > 0 &&
                      setConfirmOpen(true)
                    }
                    disabled={selectedCandidates?.length === 0}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2454E8] py-2.5 text-[13.5px] font-semibold text-white shadow-sm transition-colors hover:bg-[#1D42C4] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                  >
                    Confirm candidates
                  </button>
                  <p className="mt-2 text-center text-[11.5px] text-slate-400">
                    Selections are kept while you search or filter.
                  </p>
                </div>
              </div>
            </aside>{" "}
            <aside className="lg:sticky lg:top-22 lg:h-fit">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* serrated stub edge */}
                <div
                  className="flex justify-between px-3"
                  style={{
                    background: "#38953f",
                    backgroundImage:
                      "radial-gradient(circle at 8px 0, #F6F8FB 7px, transparent 7.5px)",
                    backgroundSize: "16px 8px",
                    backgroundRepeat: "repeat-x",
                    backgroundPosition: "bottom",
                    paddingTop: "14px",
                    paddingBottom: "18px",
                  }}
                >
                  <div className="flex items-center gap-2 text-white">
                    <Ticket size={16} />
                    <span
                      className="text-[13.5px] font-bold"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      Confirmed candidates
                    </span>
                  </div>
                  <span
                    className="rounded-full bg-white/15 px-2 py-0.5 text-[12px] font-bold text-white"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  >
                    {selectedSet.size}
                  </span>
                </div>

                <div className="px-4 pb-4 pt-3">
                  <p className="mb-3 text-[12px] font-medium text-slate-400">
                    Contesting for{" "}
                    <span className="text-slate-600">
                      {position?.position.name}
                    </span>
                  </p>

                  {backendCandidates?.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 px-3 py-8 text-center">
                      <p className="text-[13px] text-slate-400">
                        No candidates selected yet. Tick voters from the list to
                        add them here.
                      </p>
                    </div>
                  ) : (
                    <ul className="mb-3 max-h-90 space-y-1 overflow-y-auto">
                      {backendCandidates?.map((c, i) => {
                        const candidate = data?.voters.find(
                          (v) => v.id == c.voterId,
                        );
                        return (
                          <li
                            key={c.id}
                            className="group flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50/60 px-2.5 py-2 transition-colors animate-[fadeIn_.2s_ease]"
                          >
                            <span
                              className="w-5 shrink-0 text-[11px] font-semibold text-slate-400"
                              style={{
                                fontFamily: "JetBrains Mono, monospace",
                              }}
                            >
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            {c.imageUrl ? (
                              <img
                                className="h-9 w-9 object-cover rounded-full"
                                src={c.imageUrl}
                              />
                            ) : (
                              <Avatar name={candidate?.fullName!} />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-semibold text-slate-800">
                                {candidate?.fullName}
                              </p>
                              <p
                                className="text-[11px] text-slate-400"
                                style={{
                                  fontFamily: "JetBrains Mono, monospace",
                                }}
                              >
                                {candidate?.idNumber}
                              </p>
                            </div>
                            <button
                              onClick={() => removeSelected(c.id)}
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-300 opacity-0 transition-opacity hover:bg-[#FDECEA] hover:text-[#C4291D] group-hover:opacity-100"
                              title="Remove"
                            >
                              <X size={13} />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {limitNotice && (
                    <p className="mb-2 flex items-center gap-1.5 rounded-lg bg-[#FBF2E2] px-2.5 py-1.5 text-[12px] font-medium text-[#8A5A09]">
                      <AlertTriangle size={13} /> Limit of {position_max}{" "}
                      reached for {position?.position.name}
                    </p>
                  )}

                  <button
                    onClick={() =>
                      (selectedCandidates?.length ?? 0) > 0 &&
                      setConfirmOpen(true)
                    }
                    disabled={selectedCandidates?.length === 0}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2454E8] py-2.5 text-[13.5px] font-semibold text-white shadow-sm transition-colors hover:bg-[#1D42C4] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                  >
                    Confirm candidates
                  </button>
                  <p className="mt-2 text-center text-[11.5px] text-slate-400">
                    Selections are kept while you search or filter.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SelectCandidate;

function FilterChip({
  label,
  value,
  options,
  onChange,
}: {
  label: string | null;
  value: string | null;
  options: string[] | undefined;
  onChange: (opt: any) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors ${
          value
            ? "border-[#2454E8] bg-[#EEF2FF] text-[#16308F]"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
        }`}
      >
        {value || label}
        <ChevronDown
          size={14}
          className={
            open ? "rotate-180 transition-transform" : "transition-transform"
          }
        />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1.5 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            <button
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="flex w-full items-center px-3 py-1.5 text-left text-[13px] text-slate-500 hover:bg-slate-50"
            >
              All {label?.toLowerCase()}
            </button>
            {options?.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px] hover:bg-slate-50 ${
                  value === opt
                    ? "text-[#2454E8] font-semibold"
                    : "text-slate-700"
                }`}
              >
                {departmentNameTruncate(opt)}
                {value === opt && <Check size={14} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
