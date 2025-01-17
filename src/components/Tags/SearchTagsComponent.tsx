import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Paper, { PaperProps } from "@mui/material/Paper";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { z } from "zod";
import { themeSchema, tagSchema } from "@/utils/types";
import { ThemeProvider } from "@mui/material";
import muiTheme from "@/styles/muiTheme";

const themeDataSchema = themeSchema.extend({
  _id: z.string().length(24),
});

const tagDataSchema = tagSchema.extend({
  _id: z.string().length(24),
});

interface Tags {
  accessibility: z.infer<typeof tagDataSchema>[];
  custom: z.infer<typeof tagDataSchema>[];
}

interface Props {
  setSearch: Dispatch<SetStateAction<boolean>>;
  currThemes: z.infer<typeof themeDataSchema>[];
  setCurrThemes: Dispatch<z.infer<typeof themeDataSchema>[]>;
  currTags: z.infer<typeof tagDataSchema>[];
  setCurrTags: Dispatch<z.infer<typeof tagDataSchema>[]>;
}

export default function SearchTagsComponent({
  setSearch,
  currThemes,
  setCurrThemes,
  currTags,
  setCurrTags,
}: Props) {
  const [themes, setThemes] = useState<z.infer<typeof themeDataSchema>[]>();
  const tagsVar: Tags = {
    accessibility: [],
    custom: [],
  };
  type TagOrTheme =
    | z.infer<typeof tagDataSchema>
    | z.infer<typeof themeDataSchema>;
  const [tags, setTags] = useState<Tags>(tagsVar);
  const [options, setOptions] = useState<TagOrTheme[]>([]);

  useEffect(() => {
    getThemes();
    getTags();
  }, []);

  useEffect(() => {
    if (themes) {
      themes.map((theme) => {
        if (
          !currThemes.some((curr) => curr.name === theme.name) &&
          !options.some((option) => option.name === theme.name)
        ) {
          setOptions((options) => [...options, theme]);
        }
      });
    }
  }, [themes]);

  useEffect(() => {
    if (tags) {
      tags.accessibility.map((tag) => {
        if (
          !currTags.some((curr) => curr.name === tag.name) &&
          !options.some((option) => option.name === tag.name)
        ) {
          setOptions((options) => [...options, tag]);
        }
      });
      tags.custom.map((tag) => {
        if (
          !currTags.some((curr) => curr.name === tag.name) &&
          !options.some((option) => option.name === tag.name)
        ) {
          setOptions((options) => [...options, tag]);
        }
      });
    }
  }, [tags]);

  async function getThemes() {
    const response = await fetch("/api/themes");
    const data = await response.json();
    setThemes(data);
  }

  async function getTags() {
    const response = await fetch("/api/tags");
    const data = await response.json();
    setTags(data);
  }

  const handleSelection = (event: React.SyntheticEvent, newValue: any) => {
    if (newValue) {
      if (tagDataSchema.safeParse(newValue).success) {
        setCurrTags([...currTags, newValue]);
      } else {
        setCurrThemes([...currThemes, newValue]);
      }
    }
    setSearch(false);
  };

  const CustomPaper: React.FC<PaperProps> = (props) => {
    return (
      <Paper
        sx={{ border: "1px solid black", borderRadius: "10px" }}
        elevation={0}
        {...props}
      />
    );
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={options}
        getOptionLabel={(t) => t.name}
        className="font-sans"
        onChange={handleSelection}
        PaperComponent={CustomPaper}
        sx={{
          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
            {
              border: "1px solid black",
            },
          width: 560,
        }}
        renderInput={(params) => (
          <TextField
            className=""
            {...params}
            placeholder="Search themes/tags"
          />
        )}
      />
    </ThemeProvider>
  );
}
