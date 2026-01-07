import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus } from "lucide-react";
import { Class } from "@/entities/Class";
import { User } from "@/entities/User";
import { useTranslation } from "../i18n/useTranslation";

export default function ClassSetup({ onClassReady, isFirstClass }) {
  const { t } = useTranslation();
  const [showCreateForm, setShowCreateForm] = useState(!isFirstClass);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateClassCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const user = await User.me();
      const classCode = generateClassCode();
      
      const newClass = await Class.create({
        name: formData.name,
        description: formData.description,
        class_code: classCode,
        teacher_id: user.id
      });

      setShowCreateForm(false);
      setFormData({ name: "", description: "" });
      onClassReady(newClass); // Callback to refresh dashboard state
    } catch (error) {
      console.error("Error creating class:", error);
      alert("Failed to create class. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-slate-900">
            {isFirstClass ? t('classSetup.welcomeTeacher') : t('classSetup.createNewClass')}
        </CardTitle>
        <p className="text-slate-600">
            {isFirstClass ? t('classSetup.setupFirstClassroom') : t('classSetup.createAnotherClass')}
        </p>
      </CardHeader>
      <CardContent>
        {!showCreateForm ? (
          <div className="text-center space-y-4 py-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-slate-600">{t('classSetup.createClassPrompt')}</p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('classSetup.createClass')}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreateClass} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                {t('classSetup.className')}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder={t('classSetup.classNamePlaceholder')}
                className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-slate-700">
                {t('classSetup.descriptionOptional')}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder={t('classSetup.descriptionPlaceholder')}
                className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl h-20"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 rounded-xl border-slate-300 hover:bg-slate-50"
              >
                {t('classSetup.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
              >
                {isSubmitting ? t('classSetup.creating') : t('classSetup.createClass')}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}