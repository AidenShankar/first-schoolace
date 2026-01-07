import Dashboard from './pages/Dashboard';
import Setup from './pages/Setup';
import Chat from './pages/Chat';
import AITools from './pages/AITools';
import ClassTools from './pages/ClassTools';
import AIPersonalAgent from './pages/AIPersonalAgent';
import PowerSchool from './pages/PowerSchool';
import Landing from './pages/Landing';
import LessonPlans from './pages/LessonPlans';
import PersonalizedLearning from './pages/PersonalizedLearning';
import Compliance from './pages/Compliance';
import compliance from './pages/compliance';
import Gradebook from './pages/Gradebook';
import Scheduler from './pages/Scheduler';
import ChooseCourses from './pages/ChooseCourses';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Demo from './pages/Demo';
import examplelearningtracker from './pages/examplelearningtracker';
import AceSpaces from './pages/AceSpaces';
import AceSpaceDetail from './pages/AceSpaceDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Setup": Setup,
    "Chat": Chat,
    "AITools": AITools,
    "ClassTools": ClassTools,
    "AIPersonalAgent": AIPersonalAgent,
    "PowerSchool": PowerSchool,
    "Landing": Landing,
    "LessonPlans": LessonPlans,
    "PersonalizedLearning": PersonalizedLearning,
    "Compliance": Compliance,
    "compliance": compliance,
    "Gradebook": Gradebook,
    "Scheduler": Scheduler,
    "ChooseCourses": ChooseCourses,
    "PrivacyPolicy": PrivacyPolicy,
    "TermsOfService": TermsOfService,
    "Demo": Demo,
    "examplelearningtracker": examplelearningtracker,
    "AceSpaces": AceSpaces,
    "AceSpaceDetail": AceSpaceDetail,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};