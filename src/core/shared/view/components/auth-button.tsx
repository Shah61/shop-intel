import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession } from "@/src/core/lib/dummy-session-provider";
import { logoutMutation } from "@/src/features/auth/presentation/tanstack/auth-tanstack";

const AuthButton = () => {
    const { data: session } = useSession();
    const { mutate: logout } = logoutMutation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <img
                    src={"/Icon.png"}
                    alt="user avatar"
                    className="rounded-full w-8 h-8 sm:w-10 sm:h-10 object-cover ml-1 sm:ml-2 cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 sm:w-56 mx-2 sm:mx-5">
                <DropdownMenuLabel>
                    <div className="space-y-1 flex flex-col items-start">
                        <p className="text-sm sm:text-base">Shop Intel</p>
                        <p className="text-xs sm:text-sm font-light truncate max-w-[200px]">{session?.user_entity?.email || 'ShopIntel@gmail.com'}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => logout()}>
                    <p className="cursor-pointer text-red-500">Logout</p>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default AuthButton;