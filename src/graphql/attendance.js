import { gql } from "@apollo/client";

export const ATTENDANCE_CHECK = gql`
mutation AttendanceCheck($employeeId: ID!) {
  attendanceCheck(employee_id: $employeeId) {
    status
    message
  }
}
`