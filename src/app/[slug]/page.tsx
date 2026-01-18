import Home from "../page";

export default async function SlugPage(props: any) {
    // Inject slug from params into searchParams for the Home component
    const params = await props.params;
    const searchParams = await props.searchParams;

    return <Home searchParams={{ ...searchParams, slug: params.slug }} />;
}
