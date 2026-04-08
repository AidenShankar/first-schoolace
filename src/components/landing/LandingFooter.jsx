import React from 'react';
import { GraduationCap, ShieldCheck, Linkedin } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

export default function LandingFooter() {
  const { t } = useTranslation();
  return (
    <footer className="relative pt-12 pb-8 bg-black/20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SchoolACE</span>
            </div>
            <p className="text-slate-400 text-sm">Education, Supercharged by ACE AI</p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">{t('landing.platformTitle')}</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-slate-400 hover:text-white transition-colors text-sm">{t('landing.forTeachers')}</a></li>
              <li><a href="#student-features" className="text-slate-400 hover:text-white transition-colors text-sm">{t('landing.forStudents')}</a></li>
              <li><a href="#co-pilot" className="text-slate-400 hover:text-white transition-colors text-sm">{t('landing.aiCapabilities')}</a></li>
              <li><a href="https://schoolace.ai/tutor" className="text-slate-400 hover:text-white transition-colors text-sm">Tutor</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">{t('landing.companyTitle')}</h4>
            <ul className="space-y-3">
              <li><a href="#testimonials" className="text-slate-400 hover:text-white transition-colors text-sm">{t('landing.testimonials')}</a></li>
              <li><a href="mailto:contact@schoolace.org" className="text-slate-400 hover:text-white transition-colors text-sm">{t('landing.contact')}</a></li>
              <li><a href="https://aitutor.schoolace.ai/tutor/awards" className="text-slate-400 hover:text-white transition-colors text-sm">Awards</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">{t('landing.legalTitle')}</h4>
            <ul className="space-y-3">
              <li>
                <a href="https://schoolace.ai/TermsOfService" className="text-slate-400 hover:text-white transition-colors text-sm">
                  {t('landing.termsOfService')}
                </a>
              </li>
              <li>
                <a href="https://schoolace.ai/PrivacyPolicy" className="text-slate-400 hover:text-white transition-colors text-sm">
                  {t('landing.privacyPolicy')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/60 border border-slate-700 rounded-full text-sm">
            <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300">{t('landing.allSystemsOperational')}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-medium text-sm">{t('landing.ferpaCompliant')}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-medium text-sm">{t('landing.coppaCompliant')}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-center">
          <p className="text-slate-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} {t('landing.copyright')}
          </p>
          <div className="flex justify-center items-center gap-6">
            <a href="https://www.linkedin.com/company/schoolace/about/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}