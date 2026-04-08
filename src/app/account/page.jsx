"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { User, Mail, Lock, Loader2, CreditCard, ShieldCheck, CheckCircle2, ShoppingCart, Tag, AlertTriangle, ShieldAlert, Book, Download, Shirt, Settings, Gift, LogOut, ChevronRight } from 'lucide-react';

// Custom SVG Component for the Premium Community Icon (Supports Color and Monochrome)
const PremiumCommunityIcon = ({ className = "", size = 24, monochrome = false }) => {
  const mainColor = monochrome ? "currentColor" : "#9df01c";
  const contrastColor = monochrome ? "currentColor" : "#fff";
  
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 362.85 305.65" width={size} height={size} className={className}>
      <g>
        <path d="m321.31,285.9l-17.52-1.66c-2.92-.25-5.84-.61-8.76-.77l-8.77-.55-8.77-.55c-2.92-.19-5.85-.39-8.77-.46l-17.54-.63c-2.92-.13-5.85-.17-8.77-.2l-8.77-.11-8.77-.11c-2.92-.05-5.84.03-8.77.03l-17.53.15-17.52.46c-23.35.76-46.66,2.03-69.94,3.85-5.82.49-11.64.93-17.45,1.46-5.81.56-11.63,1.04-17.43,1.67l-8.71.9-8.71.97c-5.82.66-11.59,1.36-17.46,2.15l1.83,13.13c5.64-.75,11.41-1.46,17.15-2.11l8.62-.96,8.63-.89c5.75-.62,11.52-1.1,17.28-1.65,5.76-.52,11.53-.96,17.3-1.45,23.08-1.8,46.2-3.06,69.32-3.82l17.34-.46,17.34-.15c2.89,0,5.78-.08,8.67-.03l8.66.11,8.66.11c2.89.03,5.78.06,8.66.19l17.31.62c2.89.07,5.76.27,8.64.45l8.63.54,8.63.54c2.88.16,5.74.51,8.61.76l17.2,1.62,1.48-13.17Z" fill="none" strokeWidth="0"/>
        <path d="m99.19,298.5c-.15.06-.41.09-.72.12.07-.08.47-.17.72-.12Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m87.32,290.56c-.22.06-.91.2-.85.04.39-.05.56-.03.85-.04Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m86.1,290.47c-.05.08-.6.06-.85.11,0-.09.69-.14.85-.11Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m82.83,292.15c-.17.06-.63.15-.85.11.05-.08.6-.06.85-.11Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m81.14,290.86c-.28.11-.78.19-1.45.23.23-.12.93-.17,1.45-.23Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m77.63,298.32c-.74.08-2.23.36-2.77.27.91,0,1.93-.26,2.77-.27Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m75.33,295.45c-.9.28-2.58.24-3.74.49-.18-.14,1.73-.2,2.05-.36.28-.02.5,0,.72,0,.33-.05.62-.18.97-.13Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m63.97,296.18c.03.08-.04.14-.36.17-.09-.02-.13-.06-.12-.12l.48-.05Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m59.4,297.8c-.73.23-2.43.42-3.38.43-.12.04-.12.09-.36.11-.56.09-1.82.18-.6.04,1.49-.29,2.69-.32,4.34-.57Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m58.65,296.25c-.17.07-.47.12-.84.15.08-.09.7-.17.84-.15Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m58,300.59c-.13.09-.76.09-1.08.15.23-.07.81-.19,1.08-.15Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m57.82,296.9c-.29.12-.96.17-1.32.27-.34-.09.87-.21,1.32-.27Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m57.21,296.5c-.23.12-.93.18-1.45.26.3-.11.98-.18,1.45-.26Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m56.93,301.49c-.03.11-.5.16-.84.23.06-.11.55-.15.84-.23Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m56.31,300.78c-.38.14-1.73.27-2.4.34.84-.18,1.48-.25,2.4-.34Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m55.52,296.79c-.6.22-1.53.22-2.05.26.56-.15,1.41-.1,2.05-.26Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m54.1,298.48c-.23.08-.63.14-.96.21-.08-.13.56-.15.96-.21Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m53.01,298.28c-.28.11-.54.11-.96.14.09-.08.68-.09.96-.14Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m51.92,298.01c-.12.1-1.03.23-.85.03.26-.04.23.02.24.07.29-.02.26-.09.6-.1Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m49.68,300.78c.58-.2,1.62-.13,0,0h0Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m48.51,302.12c-.49.13-.97.17-1.56.22.36-.09,1.31-.22,1.56-.22Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m48.16,302.36c.19.08-.78.19-.6.07l.6-.07Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m47.25,304.2c-.16.09-.54.15-.83.17.08-.09.69-.18.83-.17Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m43.91,304.48c-.96.28-1.33.17,0,0h0Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m70.89,301.38c-.2.06-.47.11-.6.19-.39-.09-1.05.09-1.56.09.6-.21,1.28-.09,2.17-.27Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m57.14,300.1c-.29.05-.26-.03-.6.04-.04-.05.11-.07.12-.11-.6.05-.93.14-1.44.2.06-.03.12-.07.12-.11-.66.25-1.48.08-2.89.33,1.33-.34,4.35-.58,5.53-.75-.16.14-1.21.15-1.32.31-.02.1.67-.06.48.11Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m55.53,297.21c-.14.02-.07.04,0,.03-.03.08-.53.08-.6.07.14-.11,1.74-.25.6-.1Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m46.61,298.67v-.13c-.77.11-2,.29-2.54.24.9-.21,2.86-.23,3.49-.52.16.01.45-.02.6,0,2.1-.47,4.44-.52,6.63-.92-.95.46-3.25.26-4.34.75-.19,0,0-.03.12-.05-.98.12-2.74.26-3.97.63Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m47.93,302.65c-.18.08-.51.14-.71.22-.11,0-.46-.27.71-.22Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m289.44,296.4c.54.04,1.14-.05,1.7-.01,1.32.08,2.5.28,3.84.3,1.18,0,2.3-.03,3.53.04.91.06,1.21.04,1.82.05,1.78.05,3.23.25,4.03-.01,1.26-.1,2.84-.08,3.95-.18.17-.02.54.03.61.03,2.82-.25,4.61-.93,7.92-.99.31-.16.53-.42,1.11-.6.26-.08.83-.1,1.02-.19.71-.34.18-.9,1.46-1.09.08-.09-.14-.14-.2-.22.13-.8-.3-1.52.08-2.11-.82-.45-.58-.85-1.21-1.26-.39-.25-1.18-.53-1.69-.79-.58-.29-1.2-.54-1.69-.82.03-.24-.74-.36-.87-.58-.93-.24-1.63-.51-2.57-.75-.08-.09-.31-.16-.32-.26-1.98-.6-3.97-1.31-6.73-1.73-.25-.04-.78-.12-1.09-.14-2.06-.19-5.22-.57-6.27-.99-.37-.06-.37.02-.74-.04-.22-.19-1.29-.53-2.24-.59-.33-.02-.91.15-1.63.15-1.07-.01-2.06-.36-3.02-.37-.44,0-.92.15-1.39.16-1.21.04-3.63-.2-4.63-.33-.79-.1-1.08-.27-1.68-.28-.55,0-.97.14-.93.39-1.59.45-5.58-.23-7.99-.14-1.75-.33-3.45-.02-5.14-.13-.34-.02-.74-.1-1.09-.11-.58-.02-1.35.06-2.1.07-1.27.02-2.39-.03-3.43.01-1.6-.38-2.8-.05-4.15-.11-.51-.02-1-.15-1.57-.16-.48-.02-.95.06-1.47.03-.52-.03-1.07-.15-1.57-.16-.38-.01-.68.04-.98.02-.4-.02-.66-.11-1.09-.11-.45,0-.91.11-1.36.1-1.66-.02-3.45-.18-5.02.05-2.83-.24-5.3.06-8.65-.2-.84.05-1.45.09-2.32.02-.19.02-.19.1-.5.09-1.74-.12-3.58.13-5.37,0-.06.04-.14.07-.25.09-2.48-.2-5.62-.24-7.56-.02-1.51-.15-3.27.05-5.12.07-.87,0-1.74-.07-2.56-.03-1.6.08-3.7.02-5.25.07-.46.02-.9.11-1.35.13-.81.03-1.69-.05-2.56,0-3.35.18-7.19.18-10.12.25-.91.02-1.68.15-2.69.21-1.68.11-3.43-.02-5.11.07-.42.02-.83.1-1.22.12-1.01.06-1.98.02-3.04.06-2.61.08-5.22.32-7.68.29-3.12.35-7.69.47-11.33.66-.81.21-1.59.09-2.44.15-2.6.18-5.92.51-8.65.55-5.72.48-11.56.86-17.38,1.25-5.82.45-11.63.92-17.27,1.49-.89-.07-2.26.1-3.03.27-.17-.07-.69-.02-1.09-.02-1.4.33-3.19.3-4.98.5-.44.25-1.53.18-2.19.39-.3-.09.38-.13-.12-.15-1.13.48-5.05.62-6.8.87.12,0,.15.05,0,.07-.43-.06-.62.15-1.09.18-3.18.33-5.42.92-8.12,1.31-.35-.02-1.27-.1-1.57.07.49-.02,1.11-.09,1.09.07-.82.02-1.89.2-2.42.37-1.01.11-1.53.07-2.42.27-.22.02.23.14-.24.18-1.42.05-2.12.25-3.39.3-.35.19-1.83.38-2.3.35-.41.11.47.08.12.15-1.14.16-2.2.34-3.27.35-.25.1-.42.21-.85.28-.29.04.07-.15-.36-.06-.4.13.33.12.24.24-.57.11-.45.18-.72.3-.81,0-1.34.23-2.06.36-.74.13-1.58.16-2.3.29-.62.1-.87.24-1.57.32-.57.06-1.06,0-1.69.08-.33.06.24.09-.24.16-2.21.29-4.42.57-6.04.96,2.48-.53,4.34-.47,6.52-.95.35.11.98-.2,1.33-.04.14-.1-.38-.1.12-.14.16,0,.23.02.48-.02-.29.21.17.16.37.25,1.87-.23,3.34-.41,4.95-.61.3-.07-.22-.08.12-.14.61-.09,1.09-.12,1.81-.24.23.11.73.12.48.31-2.19.22-5.13.77-7.73,1.07-.79.1-1.62.06-2.05.31,1.16-.19,2.12-.08,3.14-.16,1.32-.11,2.7-.46,3.99-.55.36-.02.52.02.84-.02.26-.03.68-.17.97-.19.31-.03.34.04.6,0,.55-.07.96-.22,1.57-.28,1.02-.1,2.03-.08,3.14-.24.21.04.13.19-.12.24-1.32.14-1.55.17-2.9.31.15,0,.25.02.24.07-.42.03-.57,0-.85.11,1-.11.94.15.61.3-2.5.21-5.55.64-7.61.76-.22.09-.35.2-.72.26-2.3.34-4.89.55-7.36.9,2.84-.12,5.78-.59,9.05-1,.13.02.04.12.36.06,1.39-.24,3.02-.38,4.1-.52.5.09.98.18,1.45.28,3.43-.47,6-.17,9.29-.46,0,.1.25.1.36.16-.26.1-.42.23-.72.32-.54.06-1.09.16-1.57.14-2.75.54-6.7.77-10.13,1.28-.4.2-.06.29.24.4,1.67-.08,3.16-.46,4.94-.44.67.32.03.65-1.32.81-2.25.27-6.13.63-7.59.73-6.57.94-13.12,1.59-19.84,2.6,3.76-.37,7.19-1.02,10.57-1.24-.02-.07.1-.11.36-.14,3.31-.32,6.98-.77,9.87-1.18,1.24.11,3.56-.41,4.82-.3-.27.4-1.26.67-2.53.89,1.3-.16,2.52-.16,3.61-.25.9-.07,2.43-.34,2.89-.31.11,0-.09.1.12.09-.37.03.65-.09.72-.1.48-.09.39-.11.96-.16.74-.06.73-.06,1.2-.01,2.56-.18,5.04-.53,7.59-.69.27-.02.8-.07.84-.07.24,0,.04.08.36.07.18,0,.09-.08.36-.1,1-.06,2.14-.14,3.13-.24,2.49-.27,5.45-.41,7.48-.59.45-.01-.13.15.48.09,3.51-.21,7.22-.45,10.97-.73.28-.01.07.15.48.09.52-.02.38-.17.85-.19.29.02.56.05.72.12,4.31-.18,8.73-.63,13.16-1,4.13-.36,8.28-.6,12.2-.84,3.09-.2,6.05-.51,8.82-.57,1.85-.16,3.59-.29,5.29-.39,1.7-.08,3.38-.16,5.11-.24,2.51-.12,5.27-.16,7.38-.33.36-.03.79-.12,1.22-.14.64-.03,1.29.05,1.93.03,1.73-.07,3.49-.28,5.21-.35,1.93-.07,3.79-.08,5.68-.12,1.07-.02,2.09-.15,3.15-.19.7-.02,1.44.04,2.17.02,2.04-.06,4.12-.26,6.06-.28,2.59-.02,5.24.02,7.86-.16,2.9.06,6.42.04,9.19-.04,2.25.24,4.59-.05,7.13,0,.27,0,.45.05.72.06,1.92.08,3.96.02,5.9-.03,1.94-.02,3.79-.04,5.35.07,1.17-.15,2.17.04,3.26.1,1.17.06,2.26-.04,3.39-.03.37,0,.71.07,1.08.09,1.14.04,2.26-.05,3.52-.06,1.88,0,3.88.3,6.03.15,1.66.12,4.12.39,6.03.3,3.21.36,6.47.19,9.77.42,1.11.08,2.12.29,3.25.17,1.16.22,2.55.16,3.97.24,1.4.07,2.86.22,4.32.36,2.08.19,4.68.21,6.22.66.67.78,2.11-.21,3.76.04.87.2.74.4,1.1.69.78.16,1.52.14,2.29.13.89.13,1.51.5,2.7.58Zm-211.93-2.69s-.03-.06-.12-.05c.24-.18.84-.01.12.05Zm-.24.09c-1,.12-2.4.41-3.14.37-.2.02.19.17-.12.24-.44-.04-.95-.04-1.69.03-.08-.26,1.41-.25,1.45-.5.57-.04.85-.05,1.09-.2,1.17-.03,1.41-.22,2.3-.22-.22.18.17.1.12.28Z" fill={mainColor} fillRule="evenodd" strokeWidth="0"/>
        <path d="m148.83,143.24c-9.14-8.94-14.98-21.48-17.42-34.23-2.71-12.63-3.99-25.75-3.66-38.65-1.16-30.21,23.88-54.66,54.06-53.06,22.34-1.51,46.43,14.47,52.05,39.42,1.57,7.33,1.33,14.78,1.23,22.28-1.11,21.91-4.06,46.24-19.83,62.79,3.23-5.34,5.74-11.05,7.47-17.01,4.63-17.88,4.25-36.6,2.76-54.91-.23-2.78-.55-5.83-1.29-8.51-4.26-19.24-23.49-33.41-43.08-31.71-18.12-1.21-35.99,10.94-41.4,28.36-1.43,3.93-1.93,8.62-2.32,12.81-.63,6.25-.82,12.37-.86,18.6.04,18.58,1.52,37.98,12.3,53.83h0Z" fill={mainColor} strokeWidth="0"/>
        <path d="m100.25,272.48L2.2,43.53c-2.95-6.9-2.94-14.8.04-21.68,2.98-6.89,8.73-12.31,15.78-14.88l14.49-5.29c13.79-5.03,29.02,1.64,34.68,15.17l43.74,100.47c.82,1.89,1.25,3.93,1.25,5.99l-8.6,12.94L52.51,22.98c-2.37-5.67-8.76-8.47-14.54-6.36l-14.49,5.29c-3,1.09-5.36,3.31-6.62,6.25-1.27,2.93-1.27,6.16-.02,9.1l82.74,198.35c.79,1.9,1.19,3.95,1.15,6.01l-.48,30.86Z" fill={mainColor} strokeWidth="0"/>
        <path d="m262.6,272.48l98.05-228.95c2.95-6.9,2.94-14.8-.04-21.68-2.98-6.89-8.73-12.31-15.78-14.88l-14.49-5.29c-13.79-5.03-29.02,1.64-34.68,15.17l-43.74,100.47c-.82,1.89-1.25,3.93-1.25,5.99l8.6,12.94,51.07-113.26c2.37-5.67,8.76-8.47,14.54-6.36l14.49,5.29c3,1.09,5.36,3.31,6.62,6.25,1.27,2.93,1.27,6.16.02,9.1l-82.74,198.35c-.79,1.9-1.19,3.95-1.15,6.01l.48,30.86Z" fill={mainColor} strokeWidth="0"/>
        <path d="m155.38,190.44h-18.92v15.88c0,4.32,3.15,6.49,9.46,6.49,8.25,0,15.13,2.2,20.64,6.6,5.87,4.68,8.81,10.87,8.81,18.56v20.76c0,3.81-1.47,7.06-4.4,9.76-2.9,2.66-6.35,3.99-10.35,3.99h-29.39c-4.01,0-7.46-1.33-10.35-3.99-2.94-2.7-4.4-5.95-4.4-9.76v-20.29h19.99v15.41h18.92v-15.88c0-4.32-3.15-6.48-9.46-6.48-8.25,0-15.13-2.2-20.64-6.6-5.87-4.68-8.81-10.87-8.81-18.56v-20.76c0-3.81,1.47-7.06,4.4-9.76,2.89-2.66,6.35-3.99,10.35-3.99h29.39c4.01,0,7.46,1.33,10.35,3.99,2.93,2.7,4.4,5.95,4.4,9.76v20.23h-19.99v-15.35Z" fill={mainColor} strokeWidth="0"/>
        <path d="m226.39,190.44h-18.92v63.42h18.92v-15.41h19.99v20.29c0,3.81-1.47,7.06-4.4,9.76-2.9,2.66-6.35,3.99-10.35,3.99h-29.39c-4.01,0-7.46-1.33-10.35-3.99-2.94-2.7-4.4-5.95-4.4-9.76v-73.18c0-3.81,1.47-7.06,4.4-9.76,2.89-2.66,6.35-3.99,10.35-3.99h29.39c4.01,0,7.46,1.33,10.35,3.99,2.93,2.7,4.4,5.95,4.4,9.76v20.23h-19.99v-15.35Z" fill={contrastColor} strokeWidth="0"/>
      </g>
    </svg>
  );
};

function AccountDashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState('Profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [userTier, setUserTier] = useState('free');
  const [isAdmin, setIsAdmin] = useState(false); 
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [relayId, setRelayId] = useState('');
  
  const [rookieGuideUrl, setRookieGuideUrl] = useState(null);
  const [guideLoading, setGuideLoading] = useState(true); // NEW: Track loading state for guide fetch
  
  const [isCopied, setIsCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const activeSport = 'All';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/home');
    }
  }, [status, router]);

  useEffect(() => {
    if (searchParams?.get('checkout') === 'success') {
      setActiveTab('Subscription');
      window.history.replaceState(null, '', '/account');
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.token) {
      fetchUserData();
      fetchRookieGuideLink();
    }
  }, [status, session]);

  const fetchUserData = async () => {
    const query = `
      query GetViewer {
        viewer {
          id
          firstName
          lastName
          email
          roles {
            nodes {
              name
            }
          }
        }
      }
    `;

    try {
      const res = await fetch('https://admin.fsan.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.token}`,
        },
        body: JSON.stringify({ query }),
        cache: 'no-store' 
      });

      const json = await res.json();
      
      if (json?.data?.viewer) {
        const user = json.data.viewer;
        setRelayId(user.id);
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          password: '', 
        });

        const roles = user.roles?.nodes?.map(r => r.name.toLowerCase()) || [];
        
        if (roles.includes('administrator')) {
          setIsAdmin(true);
        }

        if (roles.some(r => r.includes('pro+') || r.includes('pro plus') || r.includes('pro_plus') || r.includes('pro +'))) {
          setUserTier('pro-plus');
        } else if (roles.some(r => r.includes('pro') || r.includes('pro member') || r.includes('fsan_pro'))) {
          setUserTier('pro');
        } else {
          setUserTier('free');
        }
      } else {
        setUserTier('free');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load account data.' });
      setUserTier('free');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRookieGuideLink = async () => {
    setGuideLoading(true); // START LOADING
    
    const query = `
      query GetRookieGuide {
        menu(id: "rookie-guide", idType: SLUG) {
          menuItems {
            nodes {
              url
            }
          }
        }
      }
    `;
    try {
      const res = await fetch('https://admin.fsan.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        cache: 'no-store'
      });
      const json = await res.json();
      
      // NEW: Look through all nodes just in case it's not the very first one
      if (json?.data?.menu?.menuItems?.nodes && json.data.menu.menuItems.nodes.length > 0) {
        const guideNode = json.data.menu.menuItems.nodes.find(n => n.url);
        if (guideNode) {
            setRookieGuideUrl(guideNode.url);
        }
      }
    } catch (error) {
      console.error("Failed to fetch Rookie Guide link.");
    } finally {
      setGuideLoading(false); // END LOADING
    }
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    let mutationVars = `id: "${relayId}", firstName: "${formData.firstName}", lastName: "${formData.lastName}", email: "${formData.email}"`;
    if (formData.password) {
      mutationVars += `, password: "${formData.password}"`;
    }

    const query = `
      mutation UpdateAccount {
        updateUser(input: { ${mutationVars} }) {
          user {
            id
            firstName
            lastName
            email
          }
        }
      }
    `;

    try {
      const res = await fetch('https://admin.fsan.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.token}`,
        },
        body: JSON.stringify({ query }),
        cache: 'no-store'
      });

      const json = await res.json();

      if (json.errors) {
        setMessage({ type: 'error', text: json.errors[0].message });
      } else {
        setMessage({ type: 'success', text: 'Account updated successfully!' });
        setFormData({ ...formData, password: '' }); 
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setIsDeleting(true);
    setMessage({ type: '', text: '' });

    const query = `
      mutation DeleteSelf {
        deleteSelf(input: { confirm: true }) {
          deleted
        }
      }
    `;

    try {
      const res = await fetch('https://admin.fsan.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.token}`,
        },
        body: JSON.stringify({ query }),
      });

      const json = await res.json();

      if (json.errors) {
        setMessage({ type: 'error', text: json.errors[0].message });
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      } else {
        signOut({ callbackUrl: '/home' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred while deleting.' });
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleManageBilling = async () => {
    setIsPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to open billing portal.');
        setIsPortalLoading(false);
      }
    } catch (error) {
      console.error('Portal Error:', error);
      alert('An unexpected error occurred.');
      setIsPortalLoading(false);
    }
  };

  const copyDiscountCode = () => {
    navigator.clipboard.writeText('FSAN20X');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (status === 'loading' || isLoading) {
    return (
      <>
        <Header activeSport={activeSport} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="animate-spin text-red-600" size={48} />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Loading Account...</p>
        </div>
      </>
    );
  }

  if (!session) return null;

  const tabs = [
    { id: 'Profile', icon: <User size={18} /> },
    { id: 'Subscription', icon: <CreditCard size={18} /> },
    { id: 'My Perks', icon: <Gift size={18} /> },
  ];

  if (isAdmin) {
    tabs.push({ id: 'Admin Tools', icon: <ShieldAlert size={18} /> });
  }

  const renderTabContent = () => {
    return (
      <div className="bg-[#111] rounded-3xl border border-gray-800 p-6 md:p-10 shadow-2xl relative overflow-hidden min-h-[400px]">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        {activeTab === 'Profile' && (
          <div className="space-y-8 animate-in fade-in duration-500 relative z-10">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-6 flex items-center gap-2">
              <ShieldCheck className="text-gray-400" /> Security & Profile
            </h2>

            {message.text && (
              <div className={`mb-6 p-4 border rounded-xl text-sm font-bold flex items-center gap-3 ${message.type === 'error' ? 'bg-red-900/30 border-red-900 text-red-400' : 'bg-green-900/30 border-green-900 text-green-400'}`}>
                {message.type === 'success' && <CheckCircle2 size={18} />}
                {message.text}
              </div>
            )}
            
            <div className="w-full space-y-6">
              <form onSubmit={handleUpdateAccount} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="relative">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 pl-1">First Name</label>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input 
                        type="text" 
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-gray-400 transition-colors text-sm text-white"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 pl-1">Last Name</label>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input 
                        type="text" 
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-gray-400 transition-colors text-sm text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 pl-1">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-gray-400 transition-colors text-sm text-white"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 pl-1">Change Password <span className="text-gray-600 lowercase tracking-normal font-normal">(Leave blank to keep current)</span></label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="password" 
                      placeholder="Enter a new password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-gray-400 transition-colors text-sm text-white placeholder-gray-600"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-6 border-t border-gray-800 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="w-full md:w-auto px-8 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 border border-gray-600 text-white font-black uppercase tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg disabled:opacity-50"
                  >
                    {isSaving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-800">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white mb-2">
                <AlertTriangle className="text-gray-500" size={20} /> Delete Account
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                Once you delete your account, your profile and subscription history will be permanently erased. This action cannot be undone.
              </p>

              {!showDeleteConfirm ? (
                <button 
                  type="button"
                  onClick={(e) => { e.preventDefault(); setShowDeleteConfirm(true); }}
                  className="px-6 py-3 bg-[#111] border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white text-sm font-bold uppercase tracking-widest rounded-xl transition-colors shadow-inner"
                >
                  Delete My Account
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#1a1a1a] p-4 rounded-xl border border-gray-700 shadow-inner">
                  <span className="text-sm font-bold text-gray-300 flex-1 text-center sm:text-left">Are you absolutely sure?</span>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                      type="button"
                      onClick={(e) => { e.preventDefault(); setShowDeleteConfirm(false); }}
                      disabled={isDeleting}
                      className="flex-1 sm:flex-none px-6 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border border-red-500 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isDeleting ? <Loader2 size={14} className="animate-spin" /> : 'Yes, Delete Everything'}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === 'Subscription' && (
          <div className="space-y-8 animate-in fade-in duration-500 relative z-10">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-6">Manage Subscription</h2>
            
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
               <div className="flex items-center gap-5">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${userTier === 'pro-plus' ? 'bg-gradient-to-br from-red-600/20 to-orange-500/20 border border-red-500/30 text-red-500' : userTier === 'pro' ? 'bg-blue-900/20 border border-blue-500/30 text-blue-500' : 'bg-gray-800 border border-gray-700 text-gray-500'}`}>
                       {userTier === 'pro-plus' ? <Zap size={28} /> : userTier === 'pro' ? <ShieldCheck size={28} /> : <Star size={28} />}
                   </div>
                   <div>
                       <h3 className="text-xl font-black text-white uppercase tracking-wider mb-1">
                           {userTier === 'pro-plus' ? 'PRO+ Member' : userTier === 'pro' ? 'PRO Member' : 'Free Account'}
                       </h3>
                       <p className="text-sm text-gray-400 font-medium">
                           {userTier === 'free' ? 'Upgrade to unlock premium tools and exclusive content.' : 'Your subscription is active.'}
                       </p>
                   </div>
               </div>

               {userTier === 'free' ? (
                   <Link href="/subscribe" className="w-full md:w-auto bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase tracking-widest text-xs px-6 py-3.5 rounded-xl transition-all shadow-lg hover:-translate-y-0.5 text-center">
                       Upgrade Now
                   </Link>
               ) : (
                   <button 
                      onClick={handleManageBilling}
                      disabled={isPortalLoading}
                      className="w-full md:w-auto bg-[#1a1a1a] hover:bg-gray-800 border border-gray-700 text-white font-bold uppercase tracking-widest text-xs px-6 py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                   >
                      {isPortalLoading ? <Loader2 size={16} className="animate-spin text-gray-400" /> : <Settings size={16} />}
                      Billing Portal
                   </button>
               )}
            </div>

            {userTier !== 'free' && (
                <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800 flex items-start gap-4">
                    <Mail className="text-gray-500 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Need help with your subscription?</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            You can easily update your payment method, download invoices, or cancel your subscription at any time through the secure Stripe Billing Portal above.
                        </p>
                    </div>
                </div>
            )}
          </div>
        )}

        {activeTab === 'My Perks' && (
          <div className="space-y-6 animate-in fade-in duration-500 relative z-10">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-6">Your Exclusive Perks</h2>
            
            {userTier === 'free' ? (
               <div className="bg-[#1a1a1a] rounded-2xl border border-dashed border-gray-700 p-10 text-center flex flex-col items-center">
                   <Gift size={48} className="text-gray-600 mb-4" />
                   <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">Upgrade to Unlock Perks</h3>
                   <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">Pro and Pro+ members get exclusive access to our Football Rookie Draft Guide, Jersey Leagues, and the Sellout Crowds community.</p>
                   <Link href="/subscribe" className="bg-gradient-to-r from-red-600 to-red-800 text-white font-black uppercase tracking-widest text-xs px-8 py-3 rounded-xl hover:-translate-y-0.5 transition-all shadow-lg">
                       View Premium Plans
                   </Link>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Football Rookie Draft Guide Card - PRO+ ONLY (Red Highlighted) */}
                  {userTier === 'pro-plus' ? (
                      <div className="bg-gradient-to-br from-[#301012] to-[#111] border border-red-900/50 rounded-2xl p-6 relative overflow-hidden group hover:border-red-700 transition-all shadow-lg flex flex-col">
                          <div className="absolute -right-4 -top-4 text-red-500/20 z-0 pointer-events-none group-hover:scale-110 transition-transform duration-500"><Book size={120} /></div>
                          <div className="relative z-10 flex flex-col h-full">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-red-900/20 text-red-500 border border-red-500/30 rounded-xl flex items-center justify-center shadow-inner shrink-0"><Book size={20} /></div>
                                <h3 className="text-lg font-black text-white uppercase tracking-wide leading-tight">Football Rookie Draft Guide</h3>
                              </div>
                              <p className="text-xs text-gray-300 leading-relaxed mb-6 flex-1 pr-4">Download the official FSAN Rookie Guide to dominate your dynasty rookie drafts with exclusive player grades and tape breakdowns.</p>
                              
                              {/* FIX 1: Explicit Loading State */}
                              {guideLoading ? (
                                  <button disabled className="w-full bg-gray-800 text-gray-500 font-black uppercase tracking-widest text-[10px] py-3.5 rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                                      <Loader2 size={16} className="animate-spin" /> Syncing File...
                                  </button>
                              ) : rookieGuideUrl ? (
                                  <a href={rookieGuideUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-gradient-to-r from-[#1b75bb] via-[#c30b16] to-[#f5a623] hover:opacity-90 text-white font-black uppercase tracking-widest text-[10px] py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                                      <Download size={16} /> Download PDF
                                  </a>
                              ) : (
                                  <button disabled className="w-full bg-gray-800 text-gray-500 font-black uppercase tracking-widest text-[10px] py-3.5 rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                                      Not Available
                                  </button>
                              )}
                          </div>
                      </div>
                  ) : (
                      <div className="bg-gradient-to-br from-[#301012] to-[#111] border border-red-900/50 rounded-2xl p-6 relative overflow-hidden flex flex-col">
                          <div className="absolute -right-4 -top-4 text-red-500/20 z-0 pointer-events-none"><Book size={120} /></div>
                          <div className="relative z-10 flex flex-col h-full">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-red-900/20 text-red-500 border border-red-500/30 rounded-xl flex items-center justify-center shadow-inner shrink-0"><Book size={20} /></div>
                                <h3 className="text-lg font-black text-white uppercase tracking-wide leading-tight">Football Rookie Draft Guide</h3>
                              </div>
                              <p className="text-xs text-gray-300 leading-relaxed mb-6 flex-1 pr-4">The ultimate 150-page breakdown of this year's draft class. Exclusive for Pro+ members.</p>
                              
                              <button onClick={() => router.push('/subscribe')} className="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 font-bold uppercase tracking-widest py-3 px-6 rounded-xl text-xs relative z-10 shadow-inner transition-colors">Locked: Pro+ Only</button>
                          </div>
                      </div>
                  )}

                  {/* Merch Shop Discount - PRO & PRO+ */}
                  <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl shadow-xl p-6 relative overflow-hidden group transition-all flex flex-col h-full">
                   <div className={`absolute -right-4 -top-4 transition-transform duration-500 pointer-events-none ${(userTier === 'pro-plus' || userTier === 'pro') ? 'text-gray-700/30 group-hover:scale-110' : 'text-gray-800/20'}`}><ShoppingCart size={120} /></div>
                   
                   <div className="relative z-10 flex flex-col h-full">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gray-800 text-gray-400 border border-gray-700 rounded-xl flex items-center justify-center shadow-inner shrink-0"><ShoppingCart size={20} /></div>
                        <h3 className={`text-lg font-black uppercase tracking-wide leading-tight ${(userTier === 'pro-plus' || userTier === 'pro') ? 'text-white' : 'text-gray-300'}`}>Merch Shop Discount</h3>
                     </div>
                     <p className={`text-xs leading-relaxed mb-6 flex-1 pr-4 ${(userTier === 'pro-plus' || userTier === 'pro') ? 'text-gray-400' : 'text-gray-500'}`}>Get 20% off all apparel in the FSAN shop. Exclusive for Premium members.</p>
                     
                     {(userTier === 'pro-plus' || userTier === 'pro') ? (
                       <button 
                          onClick={copyDiscountCode}
                          className="w-full bg-[#1a1a1a] hover:bg-gray-800 border border-gray-700 text-gray-300 hover:text-white font-mono py-3 px-6 rounded-xl text-lg font-bold tracking-widest relative z-10 shadow-sm transition-colors flex items-center justify-between"
                       >
                         FSAN20X 
                         {isCopied ? <CheckCircle2 size={18} className="text-green-500"/> : <Tag size={18} className="text-gray-500"/>}
                       </button>
                     ) : (
                       <button onClick={() => router.push('/subscribe')} className="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 font-bold uppercase tracking-widest py-3 px-6 rounded-xl text-xs relative z-10 shadow-inner transition-colors">Locked: Premium Only</button>
                     )}
                   </div>
                 </div>

                  {/* Jersey Leagues Card - PRO+ ONLY */}
                  {userTier === 'pro-plus' && (
                      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-gray-600 transition-all shadow-lg flex flex-col">
                          <div className="absolute -right-4 -top-4 text-gray-800/20 z-0 pointer-events-none group-hover:scale-110 transition-transform duration-500"><Shirt size={120} /></div>
                          <div className="relative z-10 flex flex-col h-full">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gray-800 text-gray-400 border border-gray-700 rounded-xl flex items-center justify-center shadow-inner shrink-0"><Shirt size={20} /></div>
                                <h3 className="text-lg font-black text-white uppercase tracking-wide leading-tight">Jersey Leagues</h3>
                              </div>
                              <p className="text-xs text-gray-400 leading-relaxed mb-6 flex-1 pr-4">Compete in an exclusive redraft tournament to win an autographed jersey from your favorite NFL player and a championship ring.</p>
                              
                              <Link href="/football/jersey-leagues" className="w-full bg-[#1a1a1a] hover:bg-gray-800 border border-gray-700 text-white font-black uppercase tracking-widest text-[10px] py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                                  Submit Your Entry <ChevronRight size={14} />
                              </Link>
                          </div>
                      </div>
                  )}

                  {/* Community Card - PRO & PRO+ */}
                  <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-gray-600 transition-all shadow-lg flex flex-col">
                      <div className="absolute -right-4 -top-4 text-gray-700/30 z-0 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                          <PremiumCommunityIcon size={120} monochrome={true} />
                      </div>
                      
                      <div className="relative z-10 flex flex-col h-full">
                          <div className="flex items-center gap-3 mb-4">
                             <div className="w-12 h-12 bg-gray-800 text-white border border-gray-700 rounded-xl flex items-center justify-center shadow-inner shrink-0">
                                 <PremiumCommunityIcon size={24} monochrome={false} />
                             </div>
                             <h3 className="text-lg font-black text-white uppercase tracking-wide leading-tight">Exclusive Community</h3>
                          </div>

                          <p className="text-xs text-gray-400 leading-relaxed mb-6 flex-1 pr-4">Get direct access to our analysts and chat with other premium members in our exclusive Sellout Crowds community boards.</p>
                          
                          <a href="https://selloutcrowds.com/" target="_blank" rel="noopener noreferrer" className="w-full bg-[#1a1a1a] hover:bg-gray-800 border border-gray-700 text-white font-black uppercase tracking-widest text-[10px] py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                              Join the Conversation <ChevronRight size={14} />
                          </a>
                      </div>
                  </div>

               </div>
            )}
          </div>
        )}

        {activeTab === 'Admin Tools' && isAdmin && (
          <div className="space-y-6 animate-in fade-in duration-500 relative z-10">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-6">Admin Tools</h2>
            
            <div className="bg-gradient-to-br from-red-900/20 to-[#111] border border-red-900/50 rounded-2xl shadow-2xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-red-500 group-hover:scale-110 transition-transform pointer-events-none">
                <ShieldAlert size={120} />
              </div>
              <h3 className="text-xl font-black text-red-500 uppercase tracking-wider mb-2 relative z-10">Ad Manager</h3>
              <p className="text-sm text-gray-300 mb-8 max-w-lg relative z-10">Manage global advertisements and promotional banners across the entire network.</p>
              <Link href="/admin/ads" className="inline-block bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest py-3 px-8 rounded-xl transition-all text-sm shadow-lg relative z-10 text-center w-full md:w-auto">
                Launch Ad Manager
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Header activeSport={activeSport} />
      
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-24">
        <Sidebar activeSport={activeSport} />
        
        <div className="flex-1 w-full min-w-0 pt-6">
          <div className="flex flex-col md:flex-row gap-8">
             
             {/* LEFT NAV BAR */}
             <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setMessage({type:'', text:''}); }}
                    className={`flex items-center justify-between px-5 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-gray-600 to-gray-800 text-white shadow-lg' 
                        : 'bg-[#111] border border-gray-800 text-gray-500 hover:text-white hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       {tab.icon} {tab.id}
                    </div>
                    {activeTab === tab.id && <ChevronRight size={16} />}
                  </button>
                ))}

                <button 
                  onClick={() => signOut({ callbackUrl: '/home' })}
                  className="flex items-center gap-3 px-5 py-4 rounded-xl font-bold uppercase tracking-widest text-xs text-gray-500 hover:text-red-500 bg-[#111] border border-gray-800 hover:border-red-900/50 hover:bg-red-900/10 transition-all mt-4"
                >
                  <LogOut size={18} /> Sign Out
                </button>
             </div>

             {/* MAIN CONTENT AREA */}
             <div className="flex-1 w-full">
                {renderTabContent()}
             </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AccountDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#121212] flex items-center justify-center"><Loader2 size={48} className="animate-spin text-gray-600" /></div>}>
      <AccountDashboardContent />
    </Suspense>
  );
}