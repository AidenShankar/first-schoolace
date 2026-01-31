/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIPersonalAgent from './pages/AIPersonalAgent';
import AITools from './pages/AITools';
import APExamSchedule from './pages/APExamSchedule';
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
import LearnerDashboard from './pages/LearnerDashboard';
import LessonPlans from './pages/LessonPlans';
import PersonalizedLearning from './pages/PersonalizedLearning';
import PowerSchool from './pages/PowerSchool';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Scheduler from './pages/Scheduler';
import Setup from './pages/Setup';
import TermsOfService from './pages/TermsOfService';
import compliance from './pages/compliance';
import examplelearningtracker from './pages/examplelearningtracker';
import StudySet from './pages/StudySet';
import Learn from './pages/Learn';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIPersonalAgent": AIPersonalAgent,
    "AITools": AITools,
    "APExamSchedule": APExamSchedule,
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
    "LearnerDashboard": LearnerDashboard,
    "LessonPlans": LessonPlans,
    "PersonalizedLearning": PersonalizedLearning,
    "PowerSchool": PowerSchool,
    "PrivacyPolicy": PrivacyPolicy,
    "Scheduler": Scheduler,
    "Setup": Setup,
    "TermsOfService": TermsOfService,
    "compliance": compliance,
    "examplelearningtracker": examplelearningtracker,
    "StudySet": StudySet,
    "Learn": Learn,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};