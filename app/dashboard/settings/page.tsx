"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SettingsForm } from "@/components/settings-form"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"

export default function SettingsPage() {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b">
                    <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mx-2 data-[orientation=vertical]:h-4"
                        />
                        <h1 className="text-base font-medium">Settings</h1>
                    </div>
                </header>
                <div className="flex flex-1 flex-col">
                    <SettingsForm />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
