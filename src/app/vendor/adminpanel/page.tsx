/* eslint-disable */

"use client";

import { useEffect, useState } from "react";
import { Sun, Users, BarChart, Shield, ShieldCheck, ShieldAlert, ArrowRight } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// Define the type for admin counts without requestrentadmin
type AdminCounts = {
  superadmin: number;
  rentaladmin: number;
  eventadmin: number;
  ecomadmin: number;
};

export default function AdminDashboardPage() {
  const [userCount, setUserCount] = useState(0);
  const [complaintsCount, setComplaintsCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState({
    complaints: { pending: 0, in_progress: 0, resolved: 0, closed: 0 }
  });

  const [serviceData, setServiceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Update admin counts state with the new type
  const [adminCounts, setAdminCounts] = useState<AdminCounts>({
    superadmin: 0,
    rentaladmin: 0,
    eventadmin: 0,
    ecomadmin: 0,
  });
  // Update the state to handle complaints data
  const [complaintsData, setComplaintsData] = useState<Array<{
    date: string;
    complaints: number;
  }>>([]);
  // Update top complaint users state
  const [topComplaintUsers, setTopComplaintUsers] = useState<Array<{
    user_id: string;
    user_email: string;
    user_name: string;
    role: string;
    complaints_count: number;
  }>>([]);

  // Calculate total complaints
  const totalComplaints = complaintsCount;

  // Function to get formatted date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Function to get the last 7 days
  const getLast7Days = (): Date[] => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      dates.push(date);
    }
    return dates;
  };

  const fetchCounts = async () => {
    try {
      setLoading(true);
      
      // Fetch user count
      const { count: userTotal, error: userError } = await supabase
        .from("users")
        .select("id", { count: "exact" });
      
      if (userError) {
        console.error("Error fetching user count:", userError);
      } else {
        setUserCount(userTotal || 0);
      }
      
      // Fetch complaints count
      const { count: complaintsTotal, error: complaintsError } = await supabase
        .from("complaints")
        .select("id", { count: "exact" });
      
      if (complaintsError) {
        console.error("Error fetching complaints count:", complaintsError);
      } else {
        setComplaintsCount(complaintsTotal || 0);
      }

      // Fetch status counts for complaints
      const fetchStatusCounts = async () => {
        try {
          // Complaints status counts
          const { data: complaintsStatusData } = await supabase
            .from('complaints')
            .select('status');
          
          const calculateComplaintsCounts = (data: any[]) => {
            return data?.reduce((acc, item) => {
              acc[item.status as 'pending' | 'in_progress' | 'resolved' | 'closed'] = (acc[item.status as 'pending' | 'in_progress' | 'resolved' | 'closed'] || 0) + 1;
              return acc;
            }, { pending: 0, in_progress: 0, resolved: 0, closed: 0 }) || { pending: 0, in_progress: 0, resolved: 0, closed: 0 };
          };
          
          setStatusCounts({
            complaints: calculateComplaintsCounts(complaintsStatusData || [])
          });
        } catch (error) {
          console.error('Error fetching status counts:', error);
        }
      };
      
      await fetchStatusCounts();

      // Use raw SQL query to get counts by role
      const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('role')
        .in('role', ['superadmin', 'rentaladmin', 'eventadmin', 'ecomadmin']);

      if (adminError) {
        console.error("Error fetching admin counts:", adminError);
        // Set default counts if there's an error
        setAdminCounts({
          superadmin: 0,
          rentaladmin: 0,
          eventadmin: 0,
          ecomadmin: 0,
        });
      } else {
        // Process the data to count by role
        const counts: AdminCounts = {
          superadmin: 0,
          rentaladmin: 0,
          eventadmin: 0,
          ecomadmin: 0,
        };
        
        if (adminData) {
          adminData.forEach((user: { role: string }) => {
            if (user.role && counts.hasOwnProperty(user.role)) {
              counts[user.role as keyof AdminCounts]++;
            }
          });
        }
        
        setAdminCounts(counts);
      }
    } catch (error) {
      console.error("Error fetching counts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceBreakdown = async () => {
    const { data, error } = await supabase
      .from("users")  
      .select("service_type, location");

    if (!error && data) {
      const serviceMap: { [key: string]: { [location: string]: number } } = {};

      data.forEach((item) => {
        const type = item.service_type || "Unknown";
        const loc = item.location || "Unknown";
        if (!serviceMap[type]) serviceMap[type] = {};
        serviceMap[type][loc] = (serviceMap[type][loc] || 0) + 1;
      });

      const result = Object.entries(serviceMap).flatMap(([type, locs]) =>
        Object.entries(locs).map(([location, count]) => ({ type, location, count }))
      );

      setServiceData(result);
    }
  };

  // Add function to fetch top complaint users
  const fetchTopComplaintUsers = async () => {
    try {
      // Get date range for the last 7 days
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);

      // Get users with complaints from the last 7 days
      const { data: complaintsData, error: complaintsError } = await supabase
        .from("complaints")
        .select("user_id, created_at")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());
      
      if (complaintsError) {
        console.error("Error fetching complaints user data:", complaintsError);
      }

      // Combine all data
      const userComplaintCounts: Record<string, {
        complaints_count: number;
        user_id: string;
      }> = {};

      // Count complaints by user
      if (complaintsData) {
        complaintsData.forEach(item => {
          if (!item.user_id) return;
          
          if (!userComplaintCounts[item.user_id]) {
            userComplaintCounts[item.user_id] = {
              complaints_count: 0,
              user_id: item.user_id
            };
          }
          
          userComplaintCounts[item.user_id].complaints_count += 1;
        });
      }

      // Get user emails
      const userIds = Object.keys(userComplaintCounts);
      if (userIds.length > 0) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, email, name, role")
          .in('id', userIds);

        if (userError) {
          console.error("Error fetching user data:", userError);
        } else if (userData) {
          // Create a map of user_id to email and name
          const userEmailMap: Record<string, string> = {};
          const userNameMap: Record<string, string> = {};
          const userRoleMap: Record<string, string> = {};
          
          userData.forEach((user: { id: string; email?: string; name?: string; role?: string }) => {
            userEmailMap[user.id] = user.email || 'Unknown';
            
            const name = user.name || '';
            let fullName = 'Unknown';
            
            if (name) {
              fullName = `${name}`.trim();
            }
            
            userNameMap[user.id] = fullName;
            userRoleMap[user.id] = user.role || 'user';
          });

          // Create the final array with user emails, names, and roles
          const topUsers = Object.values(userComplaintCounts)
            .map(user => ({
              ...user,
              user_email: userEmailMap[user.user_id] || 'Unknown',
              user_name: userNameMap[user.user_id] || 'Unknown User',
              role: userRoleMap[user.user_id] || 'user'
            }))
            .sort((a, b) => b.complaints_count - a.complaints_count)
            .slice(0, 5);

          setTopComplaintUsers(topUsers);
        }
      }
    } catch (error) {
      console.error("Error fetching top complaint users:", error);
    }
  };

  const fetchAllComplaintsLast7Days = async () => {
    try {
      // Get date range for the query
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);

      // Initialize the last 7 days with 0 complaints
      const dailyCounts = getLast7Days().reduce((acc, date) => {
        const formattedDate = formatDate(date);
        acc[formattedDate] = { complaints: 0 };
        return acc;
      }, {} as { [key: string]: { complaints: number } });

      // Fetch complaints
      const { data: complaintsData, error: complaintsError } = await supabase
        .from("complaints")
        .select("created_at")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (complaintsError) {
        console.error("Error fetching complaints:", complaintsError);
      } else if (complaintsData) {
        complaintsData.forEach((complaint) => {
          const formattedDate = formatDate(new Date(complaint.created_at));
          if (formattedDate in dailyCounts) {
            dailyCounts[formattedDate].complaints++;
          }
        });
      }

      // Convert to array format for the chart
      const chartData = Object.entries(dailyCounts).map(([date, counts]) => ({
        date,
        complaints: counts.complaints
      }));

      setComplaintsData(chartData);
    } catch (error) {
      console.error("Error processing complaints data:", error);
    }
  };

  // Set up real-time subscription for complaints
  useEffect(() => {
    // Initial fetch
    fetchAllComplaintsLast7Days();

    // Set up real-time subscription
    const complaintsSubscription = supabase
      .channel('complaints_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'complaints' }, 
        () => fetchAllComplaintsLast7Days()
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      complaintsSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchCounts();
    fetchServiceBreakdown();
    fetchTopComplaintUsers();
  }, []);

  // Calculate total admin count and include user count
  const totalAdmins = Object.values(adminCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-3 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Dashboard Overview</h1>
        
        {/* Summary Card */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 sm:p-6 shadow-lg mb-6 sm:mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-medium opacity-90">Total Complaints</h2>
              {loading ? (
                <div className="h-8 w-24 bg-white/20 animate-pulse rounded mt-1"></div>
              ) : (
                <div className="flex flex-col">
                  {/* Top row - Main number and status indicators aligned */}
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl sm:text-3xl font-bold">{totalComplaints.toLocaleString()}</span>
                    
                    <span className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                      <span className="text-sm font-medium">
                        {statusCounts.complaints.pending}
                      </span>
                    </span>
                    
                    <span className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                      <span className="text-sm font-medium">
                        {statusCounts.complaints.in_progress}
                      </span>
                    </span>
                    
                    <span className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                      <span className="text-sm font-medium">
                        {statusCounts.complaints.resolved}
                      </span>
                    </span>
                  </div>
                  
                  {/* Bottom row - Text */}
                  <span className="text-xs sm:text-sm opacity-80 mt-1">total complaints submitted</span>
                </div>
                
              )}
            </div>
            <div className="p-3 sm:p-4 bg-white/10 rounded-lg">
              <BarChart className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
          </div>
          
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-3 sm:gap-4 mt-4 sm:mt-6">
              <div className="bg-white/10 rounded-xl p-3 sm:p-5 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg sm:text-xl font-medium text-gray-300 mb-2">Complaints Breakdown</p>
                    <div className="flex justify-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="flex items-center gap-1 justify-center mb-1">
                          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                          <span className="text-gray-300">Pending</span>
                        </div>
                        <div className="text-xl font-semibold">{statusCounts.complaints.pending}</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 justify-center mb-1">
                          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                          <span className="text-gray-300">In Progress</span>
                        </div>
                        <div className="text-xl font-semibold">{statusCounts.complaints.in_progress}</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 justify-center mb-1">
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                          <span className="text-gray-300">Resolved</span>
                        </div>
                        <div className="text-xl font-semibold">{statusCounts.complaints.resolved}</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 justify-center mb-1">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          <span className="text-gray-300">Closed</span>
                        </div>
                        <div className="text-xl font-semibold">{statusCounts.complaints.closed}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Admin Type Summary */}
        <div className="bg-white rounded-xl shadow-md border mb-6 sm:mb-8">
          <div className="p-4 sm:p-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">User & Admin Distribution</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Total Users: {userCount.toLocaleString()} | Total Admins: {totalAdmins.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {[...Array(4)].map((_, index) => (
                  <div 
                    key={index} 
                    className="border rounded-lg p-4 bg-gray-50 animate-pulse"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4 mt-1"></div>
                      </div>
                      <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                
                <div className="border rounded-lg p-4 bg-gradient-to-br from-amber-50 to-amber-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Super Admins</p>
                      <p className="text-xl sm:text-2xl font-bold text-amber-700">{adminCounts.superadmin}</p>
                      <div className="text-xs opacity-80">
                        {Math.round((adminCounts.superadmin / totalAdmins) * 100) || 0}% of admins
                      </div>
                    </div>
                    <div className="p-2 bg-amber-100 rounded-md">
                      <ShieldCheck className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Full platform access</div>
                </div>
                
                {/* <div className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-emerald-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Rental Admins</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-700">{adminCounts.rentaladmin}</p>
                      <div className="text-xs opacity-80">
                        {Math.round((adminCounts.rentaladmin / totalAdmins) * 100) || 0}% of admins
                      </div>
                    </div>
                    <div className="p-2 bg-green-100 rounded-md">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Rental property & request managers</div>
                </div> */}
                
                {/* <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-violet-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Event Admins</p>
                      <p className="text-xl sm:text-2xl font-bold text-purple-700">{adminCounts.eventadmin}</p>
                      <div className="text-xs opacity-80">
                        {Math.round((adminCounts.eventadmin / totalAdmins) * 100) || 0}% of admins
                      </div>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-md">
                      <Shield className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Event managers</div>
                </div>
                 */}
                {/* <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Buy/Sell Admins</p>
                      <p className="text-xl sm:text-2xl font-bold text-blue-700">{adminCounts.ecomadmin}</p>
                      <div className="text-xs opacity-80">
                        {Math.round((adminCounts.ecomadmin / totalAdmins) * 100) || 0}% of admins
                      </div>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-md">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Buy/Sell managers</div>
                </div> */}

                <div className="border rounded-lg p-4 bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Total Users</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-700">{userCount.toLocaleString()}</p>
                      <div className="text-xs opacity-80">
                        {Math.round((userCount / (userCount + totalComplaints)) * 100) || 0}% of platform
                      </div>
                    </div>
                    <div className="p-2 bg-gray-100 rounded-md">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Registered platform users</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Complaints Analytics Chart */}
          {loading ? (
            <div className="bg-white p-3 sm:p-6 rounded-xl shadow border">
              <div className="flex justify-between items-center mb-3 sm:mb-4 animate-pulse">
                <div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="h-56 sm:h-64 md:h-72 lg:h-80 bg-gray-100 rounded flex items-center justify-center">
                <div className="text-gray-400 animate-pulse">Loading chart...</div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-3 sm:p-6 rounded-xl shadow border">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h4 className="font-semibold text-sm sm:text-base">Complaints Analytics (Last 7 Days)</h4>
                <div className="text-xs text-gray-500">Real-time updates</div>
              </div>
              <div className="h-56 sm:h-64 md:h-72 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={complaintsData}
                    margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      className="ml-10"
                      tick={{ fontSize: 10 }}
                      allowDecimals={false}
                      width={30}
                    />
                    <Tooltip contentStyle={{ fontSize: '12px' }} />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      wrapperStyle={{ fontSize: '12px' }}
                    />

                    {/* Animated Line */}
                    <Line
                      type="monotone"
                      dataKey="complaints"
                      name="Complaints"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                      isAnimationActive={true}
                      animationDuration={8000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {/* Top Complaint Users */}
          {loading ? (
            <div className="bg-white p-3 sm:p-6 rounded-xl shadow border">
              <div className="flex justify-between items-center mb-3 sm:mb-4 animate-pulse">
                <div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
              <div className="space-y-4 max-h-72 sm:max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {[...Array(5)].map((_, index) => (
                  <div 
                    key={index} 
                    className="border-b border-gray-100 pb-3 animate-pulse"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-3 sm:p-6 rounded-xl shadow border">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h4 className="font-semibold text-sm sm:text-base">Top Complaint Users (Last 7 Days)</h4>
                <div className="text-xs text-gray-500">Real-time updates</div>
              </div>
              <div className="space-y-4 max-h-72 sm:max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {topComplaintUsers.length > 0 ? (
                  topComplaintUsers.map((user, index) => (
                    <div key={index} className="border-b border-gray-100 pb-3 hover:bg-gray-50 transition-colors">
                      <Link href={`/vendor/adminpanel/userlist/${user.user_id}`} className="block"> 
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center text-white font-medium shrink-0">
                            {user.user_email?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm sm:text-base text-red-600 truncate">
                                {user.user_name !== 'Unknown User' ? user.user_name : user.user_email}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500 truncate">
                              {user.user_email}
                            </span>
                            <span className="flex items-baseline gap-2">
                              <div className={`w-2 h-2 rounded-full mt-0.5 ${
    user.role === 'superadmin' ? 'bg-amber-500' : 
    user.role === 'rentaladmin' ? 'bg-green-500' : 
    user.role === 'eventadmin' ? 'bg-purple-500' : 
    user.role === 'ecomadmin' ? 'bg-blue-500' : 
    'bg-gray-500'
  }`}></div>
                              <span className="text-xs text-gray-500 truncate whitespace-nowrap">{user.role}</span>
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="text-right mr-2">
                              <span className="text-gray-600 font-semibold text-sm sm:text-base">{user.complaints_count}</span>
                              <span className="text-gray-500 text-xs ml-1 hidden xs:inline">complaints</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-red-600 shrink-0" />
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No complaint data available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}