import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { FERPAConsent } from "@/entities/FERPAConsent";

export default function FERPAConsentForm({ student, onConsentUpdated }) {
  const [consents, setConsents] = useState({
    directory_info: false,
    third_party_tools: false,
    data_sharing: false
  });
  const [parentEmail, setParentEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConsentChange = (type, checked) => {
    setConsents(prev => ({ ...prev, [type]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      for (const [consentType, given] of Object.entries(consents)) {
        await FERPAConsent.create({
          student_id: student.id,
          parent_email: student.age < 18 ? parentEmail : null,
          consent_type: consentType,
          consent_given: given,
          consent_date: new Date().toISOString(),
          consent_expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
        });
      }
      
      onConsentUpdated && onConsentUpdated();
    } catch (error) {
      console.error('Error saving FERPA consent:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-600" />
          <CardTitle>FERPA Consent & Privacy Settings</CardTitle>
        </div>
        <p className="text-sm text-slate-600">
          The Family Educational Rights and Privacy Act (FERPA) protects student educational records. 
          Please review and provide consent for the following data uses:
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {student.age < 18 && (
            <div className="space-y-2">
              <Label htmlFor="parentEmail">Parent/Guardian Email *</Label>
              <Input
                id="parentEmail"
                type="email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="parent@email.com"
                required
              />
              <p className="text-xs text-slate-500">
                Consent must be provided by parent/guardian for students under 18
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="directory_info"
                checked={consents.directory_info}
                onCheckedChange={(checked) => handleConsentChange('directory_info', checked)}
              />
              <div className="space-y-1">
                <Label htmlFor="directory_info" className="text-sm font-medium">
                  Directory Information
                </Label>
                <p className="text-xs text-slate-600">
                  Allow sharing of basic directory information (name, class, grade level) with other students and teachers in your classes.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="third_party_tools"
                checked={consents.third_party_tools}
                onCheckedChange={(checked) => handleConsentChange('third_party_tools', checked)}
              />
              <div className="space-y-1">
                <Label htmlFor="third_party_tools" className="text-sm font-medium">
                  Educational Third-Party Tools
                </Label>
                <p className="text-xs text-slate-600">
                  Allow use of approved educational third-party tools and AI services that may process your educational data to enhance learning.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="data_sharing"
                checked={consents.data_sharing}
                onCheckedChange={(checked) => handleConsentChange('data_sharing', checked)}
              />
              <div className="space-y-1">
                <Label htmlFor="data_sharing" className="text-sm font-medium">
                  Anonymized Research & Analytics
                </Label>
                <p className="text-xs text-slate-600">
                  Allow use of anonymized educational data for research and platform improvement. No personally identifiable information is shared.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Your Rights Under FERPA:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Right to inspect and review educational records</li>
              <li>• Right to request amendment of inaccurate records</li>
              <li>• Right to consent to disclosures of personally identifiable information</li>
              <li>• Right to file complaints with the Department of Education</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || (student.age < 18 && !parentEmail)}
          >
            {isSubmitting ? 'Saving...' : 'Save Privacy Preferences'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}