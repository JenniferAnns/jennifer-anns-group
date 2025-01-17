import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  ChakraProvider,
  FormControl,
  Input,
  FormLabel,
  Button,
  Icon,
  Image,
  Flex,
} from "@chakra-ui/react";
import chakraTheme from "@/styles/chakraTheme";
import { useRouter } from "next/compat/router";
import { useRef, useState, useEffect, Dispatch } from "react";
import { GameDataState } from "./GamePage";
export const youtubeREGEX =
  /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?$/;
export const vimeoREGEX =
  /(http|https)?:\/\/(www\.|player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|video\/|)(\d+)(?:|\/\?)/;
interface Props {
  gameData: GameDataState;
  setGameData: Dispatch<GameDataState>;
}

export default function AddEditVideoTrailer({ gameData, setGameData }: Props) {
  const router = useRouter();
  const gameID = router?.query.id;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const [url, setUrl] = useState(gameData?.videoTrailer ?? "");
  const [issue, setIssue] = useState("");
  const [addButton, setAddButton] = useState(true);
  useEffect(() => {
    if (gameData?.videoTrailer === undefined || gameData?.videoTrailer === "") {
      setAddButton(true);
    } else {
      setAddButton(false);
    }
  }, [gameData, isOpen]);
  useEffect(() => {
    setIssue("");
  }, [isOpen]);
  async function addVideoTrailer() {
    if (url === "") {
      setIssue("Required text field missing!");
      return;
    }
    if (youtubeREGEX.test(url) || vimeoREGEX.test(url)) {
      gameData.videoTrailer = url;
      setGameData({ ...gameData, videoTrailer: url });
      onClose();
    } else {
      setIssue("Invalid URL (Only Youtube and Vimeo videos supported)");
    }
  }
  async function editVideoTrailer() {
    if (url === "") {
      setIssue("Required text field missing!");
      return;
    }
    if (youtubeREGEX.test(url) || vimeoREGEX.test(url)) {
      gameData.videoTrailer = url;
      onClose();
      router?.push(`/games/${gameID}/edit`);
    } else {
      setIssue("Invalid URL (Only Youtube and Vimeo videos supported)");
    }
  }

  return (
    <ChakraProvider theme={chakraTheme}>
      <div>
        {addButton ? (
          <button
            onClick={onOpen}
            className="flex items-center gap-1 rounded-md border border-font-1000 bg-white px-4 py-3 font-sans text-lg font-medium text-font-1000 hover:bg-gray-100"
          >
            Add Trailer
            <Icon as={Image} src={"/link.svg"} boxSize="20px" />
          </button>
        ) : (
          <button
            onClick={onOpen}
            className="flex items-center gap-1 rounded-md border border-font-1000 bg-white px-4 py-3 font-sans text-lg font-medium text-font-1000 hover:bg-gray-100"
          >
            Edit Trailer
            <Icon
              as={Image}
              src={"/pencileditIconOutline.svg"}
              boxSize="20px"
            />
          </button>
        )}
        <AlertDialog
          motionPreset="slideInBottom"
          leastDestructiveRef={cancelRef}
          onClose={onClose}
          isOpen={isOpen}
          isCentered
        >
          <AlertDialogOverlay />

          <AlertDialogContent height="274" maxWidth="809">
            <AlertDialogHeader p="0">
              <div className="float-left mx-[40px] mt-[20px] text-center text-[26px] font-bold leading-tight text-blue-primary">
                {addButton ? "Add Trailer" : "Edit Trailer"}
              </div>
            </AlertDialogHeader>
            <AlertDialogBody p="2" mt="20px" mx="20px">
              <div className="text-center font-sans text-base font-normal">
                <FormControl className="flex flex-col justify-center">
                  <Flex className="flex-row items-center justify-center">
                    <FormLabel
                      className="mt-5 text-center font-bold"
                      htmlFor="url"
                    >
                      URL<span className="text-delete-red">*</span>
                    </FormLabel>
                    <Input
                      id="url"
                      className="mb-2 mt-6"
                      borderColor="black"
                      borderWidth="1.5px"
                      type="text"
                      value={url}
                      onChange={(event) => {
                        setUrl(event.target.value);
                      }}
                      placeholder="https://www.youtube.com"
                    />
                  </Flex>
                  {issue !== "" ? (
                    <FormLabel htmlFor="url" className="ml-12 text-delete-red">
                      <Icon
                        as={Image}
                        className="mr-2"
                        src={"/error.svg"}
                        boxSize="20px"
                      />
                      {issue}
                    </FormLabel>
                  ) : null}
                </FormControl>
              </div>
            </AlertDialogBody>
            <AlertDialogFooter p="0" justifyContent="end">
              <button
                onClick={onClose}
                className="mb-7 mr-[22px] h-[42px] w-[94px] rounded-[5px] font-sans font-semibold text-blue-primary"
              >
                Cancel
              </button>
              <button
                ref={cancelRef}
                onClick={addButton ? addVideoTrailer : editVideoTrailer}
                className="mb-7 mr-[30px] h-[42px] w-[94px] rounded-[5px]  bg-blue-primary font-sans font-semibold text-white"
              >
                Done
              </button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ChakraProvider>
  );
}
