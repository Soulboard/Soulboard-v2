import { CreateCampaignForm } from "@/components/create-campaign";
import { UserCampaigns } from "@/components/user-campaigns";
import { ArrowLeft, Plus, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

export default function CampaignsPage() {
  return (
    <div className="min-h-screen bg-white text-black relative overflow-hidden">
      {/* Purple Gradient Blobs - matching hero theme */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300/40 rounded-full blur-3xl"></div>
      <div className="absolute top-20 right-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-purple-300/25 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        
        {/* Hero Header */}
        <div className="mb-10 text-center max-w-4xl mx-auto -mt-8">
          <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
            Campaigns that 
            <br />
            <span className="relative inline-block">
              are legendary
              <div className="absolute -bottom-2 left-0 right-0 h-3 bg-purple-200/50 -rotate-1"></div>
            </span>
          </h1>
        </div>

        {/* Create New Campaign Section */}
        <div className="mt-4">
          <CreateCampaignForm />
        </div>
      </div>
    </div>
  );
}
