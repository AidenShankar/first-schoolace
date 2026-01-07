import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Download, FileText, Edit, AlertCircle } from "lucide-react";

export default function DataAccessRights({ student }) {
  const [amendmentRequest, setAmendmentRequest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDataExport = async () => {
    try {
      // This would need to be implemented as a backend function
      // that exports all student data in a readable format
      alert('Data export feature will be implemented. You will receive an email with your educational records.');
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleAmendmentRequest = async () => {
    if (!amendmentRequest.trim()) return;
    
    setIsSubmitting(true);
    try {
      // This would create a request for school administrators to review
      alert('Amendment request submitted. School administrators will review and respond within 45 days.');
      setAmendmentRequest('');
    } catch (error) {
      console.error('Error submitting amendment request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Access Your Educational Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Under FERPA, you have the right to inspect and review your educational records maintained by the school.
          </p>
          <Button onClick={handleDataExport} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download My Educational Records
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Request Amendment of Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            If you believe any information in your educational record is inaccurate or misleading, you may request an amendment.
          </p>
          <Textarea
            value={amendmentRequest}
            onChange={(e) => setAmendmentRequest(e.target.value)}
            placeholder="Describe the record you believe is inaccurate and explain why..."
            className="mb-4"
          />
          <Button 
            onClick={handleAmendmentRequest} 
            disabled={!amendmentRequest.trim() || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Amendment Request'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            File a FERPA Complaint
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            If you believe your FERPA rights have been violated, you may file a complaint with:
          </p>
          <div className="bg-slate-50 p-4 rounded-lg text-sm">
            <p className="font-medium">Family Policy Compliance Office</p>
            <p>U.S. Department of Education</p>
            <p>400 Maryland Avenue, SW</p>
            <p>Washington, D.C. 20202-8520</p>
            <p className="mt-2">Phone: (202) 260-3887</p>
            <p>Website: www.ed.gov/ferpa</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}