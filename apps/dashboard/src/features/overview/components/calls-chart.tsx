import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@receptionist/ui/components/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@receptionist/ui/components/chart";
import { Skeleton } from "@receptionist/ui/components/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@receptionist/ui/components/toggle-group";
import { useId, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { QueryError } from "../../../components/query-error";
import { useReducedMotion } from "../../../hooks/use-reduced-motion";
import { formatNumber, formatShortDate } from "../../../lib/format";
import { useCallVolume } from "../api";
import { type ChartRange, chartRanges, fromDayKey, volumeInRange } from "../summary";

const config = {
  answered: { label: "Answered", color: "var(--chart-1)" },
  booked: { label: "Booked", color: "var(--chart-2)" },
} satisfies ChartConfig;

/** dashboard-01's interactive area chart: calls answered and booked per day, over 3 months, 30 or 7 days. */
export function CallsChart() {
  const volume = useCallVolume();
  const [range, setRange] = useState<ChartRange>("30d");
  const reducedMotion = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const days = volume.data ? volumeInRange(volume.data, range) : [];
  const label = chartRanges.find((option) => option.value === range)?.label;
  const totals = days.reduce(
    (sum, day) => ({ answered: sum.answered + day.answered, booked: sum.booked + day.booked }),
    { answered: 0, booked: 0 },
  );

  return (
    <Card className="gap-4 shadow-xs">
      <CardHeader className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle role="heading" aria-level={2} className="text-[15px] font-semibold">
            Calls
          </CardTitle>
          <CardDescription className="text-[13px]">Answered and booked, last {label}</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <ul aria-hidden className="flex gap-4 text-[13px] text-foreground/80">
            {(Object.keys(config) as (keyof typeof config)[]).map((key) => (
              <li key={key} className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-[3px]" style={{ background: config[key].color }} />
                {config[key].label}
              </li>
            ))}
          </ul>
          <ToggleGroup
            aria-label="Chart range"
            value={[range]}
            onValueChange={(value) => value[0] && setRange(value[0] as ChartRange)}
            spacing={0.5}
            className="rounded-lg bg-muted p-[3px]"
          >
            {chartRanges.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                size="sm"
                className="rounded-md! px-2.5 text-xs text-muted-foreground hover:bg-transparent aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-xs dark:aria-pressed:bg-input/50"
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-4">
        {volume.isError && <QueryError title="Couldn't load the chart" onRetry={() => volume.refetch()} />}
        {volume.isPending && <Skeleton className="h-[220px] w-full" />}
        {volume.data && (
          <>
            <p className="sr-only">
              {formatNumber(totals.answered)} calls answered and {formatNumber(totals.booked)} bookings over the last{" "}
              {label}.
            </p>
            <ChartContainer config={config} className="aspect-auto h-[220px] w-full">
              <AreaChart data={days} margin={{ left: 8, right: 8, top: 4 }}>
                <defs>
                  <linearGradient id={`${id}-answered`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-answered)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--color-answered)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id={`${id}-booked`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-booked)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--color-booked)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="4 4" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value: string) => formatShortDate(fromDayKey(value))}
                  className="font-mono"
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      labelFormatter={(value) => formatShortDate(fromDayKey(String(value)))}
                    />
                  }
                />
                <Area
                  dataKey="answered"
                  type="monotone"
                  fill={`url(#${id}-answered)`}
                  stroke="var(--color-answered)"
                  strokeWidth={2}
                  isAnimationActive={!reducedMotion}
                />
                <Area
                  dataKey="booked"
                  type="monotone"
                  fill={`url(#${id}-booked)`}
                  stroke="var(--color-booked)"
                  strokeWidth={1.5}
                  isAnimationActive={!reducedMotion}
                />
              </AreaChart>
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
