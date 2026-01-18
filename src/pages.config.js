import AIPersonalAgent from './pages/AIPersonalAgent';
import AITools from './pages/AITools';
import AceSpaceDetail from './pages/AceSpaceDetail';
import AceSpaces from './pages/AceSpaces';
import Chat from './pages/Chat';
import ChooseCourses from './pages/ChooseCourses';
import ClassTools from './pages/ClassTools';
import Compliance from './pages/Compliance';
import Dashboard from './pages/Dashboard';
import Demo from './pages/Demo';
import Gradebook from './pages/Gradebook';
import Landing from './pages/Landing';
import LessonPlans from './pages/LessonPlans';
import PersonalizedLearning from './pages/PersonalizedLearning';
import PowerSchool from './pages/PowerSchool';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Scheduler from './pages/Scheduler';
import Setup from './pages/Setup';
import TermsOfService from './pages/TermsOfService';
import compliance from './pages/compliance';
import examplelearningtracker from './pages/examplelearningtracker';
import LearnerDashboard from './pages/LearnerDashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIPersonalAgent": AIPersonalAgent,
    "AITools": AITools,
    "AceSpaceDetail": AceSpaceDetail,
    "AceSpaces": AceSpaces,
    "Chat": Chat,
    "ChooseCourses": ChooseCourses,
    "ClassTools": ClassTools,
    "Compliance": Compliance,
    "Dashboard": Dashboard,
    "Demo": Demo,
    "Gradebook": Gradebook,
    "Landing": Landing,
    "LessonPlans": LessonPlans,
    "PersonalizedLearning": PersonalizedLearning,
    "PowerSchool": PowerSchool,
    "PrivacyPolicy": PrivacyPolicy,
    "Scheduler": Scheduler,
    "Setup": Setup,
    "TermsOfService": TermsOfService,
    "compliance": compliance,
    "examplelearningtracker": examplelearningtracker,
    "LearnerDashboard": LearnerDashboard,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};