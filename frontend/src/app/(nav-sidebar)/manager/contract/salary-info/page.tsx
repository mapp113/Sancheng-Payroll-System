import {SalaryInfoPage} from "./salary-info-page";

type PageProps = {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SalaryInfoIndexPage({searchParams}: PageProps) {
    const resolvedSearchParams = await searchParams;
    const employeeCode = resolvedSearchParams?.employeeCode;
    return (
        <SalaryInfoPage
            employeeCode={Array.isArray(employeeCode) ? employeeCode[0] : employeeCode}
        />
    );
}
