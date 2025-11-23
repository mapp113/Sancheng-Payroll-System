import {SalaryInfoPage} from "./salary-info-page";

type PageProps = {
    searchParams?: Record<string, string | string[] | undefined>;
};

export default function SalaryInfoIndexPage({searchParams}: PageProps) {
    const employeeCode = searchParams?.employeeCode;
    return (
        <SalaryInfoPage
            employeeCode={Array.isArray(employeeCode) ? employeeCode[0] : employeeCode}
        />
    );
}
