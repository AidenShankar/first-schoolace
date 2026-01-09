import React, { useState } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AceSpace } from '@/entities/AceSpace';
import { AceSpaceMember } from '@/entities/AceSpaceMember';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Users, LogIn, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { useTranslation } from "@/components/i18n/useTranslation";

export default function AceSpaces({ user }) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [createOpen, setCreateOpen] = useState(false);
    const [joinOpen, setJoinOpen] = useState(false);
    const [newSpaceName, setNewSpaceName] = useState("");
    const [newSpaceDesc, setNewSpaceDesc] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [processing, setProcessing] = useState(false);

    const { data: spacesData, isLoading: loading } = useQuery({
        queryKey: ['ace-spaces', user?.id],
        queryFn: async () => {
            if (!user) return { spaces: [], membersBySpace: {} };

            // 1. Get memberships
            const memberships = await AceSpaceMember.filter({ student_id: user.id });
            if (memberships.length === 0) {
                return { spaces: [], membersBySpace: {} };
            }

            // 2. Get spaces details
            const spaceIds = memberships.map(m => m.space_id);
            const spaces = await AceSpace.filter({ id: { $in: spaceIds } });

            // 3. Get ALL members for these spaces to display avatars
            const members = await AceSpaceMember.filter({ space_id: { $in: spaceIds } });

            // Group by space_id
            const membersBySpace = {};
            members.forEach(m => {
                if (!membersBySpace[m.space_id]) membersBySpace[m.space_id] = [];
                membersBySpace[m.space_id].push(m);
            });
            
            return { spaces, membersBySpace };
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes to prevent loading on tab switch
    });

    const spaces = spacesData?.spaces || [];
    const allMembers = spacesData?.membersBySpace || {};

    const handleCreateSpace = async () => {
        if (!newSpaceName.trim()) return;
        setProcessing(true);
        try {
            // Generate a simple 6-char code
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();

            const newSpace = await AceSpace.create({
                name: newSpaceName,
                description: newSpaceDesc,
                creator_id: user.id,
                join_code: code,
                is_active: true
            });

            // Add creator as member (admin)
            await AceSpaceMember.create({
                space_id: newSpace.id,
                student_id: user.id,
                student_name: user.full_name,
                role: 'admin',
                joined_at: new Date().toISOString()
            });

            setCreateOpen(false);
            setNewSpaceName("");
            setNewSpaceDesc("");
            queryClient.invalidateQueries({ queryKey: ['ace-spaces'] });
        } catch (error) {
            console.error("Error creating space:", error);
            alert("Failed to create space");
        } finally {
            setProcessing(false);
        }
    };

    const handleJoinSpace = async () => {
        if (!joinCode.trim()) return;
        setProcessing(true);
        try {
            const foundSpaces = await AceSpace.filter({ join_code: joinCode.trim().toUpperCase() });
            if (foundSpaces.length === 0) {
                alert("Invalid join code");
                setProcessing(false);
                return;
            }
            const space = foundSpaces[0];

            // Check if already member
            const existing = await AceSpaceMember.filter({ space_id: space.id, student_id: user.id });
            if (existing.length > 0) {
                alert("You are already a member of this space");
                setProcessing(false);
                return;
            }

            await AceSpaceMember.create({
                space_id: space.id,
                student_id: user.id,
                student_name: user.full_name,
                role: 'member',
                joined_at: new Date().toISOString()
            });

            setJoinOpen(false);
            setJoinCode("");
            queryClient.invalidateQueries({ queryKey: ['ace-spaces'] });
            
            // Navigate to it immediately?
            window.location.href = createPageUrl(`AceSpaceDetail?id=${space.id}`);

        } catch (error) {
            console.error("Error joining space:", error);
            alert("Failed to join space");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Users className="h-8 w-8 text-indigo-600" />
                        {t('aceSpaces.title')}
                    </h1>
                    <p className="text-slate-500 mt-1">{t('aceSpaces.subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <LogIn className="h-4 w-4" /> {t('aceSpaces.joinWithCode')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t('aceSpaces.joinSpace')}</DialogTitle>
                                <DialogDescription>{t('aceSpaces.joinDesc')}</DialogDescription>
                            </DialogHeader>
                            <Input 
                                placeholder={t('aceSpaces.enterCode')}
                                value={joinCode} 
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                className="text-center text-2xl tracking-widest uppercase font-mono my-4"
                                maxLength={6}
                            />
                            <DialogFooter>
                                <Button onClick={handleJoinSpace} disabled={processing || joinCode.length < 6}>
                                    {processing ? <Loader2 className="animate-spin h-4 w-4" /> : t('aceSpaces.joinSpace')}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                                <Plus className="h-4 w-4" /> {t('aceSpaces.createSpace')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t('aceSpaces.createNewSpace')}</DialogTitle>
                                <DialogDescription>{t('aceSpaces.createDesc')}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('aceSpaces.spaceName')}</label>
                                    <Input value={newSpaceName} onChange={(e) => setNewSpaceName(e.target.value)} placeholder={t('aceSpaces.spaceNamePlaceholder')} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('aceSpaces.descOptional')}</label>
                                    <Input value={newSpaceDesc} onChange={(e) => setNewSpaceDesc(e.target.value)} placeholder={t('aceSpaces.whatsThisFor')} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateSpace} disabled={processing || !newSpaceName}>
                                    {processing ? <Loader2 className="animate-spin h-4 w-4" /> : t('aceSpaces.createSpace')}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {spaces.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                    <div className="bg-white p-4 rounded-full inline-flex mb-4 shadow-sm">
                        <Users className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900">{t('aceSpaces.noSpaces')}</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-6">{t('aceSpaces.noSpacesDesc')}</p>
                    <Button onClick={() => setCreateOpen(true)}>{t('aceSpaces.createFirst')}</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {spaces.map((space) => (
                        <motion.div 
                            key={space.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group relative"
                        >
                            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-slate-200" onClick={() => window.location.href = createPageUrl(`AceSpaceDetail?id=${space.id}`)}>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl font-bold text-slate-900 truncate pr-4">{space.name}</CardTitle>
                                        <div className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-mono font-bold" title="Join Code">
                                            {space.join_code}
                                        </div>
                                    </div>
                                    <CardDescription className="line-clamp-2 min-h-[2.5em]">{space.description || "No description"}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-100">
                                        <div className="flex -space-x-2 overflow-hidden pl-2">
                                            {/* Show members (limit to 4) */}
                                            {(allMembers[space.id] || []).slice(0, 4).map((member) => (
                                                <div 
                                                    key={member.student_id} 
                                                    className={`inline-block h-8 w-8 rounded-full ring-2 ring-white flex items-center justify-center text-xs font-medium ${
                                                        member.student_id === user.id 
                                                        ? 'bg-indigo-100 text-indigo-600 z-10' 
                                                        : 'bg-slate-200 text-slate-600'
                                                    }`}
                                                    title={member.student_name}
                                                >
                                                    {member.student_name.substring(0, 2).toUpperCase()}
                                                </div>
                                            ))}
                                            {(allMembers[space.id]?.length || 0) > 4 && (
                                                <div className="inline-block h-8 w-8 rounded-full bg-slate-100 ring-2 ring-white flex items-center justify-center text-xs text-slate-500 font-medium">
                                                    +{allMembers[space.id].length - 4}
                                                </div>
                                            )}
                                            {/* AI Badge */}
                                            <div className="inline-block h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 ring-2 ring-white flex items-center justify-center text-xs text-white font-bold z-20" title="Ace AI">
                                                AI
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-0 h-auto font-medium">
                                            {t('aceSpaces.openChat')} <ArrowRight className="ml-1 h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}