import { getAllEvents, getPendingUsers, getAllUsers } from "@/app/actions";
import SuperadminDashboard from "@/components/SuperadminDashboard";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SuperadminPage() {
    const session = await auth();

    if ((session?.user as any)?.role !== "SUPER_ADMIN") {
        redirect("/admin");
    }

    const eventsResult = await getAllEvents();
    const pendingUsersResult = await getPendingUsers();
    const allUsersResult = await getAllUsers();

    if (eventsResult.error) {
        return <div style={{ padding: "2rem", color: "#ff4444" }}>{eventsResult.error}</div>;
    }

    if (pendingUsersResult.error) {
        return <div style={{ padding: "2rem", color: "#ff4444" }}>{pendingUsersResult.error}</div>;
    }

    if (allUsersResult.error) {
        return <div style={{ padding: "2rem", color: "#ff4444" }}>{allUsersResult.error}</div>;
    }

    return (
        <main className="min-h-screen">
            <SuperadminDashboard
                initialEvents={eventsResult.events || []}
                initialPendingUsers={pendingUsersResult.users || []}
                initialAllUsers={allUsersResult.users || []}
            />
        </main>
    );
}
