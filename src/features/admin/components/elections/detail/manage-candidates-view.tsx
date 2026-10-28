"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
  Ticket,
  Trash2,
  Users,
  X,
  XIcon,
} from "lucide-react";
import { useElection } from "../../../hooks/elections/use-election";
import {
  useAddCandidate,
  useRemoveCandidate,
} from "../../../hooks/elections/use-manage-candidates";
import { DetailPageSkeleton } from "../election-skeletons";
import { ElectionsErrorState } from "../election-empty-error-states";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { CandidateSummary } from "../../../type";
import { useElectionId } from "@/features/elections/hooks/use-get-election-id";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ElectionStatusBadge, LiveIndicator } from "../election-status-badge";
import { departmentNameTruncate } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useFaculty } from "@/features/admin/hooks/elections/use-faculty";
import { useDepartments } from "@/features/admin/hooks/elections/use-departments";
import { useCandidates } from "@/features/admin/hooks/elections/use-candidates";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import {
  useElectionPositions,
  usePositions,
} from "@/features/admin/hooks/elections/use-positions";
import { Pagination } from "../pagination";

const LEVELS = [
  { id: "100", name: "100" },
  { id: "200", name: "200" },
  { id: "300", name: "300" },
  { id: "400", name: "400" },
  { id: "500", name: "500" },
];
const GENDERS = ["Male", "Female"];

type PositionVoters = Record<string, Set<string>>;
type voterType = {
  id: string;
  fullName: string;
  imageUrl: string | null;
};

export function ManageCandidatesView() {
  const position_max = 5;

  const electionId = useElectionId();

  const { data, isLoading, isError, refetch } = useElection(electionId);
  const addCandidates = useAddCandidate();
  const removeCandidate = useRemoveCandidate();

  const [selectedPositionId, setSelectedPositionId] = useState<string>("");
  const [name, setName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<voterType | null>(null);
  const [errored, setErrored] = useState(false);
  const [selections, setSelections] = useState<PositionVoters>({});
  const [positionId, setPositionId] = useState("");
  const [query, setQuery] = useState<string | undefined>(undefined);
  const [dept, setDept] = useState(undefined);
  const [faculty, setFaculty] = useState(undefined);
  const [level, setLevel] = useState(undefined);
  const [gender, setGender] = useState(undefined);
  const [eligOnly, setEligOnly] = useState(true);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const [limitNotice, setLimitNotice] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: faculties } = useFaculty();
  const { data: departments } = useDepartments(faculty);
  const { data: candidates } = useCandidates({
    electionId,
    level,
    limit: "10",
    page: String(page),
    departmentId: dept,
    facultyId: faculty,
    search: query,
    // gender,
  });

  useEffect(() => {
    if (positionId) return;
    if (data?.positions) {
      setPositionId(data.positions[0].id);
    }
  }, [data]);

  function isAlreadyCandidateFor(id: string) {
    const isP = data?.positions
      .filter((p) => p.positionId == positionId)
      .some((c) => c.id == id);
    return isP ?? false;
  }

  function isAlreadyCandidateSomewhere(id: string) {
    // return candidates?.candidates.some((v) => v.voterId === id);
    const isP = data?.positions
      .filter((p) => p.positionId !== positionId)
      .some((c) => c.id == id);

    return isP ?? false;
  }

  function AddCandidates() {
    const newCandidates = [...selectedSet];
    addCandidates.mutate(
      {
        electionId,
        positionId,
        votersId: newCandidates,
      },
      {
        onSuccess: () =>
          setSelections((prev) => ({ ...prev, [positionId]: new Set() })),
      },
    );
  }

  const position = data?.positions.find((p) => p.id === positionId);
  const totalAssigned =
    data?.positions.find((p) => p.id == positionId)?.candidates.length ?? 0;
  const limitReached = position_max != null && totalAssigned >= position_max;
  const selectedSet = selections[positionId] || new Set();
  const selectableOnPage = candidates?.eligbleVoters.filter((v) =>
    isAlreadyCandidateFor(v.voter.id),
  );
  const allPageSelected =
    (selectableOnPage?.length ?? 0) > 0 &&
    selectableOnPage?.every((v) => selectedSet.has(v.id));

  const alreadyCandidateCount = useMemo(
    () => data?.positions.find((p) => p.id == positionId)?.candidates.length,
    [data, positionId],
  );

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

  function deptName(id: string) {
    const dept = departments?.find((d) => d.id == id);
    if (dept) {
      return departmentNameTruncate(dept?.name!);
    } else {
      return "NULL";
    }
  }

  function facultyName(id: string) {
    const fac = faculties?.find((d) => d.id == id);
    if (fac) {
      return departmentNameTruncate(fac?.name);
    } else {
      return "NULL";
    }
  }

  function clearFilters() {
    setQuery(undefined);
    setDept(undefined);
    setFaculty(undefined);
    setLevel(undefined);
    setGender(undefined);
    setEligOnly(true);
  }

  const backendCandidates = data?.positions.find((v) => v.id == positionId);
  const selectedCandidates = candidates?.eligbleVoters.filter((v) =>
    selectedSet.has(v.voter.id),
  );

  function DeleteVoter() {
    const candidate = backendCandidates?.candidates.find(
      (c) => c.voter.id == pendingDelete?.id,
    );
    if (candidate)
      removeCandidate.mutate(
        { electionId, positionId, candidateId: candidate?.id },
        { onSettled: () => setPendingDelete(null) },
      );
  }

  const hasFiltersActive =
    query || dept || faculty || level || gender || !eligOnly;

  const loading = isLoading;
  if (isLoading) return <DetailPageSkeleton />;
  if (isError || !data)
    return <ElectionsErrorState onRetry={() => refetch()} />;

  return (
    <div>
      <header
        className="sticky top-0 z-30 border-b border-slate-200 px-5 py-3.5 sm:px-8"
        style={{ background: "#16308F" }}
      >
        <div className="mx-auto flex max-w-350 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/elections/${electionId}`}
              className="inline-flex items-center gap-1.5 text-sm text-white transition hover:text-white/80"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className="text-[16.5px] font-bold text-white"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  Select Candidates
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <ElectionStatusBadge status={data.election.status} />
                  {data.election.status === "ACTIVE" && (
                    <LiveIndicator className="bg-green-200 text-green-900" />
                  )}
                </div>
              </div>
              <p className="text-[12.5px] text-white/70">
                {data.election.title} ·{" "}
                <span className="font-mono text-xs text-neutral-400">
                  {data.election.code}
                </span>
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-[12.5px] font-medium text-white/90 sm:flex">
            <Users size={14} />
            {/* {data?.voters.filter((v) => isAlreadyCandidateFor(v.id)).length} 0 */}
            0 total candidates so far
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
                    {data.positions.map((p) => (
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
                      <XIcon size={15} />
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
                      label="Faculty"
                      value={faculty}
                      options={faculties?.map((d) => ({
                        id: d.id,
                        name: d.name,
                      }))}
                      onChange={setFaculty}
                    />
                    <FilterChip
                      label="Department"
                      value={dept}
                      options={departments?.map((d) => ({
                        id: d.id,
                        name: d.name,
                      }))}
                      onChange={setDept}
                    />

                    <FilterChip
                      label="Level"
                      value={level}
                      options={LEVELS?.map((d) => ({ id: d.id, name: d.name }))}
                      onChange={setLevel}
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
                    {candidates?.total}
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
              ) : candidates?.total === 0 ? (
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
                      {candidates?.eligbleVoters.map((v) => {
                        const isCandidateHere = isAlreadyCandidateFor(
                          v.voter.id,
                        );
                        const isCandidateElsewhere =
                          isAlreadyCandidateSomewhere(v.voter.id);
                        const checked = selectedSet.has(v.voter.id);
                        const disabled = isCandidateHere;
                        return (
                          <tr
                            key={v.voter.id}
                            onClick={() => toggleVoter(v.voter)}
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
                                onChange={() => toggleVoter(v.voter)}
                                className="h-4 w-4 rounded accent-[#2454E8] disabled:opacity-40"
                              />
                            </td>
                            <td className="px-2 py-2.5">
                              <div className="flex items-center gap-2.5">
                                {v.voter.imageUrl ? (
                                  <img
                                    className="h-9 w-9 object-cover rounded-full"
                                    src={v.voter.imageUrl}
                                  />
                                ) : (
                                  <Avatar className="size-5 transition border border-neutral-300 rounded-full">
                                    <AvatarFallback className="bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center">
                                      {v.voter.fullName
                                        ?.charAt(0)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-slate-800">
                                    {v.voter.fullName}
                                  </p>
                                  <p className="truncate text-[12px] text-slate-400">
                                    {v.voter.email}
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
                              {v.voter.idNumber}
                            </td>
                            <td className="px-2 py-2.5 text-slate-600">
                              {deptName(v.voter.departmentId!)}
                            </td>
                            <td className="px-2 py-2.5 text-slate-500">
                              {facultyName(v.voter.facultyId!)}
                            </td>
                            <td className="px-2 py-2.5 text-slate-500">
                              {v.voter.level}L
                            </td>
                            <td className="px-2 py-2.5">
                              {isCandidateHere ? (
                                <Badge variant="green">
                                  <CheckIcon size={11} /> Candidate
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

                  {candidates && (
                    <Pagination
                      limit={candidates?.limit}
                      page={candidates?.page}
                      total={candidates?.total}
                      onPageChange={(page) => setPage(page)}
                    />
                  )}
                </>
              )}
            </div>
          </div>
          {/* Right: ballot-stub selection panel */}
          <div className="space-y-2">
            <aside className="lg:sticky lg:top-22 lg:h-fit">
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
                      {selectedCandidates?.map(
                        (c, i) =>
                          c && (
                            <li
                              key={c?.id}
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
                              {c?.voter.imageUrl ? (
                                <img
                                  className="h-9 w-9 object-cover rounded-full"
                                  src={c?.voter.imageUrl}
                                />
                              ) : (
                                <Avatar className="size-5 transition border border-neutral-300 rounded-full">
                                  <AvatarFallback className="bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center">
                                    {c?.voter.fullName?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-semibold text-slate-800">
                                  {c?.voter.fullName}
                                </p>
                                <p
                                  className="text-[11px] text-slate-400"
                                  style={{
                                    fontFamily: "JetBrains Mono, monospace",
                                  }}
                                >
                                  {c?.voter.idNumber}
                                </p>
                              </div>
                              <button
                                onClick={() => removeSelected(c?.voter.id)}
                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-300 opacity-0 transition-opacity hover:bg-[#FDECEA] hover:text-[#C4291D] group-hover:opacity-100"
                                title="Remove"
                              >
                                <X size={13} />
                              </button>
                            </li>
                          ),
                      )}
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
                      (selectedCandidates?.length ?? 0) > 0 && AddCandidates()
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
                    {backendCandidates?.candidates.length}
                  </span>
                </div>

                <div className="px-4 pb-4 pt-3">
                  <p className="mb-3 text-[12px] font-medium text-slate-400">
                    Contesting for{" "}
                    <span className="text-slate-600">
                      {position?.position.name}
                    </span>
                  </p>

                  {backendCandidates?.candidates.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 px-3 py-8 text-center">
                      <p className="text-[13px] text-slate-400">
                        No candidates set yet. Saved candidates would show here
                      </p>
                    </div>
                  ) : (
                    <ul className="mb-3 max-h-90 space-y-1 overflow-y-auto">
                      {backendCandidates?.candidates.map((c, i) => {
                        const candidate = candidates?.eligbleVoters.find(
                          (v) => v.voter.id == c.voter.id,
                        );
                        return (
                          <li
                            key={i}
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
                            {c.voter.fullName ? (
                              <img
                                className="h-9 w-9 object-cover rounded-full"
                                src={c.voter.imageUrl ?? ""}
                              />
                            ) : (
                              <></>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-semibold text-slate-800">
                                {c?.voter.fullName}
                              </p>
                              <p
                                className="text-[11px] text-slate-400"
                                style={{
                                  fontFamily: "JetBrains Mono, monospace",
                                }}
                              >
                                {candidate?.voter.idNumber}
                              </p>
                            </div>
                            <button
                              onClick={() => setPendingDelete(c.voter)}
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
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Remove Candidate?"
        description={`This will remove "${pendingDelete?.fullName}" from the ballot. This action may not be reversible.`}
        confirmLabel="Remove Candidate"
        cancelLabel="Keep Candidate"
        isLoading={removeCandidate.isPending}
        onConfirm={() => {
          if (!pendingDelete) return;
          DeleteVoter();
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

function FilterChip({
  label,
  value,
  options,
  onChange,
}: {
  label: string | undefined;
  value: string | undefined;
  options:
    | {
        id: string;
        name: string;
      }[]
    | undefined;
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
        {options?.find((v) => v.id == value)?.name || label}
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
                onChange(undefined);
                setOpen(false);
              }}
              className="flex w-full items-center px-3 py-1.5 text-left text-[13px] text-slate-500 hover:bg-slate-50"
            >
              All {label?.toLowerCase()}
            </button>
            {options?.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px] hover:bg-slate-50 ${
                  value === opt.id
                    ? "text-[#2454E8] font-semibold"
                    : "text-slate-700"
                }`}
              >
                {departmentNameTruncate(opt.name)}
                {value === opt.id && <CheckIcon size={14} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
