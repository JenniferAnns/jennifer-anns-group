import { UserLabel, tagSchema } from "@/utils/types";
import { Tag, VStack } from "@chakra-ui/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { z } from "zod";
import { PageRequiredGameQuery } from "../ThemesTags/GamesSection";
import { AllBuilds } from "@/utils/types";
import { capitalizeFirstLetter } from "@/utils/consts";

interface Props {
  setFilters: Dispatch<SetStateAction<PageRequiredGameQuery>>;
  filters: PageRequiredGameQuery;
  userLabel: UserLabel | undefined;
  onClose: () => void;
}

export default function FilterBody({
  setFilters,
  filters,
  userLabel,
  onClose,
}: Props) {
  const gameBuildsMap: Record<string, string> = {
    Amazon: "amazon",
    Android: "android",
    "App Store": "appstore",
    Linux: "linux",
    Mac: "mac",
    WebGL: "webgl",
    Windows: "windows",
  };
  const gameContentOptions = [
    "Parenting guide",
    "Lesson plan",
    "Video trailer",
    "Answer key",
  ];
  const [accessibilityOptions, setAccessibilityOptions] = useState<string[]>(
    [],
  );
  const [tagsOptions, setTagsOptions] = useState<string[]>([]);
  const [selectedGameBuilds, setSelectedGameBuilds] = useState<string[]>([]);
  const [selectedAccessibility, setSelectedAccessibility] = useState<string[]>(
    [],
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedGameContent, setSelectedGameContent] = useState<string[]>([]);

  useEffect(() => {
    getAllTags();
  }, []);

  async function getAllTags() {
    const response = await fetch(`/api/tags`);
    const data = await response.json();
    setAccessibilityOptions(
      data.accessibility.map((a: z.infer<typeof tagSchema>) => {
        return a.name;
      }),
    );
    setTagsOptions(
      data.custom.map((t: z.infer<typeof tagSchema>) => {
        return t.name;
      }),
    );
  }

  function applyFilters() {
    setFilters({
      ...filters,
      gameBuilds: selectedGameBuilds,
      accessibility: selectedAccessibility,
      tags: selectedTags,
      gameContent: selectedGameContent,
      page: 1,
    });
    onClose();
  }

  function clearSelections() {
    setSelectedGameBuilds([]);
    setSelectedAccessibility([]);
    setSelectedTags([]);
    setSelectedGameContent([]);
    const { gameBuilds, accessibility, tags, gameContent, ...rest } = filters;
    setFilters(rest);
  }

  return (
    <div className="ml-16">
      <p className="mb-5 mt-[93px] font-sans font-extrabold text-gray-500">
        Game builds
      </p>
      <div className="mb-[52px] mr-[52px]">
        {Object.keys(gameBuildsMap).map((gameBuild) => {
          return (
            <Tag
              key={gameBuild}
              variant={
                !selectedGameBuilds.includes(gameBuildsMap[gameBuild])
                  ? "filter"
                  : "filter_selected"
              }
              onClick={() => {
                if (selectedGameBuilds.includes(gameBuildsMap[gameBuild])) {
                  setSelectedGameBuilds(
                    selectedGameBuilds.filter((gb) => {
                      return gb !== gameBuildsMap[gameBuild];
                    }),
                  );
                } else {
                  setSelectedGameBuilds([
                    ...selectedGameBuilds,
                    gameBuildsMap[gameBuild],
                  ]);
                }
              }}
              cursor="pointer"
            >
              {gameBuild}
            </Tag>
          );
        })}
      </div>

      <p className="mb-5 font-sans font-extrabold text-gray-500">
        Game content
      </p>
      <VStack align="start" mb="52px">
        {gameContentOptions.map((content) => {
          return (
            (content !== "Answer key" ||
              userLabel === "administrator" ||
              userLabel === "parent" ||
              userLabel === "educator") && (
              <div key={content} className="flex items-center align-baseline">
                <input
                  id={content}
                  value={content}
                  onChange={() => {
                    if (selectedGameContent.includes(content)) {
                      setSelectedGameContent(
                        selectedGameContent.filter((gc) => {
                          return gc !== content;
                        }),
                      );
                    } else {
                      setSelectedGameContent([...selectedGameContent, content]);
                    }
                  }}
                  className="peer mr-2 h-4 w-4 cursor-pointer rounded-none transition-colors duration-200 checked:text-blue-primary"
                  name={content}
                  type="checkbox"
                  checked={selectedGameContent.includes(content)}
                />
                <label
                  htmlFor={content}
                  className="ml-2 cursor-pointer font-sans text-sm text-gray-500 peer-checked:text-blue-primary"
                >
                  {content}
                </label>
              </div>
            )
          );
        })}
      </VStack>

      <p className="mb-5 font-sans font-extrabold text-gray-500">
        Accessibility
      </p>
      <div className="mb-[52px]">
        {accessibilityOptions.map((a) => {
          return (
            <Tag
              key={a}
              variant={
                !selectedAccessibility.includes(a)
                  ? "filter"
                  : "filter_selected"
              }
              onClick={() => {
                if (selectedAccessibility.includes(a)) {
                  setSelectedAccessibility(
                    selectedAccessibility.filter((acc) => {
                      return acc !== a;
                    }),
                  );
                } else {
                  setSelectedAccessibility([...selectedAccessibility, a]);
                }
              }}
              cursor="pointer"
            >
              {a}
            </Tag>
          );
        })}
      </div>

      <p className="mb-5 font-sans font-extrabold text-gray-500">Tags</p>
      <div className="mb-[52px]">
        {tagsOptions?.map((t) => {
          return (
            <Tag
              key={t}
              variant={!selectedTags.includes(t) ? "filter" : "filter_selected"}
              onClick={() => {
                if (selectedTags.includes(t)) {
                  setSelectedTags(
                    selectedTags.filter((tag) => {
                      return tag !== t;
                    }),
                  );
                } else {
                  setSelectedTags([...selectedTags, t]);
                }
              }}
              cursor="pointer"
            >
              {t}
            </Tag>
          );
        })}
      </div>

      <div className=" mb-[60px] mr-[52px] flex flex-row justify-between">
        <button
          onClick={clearSelections}
          className="font-sans font-semibold text-blue-primary"
        >
          Clear
        </button>
        <button
          onClick={applyFilters}
          className="h-12 w-28 rounded-md bg-blue-primary font-sans font-semibold text-white"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
