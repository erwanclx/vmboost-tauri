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
  import { Progress } from "./ui/progress"
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
              // ? <div className="bg-[#18181b] p-2 rounded-xl" >
              //   {progress}
              //   </div>
              ?
                <Progress className="w-full" value={progress} max={100} />
              : <Skeleton className="h-4 p-2 rounded-xl" />
            }

            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  