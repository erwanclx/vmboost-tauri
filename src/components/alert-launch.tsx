import {
    AlertDialog,
    AlertDialogAction,
    // AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    // AlertDialogTrigger,
  } from "./ui/alert-dialog"
//   import { Button } from "./ui/button"

import { useState } from "react"

import { Skeleton } from "./ui/skeleton"
  
  export default function LaunchAlert(props: any) {
    let open = props.isOpen;
    let psContent = props.psContent;
    let psStderr = '';
    let content = ''
    let status = ''
    if(psContent.stderr) {
      content = psContent.stderr;
      status = 'error'
    } else {
      content = psContent.stdout;
      status = 'success'
    }
    return (
      <AlertDialog open={open}>
      {/* <AlertDialog  open={open} onOpenChange={setOpen} > */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vagrantfile has been created, please wait for your VM up.. ⏳</AlertDialogTitle>
            <AlertDialogDescription>
            {content
              ? <div className="bg-[#18181b] p-2 rounded-xl max-h-96 overflow-y-scroll" >
                {content}
                </div>
              : <Skeleton className="h-4 p-2 rounded-xl" />
            }

            </AlertDialogDescription>
          </AlertDialogHeader>
            <AlertDialogFooter>
              {content
                ? <AlertDialogAction onClick={ () => { props.setOpen(false) }} >
                  {
                    status === 'success'
                    ? 'That\'s up ! 🔥'
                    : 'Oh no ! An error occured 😱'
                  }
                </AlertDialogAction>
                : ''
              }
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  