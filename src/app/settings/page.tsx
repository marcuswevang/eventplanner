import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UserProfileForm from "@/components/UserProfileForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import styles from "@/app/admin/admin.module.css";

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <main className={styles.main} style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <Link href="/admin" style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                        <ArrowLeft size={24} />
                        <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Tilbake til Admin</span>
                    </Link>
                    <h1 style={{ margin: 0 }}>Profilinnstillinger</h1>
                </div>
                <p style={{ color: 'var(--text-muted)' }}>Administrer din konto og sikkerhetsinnstillinger.</p>
            </header>

            <UserProfileForm user={session.user} />
        </main>
    );
}
