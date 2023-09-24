import {
    AlertDialog,
    // AlertDialogAction,
    // AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    // AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    // AlertDialogTrigger,
  } from "./ui/alert-dialog"
//   import { Button } from "./ui/button"

// import { useState } from "react"

import { Skeleton } from "./ui/skeleton"
  
  export default function DownloadAlert(props: any) {
    // const [open, setOpen] = useState(false);
    
    let open = props.isOpen;
    let progress = props.progress;
    return (
      <AlertDialog  open={open}>
      {/* <AlertDialog  open={open} onOpenChange={setOpen} > */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Downloading your box, please wait.. ⏳</AlertDialogTitle>
            <AlertDialogDescription>
            {progress
              ? <div className="bg-[#18181b] p-2 rounded-xl" >
                {progress}
                </div>
              : <Skeleton className="h-4 p-2 rounded-xl" />
            }

            </AlertDialogDescription>
          </AlertDialogHeader>
          {/* <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter> */}
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  