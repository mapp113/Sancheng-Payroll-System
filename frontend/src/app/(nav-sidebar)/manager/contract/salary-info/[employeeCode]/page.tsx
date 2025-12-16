import {SalaryInfoPage} from "../salary-info-page";

type PageProps = {
    params: Promise<{ employeeCode?: string | string[] }>;
};

export default async function SalaryInfoByCodePage({params}: PageProps) {
    const {employeeCode} = await params ?? {};
    const normalizedCode = Array.isArray(employeeCode) ? employeeCode[0] : employeeCode;
    return <SalaryInfoPage employeeCode={normalizedCode}/>;
}