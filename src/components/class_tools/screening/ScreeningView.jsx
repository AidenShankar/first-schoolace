import React from 'react';
import TeacherScreeningDashboard from './TeacherScreeningDashboard';
import StudentScreeningTest from './StudentScreeningTest';

export default function ScreeningView({ user, currentClass, allClasses }) {
    if (user.app_role === 'teacher') {
        return <TeacherScreeningDashboard user={user} currentClass={currentClass} allClasses={allClasses} />;
    } else {
        return <StudentScreeningTest user={user} currentClass={currentClass} />;
    }
}