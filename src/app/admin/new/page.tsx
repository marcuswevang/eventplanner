import OnboardingWizard from "@/components/OnboardingWizard";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function NewEventPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <OnboardingWizard />
        </main>
    );
}
