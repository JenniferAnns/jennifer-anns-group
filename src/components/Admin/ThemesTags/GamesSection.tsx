import { useQuery } from "@tanstack/react-query";
import { Input } from "../../ui/input";
import { DataTable } from "../Table/DataTable";
import { columns } from "../Table/ThemesColumns";
import { useCallback, useEffect, useState } from "react";
import { GameQuery, GetGamesOutput } from "@/pages/api/games";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../ui/pagination";
import FilterPopover from "./FilterPopover";
import { Filter } from "lucide-react";

export type PageRequiredGameQuery = GameQuery &
  Required<Pick<GameQuery, "page">>;
type IncDecInput = { type: "inc" | "dec" };
type DirectInput = { desiredPage: number };
type PageChangeHandlerInput = IncDecInput | DirectInput;

export function generateQueryUrl(filters: GameQuery) {
  let gamesUrl = "/api/games";
  const searchParams: string[] = [];
  Object.keys(filters).forEach((k) => {
    const val = filters[k as keyof GameQuery];
    if (Array.isArray(val)) {
      val.forEach((filterVal) => {
        searchParams.push(`${k}=${filterVal}`);
      });
    } else {
      searchParams.push(`${k}=${val}`);
    }
  });
  return `${gamesUrl}?${searchParams.join("&")}`;
}

function GamesSection() {
  const [filters, setFilters] = useState<PageRequiredGameQuery>({
    page: 1,
  });

  const { status: gamesStatus, data } = useQuery({
    queryKey: ["allGames", filters],
    queryFn: () =>
      fetch(generateQueryUrl(filters)).then((res) =>
        res.json(),
      ) as Promise<GetGamesOutput>,
  });

  const games = data?.games;
  const numPages = data?.numPages;
  const [items, setItems] = useState<Array<string | number>>([]);

  const handlePageChange = useCallback(
    (input: PageChangeHandlerInput) => {
      const type = Object.hasOwn(input, "type")
        ? (input as IncDecInput).type
        : undefined;
      const desiredPage = Object.hasOwn(input, "desiredPage")
        ? (input as DirectInput).desiredPage
        : undefined;
      const currentPage = filters.page;

      const modifier = type === "inc" ? 1 : -1;
      const targetPage = desiredPage || currentPage + modifier;
      if (numPages === undefined) return;
      if (targetPage <= 0) return;
      if (targetPage > numPages) return;
      setFilters({ ...filters, page: targetPage });
    },
    [filters.page, numPages],
  );

  useEffect(() => {
    if (!numPages) return;
    const newItems = pagination(4)(filters.page, numPages);
    setItems(newItems);
  }, [filters.page, numPages]);

  const { floor, min, max } = Math;
  const range = (lo: number, hi: number) =>
    Array.from({ length: hi - lo }, (_, i) => i + lo);

  const pagination =
    (count: number, ellipsis = "…") =>
    (page: number, total: number) => {
      const start = max(
        1,
        min(page - floor((count - 3) / 2), total - count + 2),
      );
      const end = Math.min(
        total,
        Math.max(page + floor((count - 4 + 2 * (count % 2)) / 2), count - 1),
      );
      return [
        ...(start > 2
          ? start === 3
            ? [1, 2]
            : [1, ellipsis]
          : start > 1
            ? [1]
            : []),
        ...range(start, end + 1),
        ...(end < total - 1
          ? end === total - 2
            ? [total - 1, total]
            : [ellipsis, total]
          : end < total
            ? [total]
            : []),
      ];
    };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-row content-start gap-2">
        <Input
          className="w-40"
          placeholder="Filter by name"
          onChange={(e) => {
            const { name, ...rest } = filters;
            const value = e.target.value;
            if (value.length === 0) {
              setFilters(rest);
            }
            if (value.length < 3 || value.length > 50) return;
            setFilters({
              ...rest,
              name: e.target.value,
              page: 1,
            });
          }}
        />
        <FilterPopover filters={filters} setFilters={setFilters} />
      </div>
      <div className="w-full">
        {games && <DataTable columns={columns} data={games} />}
      </div>
      {gamesStatus === "success" ? (
        <Pagination>
          <PaginationContent>
            <PaginationItem
              onClick={() =>
                handlePageChange({
                  type: "dec",
                })
              }
            >
              <PaginationPrevious disabled={filters.page === 1} />
            </PaginationItem>
            {items.map((page, index) => {
              if (typeof page === "string") {
                return (
                  <PaginationItem key={index}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              } else {
                return (
                  <PaginationItem
                    key={index}
                    onClick={() =>
                      handlePageChange({
                        desiredPage: page,
                      })
                    }
                  >
                    <PaginationLink isActive={page === filters.page}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
            })}
            <PaginationItem
              onClick={() =>
                handlePageChange({
                  type: "inc",
                })
              }
            >
              <PaginationNext disabled={filters.page === numPages!} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  );
}

export default GamesSection;
