import { prisma } from "@/lib/prisma";
import styles from "./wishlist.module.css";
import Link from "next/link";
import { ChevronLeft, Gift, CheckCircle2 } from "lucide-react";
import WishlistClient from "./WishlistClient";

export default async function WishlistPage() {
    const items = await prisma.wishlistItem.findMany({
        orderBy: { createdAt: "asc" },
    });

    return (
        <div className={styles.container}>
            <nav className={styles.nav}>
                <Link href=".." className={styles.backLink}>
                    <ChevronLeft size={20} />
                    <span>Tilbake</span>
                </Link>
            </nav>

            <main className={styles.main}>
                <header className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <Gift size={40} className={styles.mainIcon} />
                    </div>
                    <h1 className="title-gradient">Vår Ønskeliste</h1>
                    <p className={styles.intro}>
                        Her er en oversikt over ting vi ønsker oss til vårt nye hjem.
                        Hvis du kjøper noe, vennligst marker det her slik at andre ser at det er kjøpt.
                    </p>
                </header>

                <section className={styles.grid}>
                    {items.length === 0 ? (
                        <div className={`${styles.empty} glass`}>
                            <p>Ønskelisten er foreløpig tom. Kom gjerne tilbake senere!</p>
                        </div>
                    ) : (
                        items.map((item: any) => (
                            <div key={item.id} className={`${styles.card} glass ${item.isPurchased ? styles.purchased : ""}`}>
                                <div className={styles.itemContent}>
                                    {item.imageUrl && (
                                        <div className={styles.imageWrapper}>
                                            <img src={item.imageUrl} alt={item.title} className={styles.productImage} />
                                        </div>
                                    )}
                                    <h3>{item.title}</h3>
                                    {item.description && <p className={styles.description}>{item.description}</p>}
                                    {item.link && (
                                        <a href={item.link} target="_blank" rel="noopener noreferrer" className={styles.link}>
                                            Se produktet
                                        </a>
                                    )}
                                </div>

                                <div className={styles.footer}>
                                    {item.isPurchased ? (
                                        <div className={styles.status}>
                                            <CheckCircle2 size={20} className={styles.checkIcon} />
                                            <span>Kjøpt av {item.purchasedBy}</span>
                                        </div>
                                    ) : (
                                        <WishlistClient itemId={item.id} title={item.title} />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </section>
            </main>
        </div>
    );
}
