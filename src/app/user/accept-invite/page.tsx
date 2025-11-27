/* eslint-disable */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/authContext';

function AcceptInviteContent() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const acceptInvitation = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      if (!isAuthenticated || !user) {
        // Fetch invitation details first to pass to registration
        try {
          const inviteResponse = await fetch('/api/auth/get-invite-details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ invite_token: token })
          });
          
          const inviteData = await inviteResponse.json();
          
          if (inviteData.success) {
            const { email, role, company_id } = inviteData.invitation;
            router.push(`/user/auth/register?email=${email}&role=${role}&company_id=${company_id}&invite_token=${token}`);
          } else {
            router.push(`/user/auth/register?invite_token=${token}`);
          }
        } catch (err) {
          router.push(`/user/auth/register?invite_token=${token}`);
        }
        return;
      }

      try {
        const response = await fetch('/api/auth/accept-invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            invite_token: token,
            user_id: user.id,
          }),
        });

        const result = await response.json();

        if (result.success) {
          setMessage('Invitation accepted successfully! Redirecting...');
          setTimeout(() => {
            router.push('/user/profile');
          }, 2000);
        } else {
          setError(result.message || 'Failed to accept invitation');
        }
      } catch (err) {
        setError('An error occurred while accepting the invitation');
      } finally {
        setLoading(false);
      }
    };

    acceptInvitation();
  }, [searchParams, user, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        {error ? (
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/user/home')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Go to Home
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  );
}