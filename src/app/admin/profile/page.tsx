import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UserProfileForm from "@/components/UserProfileForm";
import AdminSidebar from "@/components/AdminSidebar";
import styles from "@/app/admin/admin.module.css";

export default async function ProfilePage(props: { searchParams: Promise<{ eventId?: string }> }) {
    const searchParams = await props.searchParams;
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const userId = (session.user as any).id;
    const eventId = searchParams?.eventId || "";

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
            <AdminSidebar
                eventId={eventId}
                userId={userId}
                userRole={(session.user as any).role}
                activeTab="profile"
                showTesting={false}
            />

            <main className={styles.main} style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <header className={styles.header}>
                    <div>
                        <h1 className="title-gradient">Min Profil</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Administrer din konto og sikkerhetsinnstillinger.</p>
                    </div>
                </header>

                <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                    <UserProfileForm user={session.user} />
                </div>
            </main>
        </div>
    );
}
