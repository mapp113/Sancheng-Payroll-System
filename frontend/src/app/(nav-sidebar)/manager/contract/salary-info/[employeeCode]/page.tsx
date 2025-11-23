import {SalaryInfoPage} from "../salary-info-page";

type PageProps = {
    params: { employeeCode?: string | string[] };
};

export default function SalaryInfoByCodePage({params}: PageProps) {
    const {employeeCode} = params ?? {};
    const normalizedCode = Array.isArray(employeeCode) ? employeeCode[0] : employeeCode;
    return <SalaryInfoPage employeeCode={normalizedCode}/>;
}