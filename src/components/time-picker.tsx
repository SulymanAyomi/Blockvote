import { useState, useRef, useEffect, RefObject } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1–12
const MINUTES = Array.from({ length: 60 }, (_, i) => i); // 0–59
const PERIODS = ["AM", "PM"];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

interface ColumnProps {
  label: string;
  width: string;
  items: number[] | string[];
  render: (h: any) => any;
  selected: number | string;
  onPick: (m: any) => any;
  itemRefs: RefObject<any>;
}

function Column({
  label,
  width,
  items,
  render,
  selected,
  onPick,
  itemRefs,
}: ColumnProps) {
  return (
    <div className={cn("flex flex-col", width)}>
      <div className="select-none pt-2.5 pb-1.5 text-center text-xs font-medium uppercase tracking-widest text-slate-400">
        {label}
      </div>
      <ScrollArea className="h-28">
        <Command className="bg-transparent">
          <CommandList className="max-h-none overflow-visible p-1">
            <CommandGroup>
              {items.map((item) => {
                const isSelected = item === selected;
                return (
                  <CommandItem
                    key={item}
                    value={String(item)}
                    // @ts-ignore
                    ref={(el) => (itemRefs.current[item] = el)}
                    onSelect={() => onPick(item)}
                    className={cn(
                      "mb-1 flex h-9 cursor-pointer items-center justify-center rounded-md font-mono text-sm tabular-nums",
                      isSelected
                        ? "bg-primary-col text-white data-[selected=true]:bg-primary-col data-[selected=true]:text-white"
                        : "text-slate-600 data-[selected=true]:bg-slate-100 data-[selected=true]:text-slate-900",
                    )}
                  >
                    {render(item)}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </ScrollArea>
    </div>
  );
}

export default function TimePicker({
  defaultHour = 9,
  defaultMinute = 0,
  defaultPeriod = "AM",
  onChange = (label: string) => {},
}) {
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState(defaultHour);
  const [minute, setMinute] = useState(defaultMinute);
  const [period, setPeriod] = useState(defaultPeriod);

  const hourRefs = useRef<any>({});
  const minuteRefs = useRef<any>({});
  const periodRefs = useRef<any>({});

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      hourRefs.current[hour]?.scrollIntoView({ block: "center" });
      minuteRefs.current[minute]?.scrollIntoView({ block: "center" });
      periodRefs.current[period]?.scrollIntoView({ block: "center" });
    });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  function emit(h: number, m: number, p: string) {
    onChange(`${h}:${pad(m)} ${p}`);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-12 rounded-md justify-start gap-2 border border-input bg-bg-color1 px-3 py-1 font-mono text-sm tabular-nums hover:bg-slate-50"
        >
          <Clock className="h-4 w-4 text-slate-400" />
          {hour}:{pad(minute)} {period}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-auto rounded-md border-slate-200 p-2 pb-0 shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
          <span className="text-sm font-medium text-slate-700">Set time</span>
          <span className="font-mono text-sm tabular-nums text-slate-900">
            {hour}:{pad(minute)} {period}
          </span>
        </div>

        <div className="flex divide-x divide-slate-100">
          <Column
            label="Hour"
            width="w-16"
            items={HOURS}
            render={(h) => h}
            selected={hour}
            itemRefs={hourRefs}
            onPick={(h) => {
              setHour(h);
              emit(h, minute, period);
            }}
          />
          <Column
            label="Min"
            width="w-16"
            items={MINUTES}
            render={(m) => pad(m)}
            selected={minute}
            itemRefs={minuteRefs}
            onPick={(m) => {
              setMinute(m);
              emit(hour, m, period);
            }}
          />
          <Column
            label="—"
            width="w-14"
            items={PERIODS}
            render={(p) => p}
            selected={period}
            itemRefs={periodRefs}
            onPick={(p) => {
              setPeriod(p);
              emit(hour, minute, p);
            }}
          />
        </div>

        <div className="border-t border-slate-100 p-2">
          <Button size="sm" className="w-full" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
