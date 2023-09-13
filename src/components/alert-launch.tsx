import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "./ui/alert-dialog"
  import { Button } from "./ui/button"

import { useState } from "react"

import { Skeleton } from "./ui/skeleton"
  
  export default function LaunchAlert(props: any) {
    // const [open, setOpen] = useState(false);
    console.log('props', props);
    let open = props.isOpen;
    let psContent = props.psContent;
    let psStderr = '';
    let psStdout = '';
    if(psContent.stderr) {
      psStderr = psContent.stderr;
    }
    if(psContent.stdout) {
      psStdout = psContent.stdout;
    }
    console.log(psContent);
    console.log(props.psContent);
    return (
      <AlertDialog  open={open}>
      {/* <AlertDialog  open={open} onOpenChange={setOpen} > */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vagrantfile has been created, please wait for your VM up.. ⏳</AlertDialogTitle>
            <AlertDialogDescription>
            {psStdout
              ? <div className="bg-[#18181b] p-2 rounded-xl" >
                {psStdout}
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
  