import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mail, Phone } from "lucide-react";

export default function Apply() {
    const [showPhone, setShowPhone] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
                <h1 className="text-3xl font-bold text-slate-900">Apply to Schoolace</h1>
                
                <div className="space-y-2">
                    <p className="text-slate-600">To apply, please email us at:</p>
                    <a href="mailto:aiden.vc2015@gmail.com" className="flex items-center justify-center gap-2 text-indigo-600 font-medium hover:underline text-lg">
                        <Mail className="w-5 h-5" />
                        aiden.vc2015@gmail.com
                    </a>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    {!showPhone ? (
                        <Button 
                            onClick={() => setShowPhone(true)}
                            variant="outline"
                            className="w-full"
                        >
                            Applying as ABG
                        </Button>
                    ) : (
                        <div className="animate-in fade-in zoom-in duration-300">
                            <p className="text-sm text-slate-500 mb-1">Contact Number</p>
                            <a href="tel:669-331-6055" className="flex items-center justify-center gap-2 text-2xl font-bold text-slate-900 hover:text-indigo-600">
                                <Phone className="w-6 h-6" />
                                669-331-6055
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}