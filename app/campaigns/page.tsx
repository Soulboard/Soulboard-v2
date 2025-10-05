// app/campaigns/page.tsx
import { CreateCampaignForm } from "@/components/create-campaign";
import { UserCampaigns } from "@/components/user-campaigns";
import { ArrowLeft, Plus, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

export default function CampaignsPage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background with grid and radial gradient - matching hero */}
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle_400px_at_50%_300px,#fbfbfb36,#000)] mx-auto"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>



        {/* Create New Campaign Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">Create New Campaign</h2>
          </div>
          <CreateCampaignForm />
        </div>

        
      </div>
    </div>
  );
}