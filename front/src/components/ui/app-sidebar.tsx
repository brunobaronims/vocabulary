import { gql } from "@apollo/client"
import { useMutation } from "@apollo/client/react"
import { DoorOpen, User } from "lucide-react"
import { useNavigate } from "react-router"
import { getRoleFromToken } from "@/lib/auth"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

const LOGOUT = gql`
  mutation Logout {
    logout
  }
`

export function AppSidebar() {
    const navigate = useNavigate()
    const [logout, { loading }] = useMutation(LOGOUT)
    const role = getRoleFromToken(localStorage.getItem("accessToken"))
    const canCreateUser = role === "TEACHER" || role === "ADMIN"

    const handleLogout = async () => {
        try {
            await logout()
        } finally {
            localStorage.removeItem("accessToken")
            navigate("/login", { replace: true })
        }
    }

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Vocabulary</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {canCreateUser ? (
                                <SidebarMenuItem className="cursor-pointer">
                                    <SidebarMenuButton
                                        type="button"
                                        onClick={() => navigate("/register")}
                                    >
                                        <User />
                                        <span>Create user</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ) : null}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    type="button"
                                    onClick={handleLogout}
                                    disabled={loading}
                                    className="cursor-pointer"
                                >
                                    <DoorOpen />
                                    <span>Logout</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
