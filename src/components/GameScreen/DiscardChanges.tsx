import chakraTheme from "@/styles/chakraTheme";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  ChakraProvider,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/compat/router";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  gameID: string | string[] | undefined;
  preview: boolean;
}

export default function DiscardChanges({ gameID, preview }: Props) {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  const discard = () => {
    if (preview) {
      router?.push(`/games/${gameID}/preview`);
    } else {
      router?.push(`/games/${gameID}`);
    }
  };

  return (
    <ChakraProvider theme={chakraTheme}>
      <div>
        <Button
          onClick={onOpen}
          variant="outline2"
          className="px-5 py-6 text-xl font-semibold"
        >
          Discard changes
        </Button>
        <AlertDialog
          motionPreset="slideInBottom"
          leastDestructiveRef={cancelRef}
          onClose={onClose}
          isOpen={isOpen}
          isCentered
        >
          <AlertDialogOverlay />

          <AlertDialogContent
            border="4px"
            borderColor="brand.600"
            height="444"
            maxWidth="585"
          >
            <div>
              <AlertDialogCloseButton mr="50px" mt="50px" color="brand.600" />
            </div>
            <AlertDialogHeader p="0">
              <div className="mx-[110px] mt-[100px] text-center text-[26px] font-bold leading-tight text-blue-primary">
                Are you sure you want to discard your changes?
              </div>
            </AlertDialogHeader>
            <AlertDialogBody p="0" mt="50px">
              <div className="mb-10 text-center font-sans text-base font-normal">
                All unsaved changes will be lost.
              </div>
            </AlertDialogBody>
            <AlertDialogFooter p="0" justifyContent="center">
              <button
                onClick={discard}
                className="mb-24 mr-[22px] h-[47px] w-[198px] rounded-[10px] bg-blue-primary font-sans font-semibold text-white"
              >
                Yes, discard
              </button>
              <button
                ref={cancelRef}
                onClick={onClose}
                className="mb-24 ml-[22px] h-[47px] w-[198px] rounded-[10px] border-[1px] border-solid border-black font-sans font-semibold"
              >
                No, return
              </button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ChakraProvider>
  );
}
