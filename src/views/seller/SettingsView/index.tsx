"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileTab }       from "./ProfileTab"
import { AvailabilityTab }  from "./AvailabilityTab"
import { NotificationsTab } from "./NotificationsTab"
import type { SellerSettingsData } from "@/types/seller"

export function SellerSettingsView({ settings }: { settings: SellerSettingsData }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-0.5">Manage your profile, availability, and notification preferences</p>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-card p-6">
        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab defaults={settings} />
          </TabsContent>

          <TabsContent value="availability">
            <AvailabilityTab defaults={settings} />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsTab defaults={settings} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
