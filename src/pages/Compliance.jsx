import React, { useState } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

export default function ComplianceTable() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLaw, setFilterLaw] = useState('all');

  const complianceItems = [
    // FERPA Items
    { id: 1, law: 'FERPA', category: 'Data Collection & Access', item: 'Purpose-limited data collection', status: 'complete', description: 'Only collect minimum data necessary for educational purposes', responsibility: 'SchoolAce', legalBasis: 'FERPA §99.3 - Legitimate Educational Interest' },
    { id: 2, law: 'FERPA', category: 'Data Collection & Access', item: 'Controlled access to student information', status: 'complete', description: 'Access restricted to authorized school personnel with legitimate educational interests', responsibility: 'SchoolAce / School', legalBasis: 'FERPA §99.31(a)(1)' },
    { id: 3, law: 'FERPA', category: 'Data Collection & Access', item: 'Data ownership remains with schools', status: 'complete', description: 'Schools retain full ownership; SchoolAce acts as data processor only', responsibility: 'School', legalBasis: 'FERPA §99.3' },
    
    { id: 6, law: 'FERPA', category: 'Consent & Notification', item: 'School-based consent model', status: 'complete', description: 'Operate under school authorization for COPPA and FERPA compliance', responsibility: 'School', legalBasis: 'FERPA - School official exception' },
    { id: 7, law: 'FERPA', category: 'Consent & Notification', item: 'Transparency through clear policies', status: 'complete', description: 'Privacy policies published and shared with partner schools', responsibility: 'SchoolAce', legalBasis: 'FERPA §99.7 - Annual Notification' },
    
    { id: 10, law: 'FERPA', category: 'Data Use & Sharing', item: 'Educational purpose only', status: 'complete', description: 'Data used strictly for educational services (grading, feedback, learning)', responsibility: 'SchoolAce', legalBasis: 'FERPA §99.31(a)(1)' },
    { id: 12, law: 'FERPA', category: 'Data Use & Sharing', item: 'Trusted school official designation', status: 'complete', description: 'Service provider performing institutional services under school control', responsibility: 'School', legalBasis: 'FERPA §99.31(a)(1)' },
    { id: 13, law: 'FERPA', category: 'Data Use & Sharing', item: 'Direct school control requirements', status: 'complete', description: 'Contract language specifies school maintains direct control over SchoolAce\'s use of data through authorization and termination rights', responsibility: 'School / SchoolAce', legalBasis: 'FERPA §99.31(a)(1)(i)(B)' },
    { id: 14, law: 'FERPA', category: 'Data Use & Sharing', item: 'Third-party service providers disclosure', status: 'complete', description: 'Base44 (cloud infrastructure) and Stripe via Base44 (payment processing - school billing only, no student data access)', responsibility: 'SchoolAce', legalBasis: 'FERPA §99.31(a)(1)' },
    { id: 15, law: 'FERPA', category: 'Data Use & Sharing', item: 'Subprocessor data protection agreements', status: 'complete', description: 'Base44 and Stripe have signed data processing agreements meeting compliance standards', responsibility: 'SchoolAce', legalBasis: 'FERPA §99.31(a)(1)' },
    { id: 17, law: 'FERPA', category: 'Data Use & Sharing', item: 'AI/Automated decision-making disclosure', status: 'complete', description: 'SchoolAce discloses use of AI for grading and learning recommendations to partner schools', responsibility: 'SchoolAce', legalBasis: 'FERPA - Transparency requirement' },
    
    { id: 20, law: 'FERPA', category: 'Security & Safeguards', item: 'Incident response and breach notification', status: 'complete', description: 'Immediate notification to schools in event of data incident', responsibility: 'SchoolAce', legalBasis: 'State breach laws / FERPA guidance' },
    { id: 21, law: 'FERPA', category: 'Security & Safeguards', item: 'US-based data storage', status: 'complete', description: 'All data stored and processed within the United States via Base44 infrastructure', responsibility: 'SchoolAce', legalBasis: 'FERPA - Security requirement' },
    
    { id: 22, law: 'FERPA', category: 'Data Retention & Deletion', item: 'Defined retention policy', status: 'complete', description: 'Data retained for contract duration, then securely deleted', responsibility: 'SchoolAce', legalBasis: 'FERPA §99.31(a)(3)' },
    { id: 23, law: 'FERPA', category: 'Data Retention & Deletion', item: 'Right to review and delete', status: 'complete', description: 'Schools/parents may request correction or deletion anytime', responsibility: 'School / SchoolAce', legalBasis: 'FERPA §99.20' },
    { id: 25, law: 'FERPA', category: 'Data Retention & Deletion', item: 'No cross-school data aggregation', status: 'complete', description: 'SchoolAce does not aggregate or use student data across schools; each school\'s data remains completely isolated', responsibility: 'SchoolAce', legalBasis: 'FERPA §99.31(b)' },
    { id: 26, law: 'FERPA', category: 'Data Retention & Deletion', item: 'Data portability rights', status: 'complete', description: 'Schools can export student data in structured, usable format upon request', responsibility: 'SchoolAce', legalBasis: 'FERPA §99.10 - Right to inspect' },
    
    { id: 32, law: 'FERPA', category: 'School Partnership & Parental Rights', item: 'School-mediated parent engagement', status: 'complete', description: 'Support school processes for parent access via secure admin controls', responsibility: 'School', legalBasis: 'FERPA §99.10' },
    { id: 34, law: 'FERPA', category: 'School Partnership & Parental Rights', item: 'School-mediated student/parent rights', status: 'complete', description: 'Schools handle all parent/student requests for FERPA rights (inspect, review, amend, consent, complaints) - SchoolAce supports schools administratively', responsibility: 'School', legalBasis: 'FERPA §99.5, §99.20' },

    // COPPA Items
    { id: 4, law: 'COPPA', category: 'Data Collection & Access', item: 'School authorization for COPPA compliance', status: 'complete', description: 'SchoolAce operates under school authorization exception - schools obtain parental consent, not SchoolAce directly', responsibility: 'School', legalBasis: 'COPPA §312.5(c)(3) - School Exception' },
    
    { id: 9, law: 'COPPA', category: 'Consent & Notification', item: 'School-mediated parental consent', status: 'complete', description: 'SchoolAce relies on school to obtain and manage parental consent; no direct parental interaction required', responsibility: 'School', legalBasis: 'COPPA §312.5(c)(3)' },
    
    { id: 11, law: 'COPPA', category: 'Data Use & Sharing', item: 'No commercial use or profiling', status: 'complete', description: 'No selling, renting, or using data for advertising/marketing', responsibility: 'SchoolAce', legalBasis: 'COPPA §312.4(c)' },
    { id: 16, law: 'COPPA', category: 'Data Use & Sharing', item: 'Prohibited uses explicit list', status: 'complete', description: 'SchoolAce does not sell student data, conduct behavioral advertising, or build profiles for non-educational purposes', responsibility: 'SchoolAce', legalBasis: 'COPPA §312.4' },
    
    { id: 18, law: 'COPPA', category: 'Security & Safeguards', item: 'Enterprise-grade encryption', status: 'complete', description: 'Data encrypted in transit (TLS 1.2+) and at rest (AES-256)', responsibility: 'SchoolAce', legalBasis: 'COPPA §312.8 - Reasonable procedures' },
    { id: 19, law: 'COPPA', category: 'Security & Safeguards', item: 'Authentication and access logging', status: 'complete', description: 'MFA, least-privilege access, and monitoring of administrative actions', responsibility: 'SchoolAce', legalBasis: 'COPPA §312.8 - Security safeguards' },
    
    { id: 24, law: 'COPPA', category: 'Data Retention & Deletion', item: 'Specific retention periods', status: 'complete', description: 'Data retained for minimum period necessary to provide educational services during active contract term', responsibility: 'SchoolAce', legalBasis: 'COPPA §312.10' },
    
    { id: 27, law: 'COPPA', category: 'Transparency & Accountability', item: 'Privacy-by-design architecture', status: 'complete', description: 'Privacy and security principles embedded from design stage', responsibility: 'SchoolAce', legalBasis: 'COPPA §312.8' },
    { id: 30, law: 'COPPA', category: 'Transparency & Accountability', item: 'Administrator data access controls', status: 'complete', description: 'SchoolAce administrator has necessary access with documented security practices', responsibility: 'SchoolAce', legalBasis: 'COPPA §312.8' },
    { id: 33, law: 'COPPA', category: 'School Partnership & Parental Rights', item: 'Advance notice of material changes', status: 'complete', description: 'Notify schools before changes to data collection or privacy practices', responsibility: 'SchoolAce', legalBasis: 'COPPA §312.4(c)' },

    // Best Practice Items (apply to both)
    { id: 28, law: 'Best Practice', category: 'Transparency & Accountability', item: 'Annual compliance review', status: 'complete', description: 'Periodic internal reviews for FERPA and COPPA adherence', responsibility: 'SchoolAce', legalBasis: 'Best practice' },
    { id: 31, law: 'Best Practice', category: 'Transparency & Accountability', item: 'Designated privacy officer', status: 'complete', description: 'SchoolAce administrator serves as Data Protection and Privacy Officer overseeing all compliance matters', responsibility: 'SchoolAce', legalBasis: 'Best practice' },
  ];

  const filteredItems = complianceItems.filter(item => {
    const statusMatch = filterStatus === 'all' || item.status === filterStatus;
    const lawMatch = filterLaw === 'all' || item.law === filterLaw;
    return statusMatch && lawMatch;
  });

  const getStatusIcon = (status) => {
    switch(status) {
      case 'complete':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'missing':
        return <X className="w-5 h-5 text-red-600" />;
      case 'needs_clarification':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const statusCounts = {
    complete: complianceItems.filter(i => i.status === 'complete').length,
    missing: complianceItems.filter(i => i.status === 'missing').length,
    needs_clarification: complianceItems.filter(i => i.status === 'needs_clarification').length
  };

  const lawCounts = {
    ferpa: complianceItems.filter(i => i.law === 'FERPA').length,
    coppa: complianceItems.filter(i => i.law === 'COPPA').length,
    both: complianceItems.filter(i => i.law === 'Best Practice').length
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">FERPA & COPPA Compliance Checklist</h1>
        <p className="text-gray-600 mb-6">Schoolace EdTech Platform</p>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-900">{complianceItems.length}</div>
            <div className="text-sm text-blue-700">Total Items</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-900">{lawCounts.ferpa}</div>
            <div className="text-sm text-purple-700">FERPA Items</div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <div className="text-2xl font-bold text-indigo-900">{lawCounts.coppa}</div>
            <div className="text-sm text-indigo-700">COPPA Items</div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
            <div className="text-2xl font-bold text-gray-900">{lawCounts.both}</div>
            <div className="text-sm text-gray-700">Best Practice</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-900">{statusCounts.complete}</div>
            <div className="text-sm text-green-700">Complete</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6">
          <div className="mb-3">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Filter by Law:</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterLaw('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterLaw === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterLaw('FERPA')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterLaw === 'FERPA' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                FERPA Only ({lawCounts.ferpa})
              </button>
              <button
                onClick={() => setFilterLaw('COPPA')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterLaw === 'COPPA' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                COPPA Only ({lawCounts.coppa})
              </button>
              <button
                onClick={() => setFilterLaw('Best Practice')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterLaw === 'Best Practice' 
                    ? 'bg-gray-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Best Practice ({lawCounts.both})
              </button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Filter by Status:</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Items
              </button>
              <button
                onClick={() => setFilterStatus('complete')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'complete' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Complete
              </button>
              <button
                onClick={() => setFilterStatus('missing')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'missing' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Missing
              </button>
              <button
                onClick={() => setFilterStatus('needs_clarification')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'needs_clarification' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Needs Clarification
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="text-left p-3 font-semibold text-gray-700 w-8">#</th>
                <th className="text-left p-3 font-semibold text-gray-700 w-12">Status</th>
                <th className="text-left p-3 font-semibold text-gray-700 w-24">Law</th>
                <th className="text-left p-3 font-semibold text-gray-700">Category</th>
                <th className="text-left p-3 font-semibold text-gray-700">Compliance Item</th>
                <th className="text-left p-3 font-semibold text-gray-700">Description & Implementation</th>
                <th className="text-left p-3 font-semibold text-gray-700">Responsibility</th>
                <th className="text-left p-3 font-semibold text-gray-700">Legal Basis</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`border-b border-gray-200 hover:bg-gray-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="p-3 text-gray-600 text-sm">{item.id}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center">
                      {getStatusIcon(item.status)}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.law === 'FERPA' ? 'bg-purple-100 text-purple-800' :
                      item.law === 'COPPA' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {item.law}
                    </span>
                  </td>
                  <td className="p-3 text-sm font-medium text-gray-900">{item.category}</td>
                  <td className="p-3 text-sm font-medium text-gray-900">{item.item}</td>
                  <td className="p-3 text-sm text-gray-700">{item.description}</td>
                  <td className="p-3 text-sm text-gray-700">{item.responsibility}</td>
                  <td className="p-3 text-sm text-gray-600 italic">{item.legalBasis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}