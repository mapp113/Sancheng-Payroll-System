const USE_SAMPLE_DATA = false;
const API_URL = "http://localhost:8080/api/attsummary";

import type {TimesheetParam, TimesheetRecord} from "./type";

// const SAMPLE_DATA: TimesheetRecord[] = [
//   {
//     employeeCode: 'E001',
//     fullName: 'John Doe',
//     positionName: 'Software Engineer',
//     daysHours: '160',
//     otHours: '20',
//     timeOff: '8',
//   },
//   {
//     employeeCode: 'E002',
//     fullName: 'Jane Smith',
//     positionName: 'Product Manager',
//     daysHours: '170',
//     otHours: '10',
//     timeOff: '5',
//   },
// ];

export async function TimesheetQuery(param: TimesheetParam): Promise<{ content: TimesheetRecord[], size: number }> {
    if (USE_SAMPLE_DATA) {
        // return { content: SAMPLE_DATA, size: SAMPLE_DATA.length };
    }
    const queryParams = new URLSearchParams();
    if (param.keyword) queryParams.set('keyword', param.keyword);
    if (param.date) queryParams.set('date', param.date + "-01");
    if (param.index) queryParams.set('page', param.index);
    const requestUrl = `${API_URL}?${queryParams.toString()}`;
    const response = await fetch(requestUrl);
    const data = await response.json();
    return {content: data.content, size: data.totalPages};
}