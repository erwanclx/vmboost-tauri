import { Separator } from "./separator"

export function Navbar() {

    return (
        <header className="flex justify-evenly h-16 items-center px-4 border titlebar">
            <a className="text-sm font-medium transition-colors hover:text-primary" href="/examples/dashboard">Create your VM</a>
            <Separator orientation="vertical" />
            <a className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary" href="/examples/dashboard">Search for a box</a>
        </header>
    )
}