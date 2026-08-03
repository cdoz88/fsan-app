"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Scale, FileText } from 'lucide-react';
import DNOHeader from '../../../components/dno/DNOHeader';

export default function DNOTermsPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col font-sans selection:bg-[#1b75bb] selection:text-white relative">
      <DNOHeader onOpenAuthModal={() => {}} />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-8 pt-28 pb-24 z-10 relative">
        
        {/* Navigation */}
        <Link 
          href="/dno" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft size={16} className="text-[#1b75bb] group-hover:-translate-x-1 transition-transform" />
          <span>Back to Draft Lobby</span>
        </Link>

        {/* Title Banner */}
        <div className="bg-gradient-to-r from-[#1b75bb]/20 via-[#151515] to-[#c30b16]/20 border border-gray-800 rounded-3xl p-8 md:p-10 mb-10 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1b75bb]/20 border border-[#1b75bb]/30 flex items-center justify-center text-[#27d7ff] shrink-0">
              <Scale size={24} />
            </div>
            <div>
              <span className="text-[#f5a623] text-[10px] font-black uppercase tracking-widest block">Draft Night Out 2026</span>
              <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                Terms of Service & Rules
              </h1>
            </div>
          </div>
          <p className="text-xs md:text-sm text-gray-400 leading-relaxed max-w-2xl mt-2">
            Please review the official contest rules, eligibility requirements, and subscription terms governing Draft Night Out competitions.
          </p>
        </div>

        {/* Document Container */}
        <div className="bg-[#151515] border border-gray-800 rounded-3xl p-6 md:p-12 shadow-xl space-y-8 text-gray-300 text-sm leading-relaxed">
          
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold uppercase tracking-wider">
            Void where prohibited or restricted by law.
          </div>

          <p>
            Welcome to Draft Night Out ("DNO"), a fantasy football event and platform operated by Fantasy Sports Advice Network ("FSAN", "we", "us", or "our"). By registering for an account, purchasing a ticket, or participating in any DNO league or event, you ("Participant", "you") agree to abide by the Official League Rules and the decisions of the sponsor, which are final and binding.
          </p>

          <hr className="border-gray-800" />

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#1b75bb]" /> 1. Eligibility
            </h2>
            <p>To be eligible to participate in Draft Night Out, you must:</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-400">
              <li>Be a legal resident of the United States or Canada.</li>
              <li>Be 18 years of age or older at the time of entry. (Minors under the age of 18 may only participate with the explicit, verifiable consent of a parent or legal guardian).</li>
              <li>Not be a resident of a jurisdiction where paid fantasy sports contests are prohibited by law.</li>
              <li>Create and maintain a valid account on Sleeper (the "Host Platform").</li>
            </ul>
            <div className="bg-[#111] border border-gray-800 rounded-xl p-4 mt-3">
              <strong className="text-white block mb-1">1.1 Prize Eligibility and Age Verification:</strong>
              Participants under the age of twenty-one (21) are not eligible to receive physical or monetary prizes unless expressly permitted by the laws of their specific state or jurisdiction of residence. Prize eligibility based on age and local regulations will be strictly reviewed and determined solely by FSAN at the time winners are finalized and prior to any prize distribution. FSAN reserves the right to withhold, void, or offer alternative compensation for prizes if distributing them to a Participant under the age of 21 violates local or federal regulations.
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight">
              2. Entry Fees, Charity Donations, and Subscriptions
            </h2>
            <p><strong>2.1 Ticket Purchases:</strong> Participation in a DNO league requires a standard entry ticket. The standard entry fee is $22.00 USD.</p>
            <p><strong>2.2 Charity Donation:</strong> For every standard ticket purchased, FSAN pledges to donate exactly $4.00 USD to Mission 22 (Federal EIN: 46-2750726), a registered 501(c)(3) charity supporting Veterans.</p>
            <p><strong>2.3 FSAN Pro+ Subscription:</strong> First-time buyers purchasing a DNO ticket will receive a complimentary thirty (30) day free trial of the FSAN Pro+ premium membership.</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-400">
              <li>By completing the checkout process, Participant agrees to securely store a payment method with our payment processor (Stripe).</li>
              <li>At the conclusion of the thirty (30) day trial, the subscription will automatically renew at the standard rate of $7.99/month unless the Participant cancels their subscription prior to the renewal date.</li>
              <li>Cancellations can be managed at any time within the Participant's FSAN account settings.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight">
              3. League Format and Gameplay
            </h2>
            <p><strong>3.1 Host Platform:</strong> All DNO fantasy football leagues are hosted and executed on the Sleeper app.</p>
            <p><strong>3.2 Divisional Structure:</strong> Leagues consist of 12 teams. Drafts consist of 17 rounds. Scoring follows a standard Point-Per-Reception (PPR) format as defined by the league settings on the Host Platform.</p>
            <p><strong>3.3 Integrity of Play:</strong> Collusion, roster dumping, renting players, or any other anti-competitive behavior is strictly prohibited. FSAN reserves the right to instantly disqualify any Participant found violating the integrity of the game, without refund.</p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight">
              4. Prizes and Postseason Qualification
            </h2>
            <p>Participants compete for physical prizes based on their performance in their individual 12-team division and the global leaderboard, subject to the age and jurisdiction verifications outlined in Section 1.1.</p>
            <p><strong>4.1 League Champion (Divisional Winner):</strong> The team that wins their specific 12-team division’s championship matchup at the end of the fantasy season will receive a custom Draft Night Out Mini Title Belt.</p>
            <p><strong>4.2 Overall Season Champion:</strong> The single team that scores the most total points across the entire DNO platform during the regular season will be crowned the Overall Season Champion and will receive a full-sized, custom DNO Championship Belt.</p>
            <div className="bg-[#111] border border-gray-800 rounded-xl p-4 my-2">
              <strong className="text-white block mb-1">4.2.1 Leaderboard Eligibility:</strong>
              All standard Draft Night Out divisions are automatically entered into the global leaderboard competition for the Overall Season Champion prize. Specialty formats (e.g., Dynasty, Best Ball, and Superflex leagues) are explicitly excluded from the global leaderboard and are not eligible to win the Overall Season Champion prize.
            </div>
            <p><strong>4.3 Playoff Challenge Qualification:</strong> Every Participant who wins their 12-team division will automatically qualify for the DNO Playoff Challenge.</p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight">
              5. The Playoff Challenge Mechanics
            </h2>
            <p>The Playoff Challenge is an exclusive, postseason tournament to determine the Grand Prize winner.</p>
            <p><strong>5.1 Single Entry Limit:</strong> While Participants are encouraged to draft in multiple DNO divisions to increase their mathematical odds of winning a division, <strong>no Participant may have more than one (1) entry in the Playoff Challenge.</strong> If a Participant wins multiple 12-team divisions, they still only receive one entry into the Playoff Challenge.</p>
            <p><strong>5.2 Format Reveal:</strong> The specific format, platform, and scoring mechanics for the Playoff Challenge will be revealed to qualified Participants prior to the start of the actual NFL Playoffs.</p>
            <p><strong>5.3 The Grand Prize:</strong> The winner of the Playoff Challenge will receive the Grand Prize bundle, which includes a PlayStation 5 console, the latest edition of the Madden NFL video game, and a custom Championship Ring.</p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight">
              6. Disclaimers and Limitation of Liability
            </h2>
            <p><strong>6.1 Third-Party Affiliation:</strong> Draft Night Out and FSAN are independent entities. This contest is in no way sponsored, endorsed, or administered by the National Football League (NFL), Sleeper, Sony (PlayStation), Electronic Arts (Madden), or Mission 22.</p>
            <p><strong>6.2 Technology Failures:</strong> FSAN is not responsible for connectivity issues, API outages between FSAN and Sleeper, missed draft picks, or software glitches on the Host Platform that may affect a Participant’s performance.</p>
          </section>

          {/* Section 7 & 8 */}
          <section className="space-y-3">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight">
              7. Governing Law & Dispute Resolution
            </h2>
            <p>These Terms and any disputes arising out of or related to the DNO contest shall be governed by and construed in accordance with the laws of the State of Delaware, without giving effect to any choice or conflict of law provision or rule. Any legal suit, action, or proceeding arising out of these Terms shall be instituted exclusively in the federal or state courts located in Delaware.</p>

            <h2 className="text-xl font-black text-white uppercase italic tracking-tight pt-4">
              8. Right to Modify
            </h2>
            <p>FSAN reserves the right to cancel, suspend, or modify the contest, or any part of it, if any fraud, technical failures, or any other factor beyond FSAN's reasonable control impairs the integrity or proper functioning of the contest.</p>
          </section>

        </div>
      </main>
    </div>
  );
}