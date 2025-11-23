import React from "react";
import {
  Users,
  Video,
  Clock,
  TrendingUp,
  Calendar,
  Globe,
  Youtube,
  Award,
  ChevronLeft,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// Generate sample revenue data
const generateRevenueData = () => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentMonth = new Date().getMonth();

  return months.map((month, index) => {
    // Generate realistic-looking data with an upward trend
    const base = 5000 + index * 500;
    const random = Math.random() * 2000 - 1000; // Random fluctuation
    const value = base + random;

    // Add seasonal bump in December and summer months
    const seasonal = index === 11 ? 3000 : index >= 5 && index <= 7 ? 1500 : 0;

    return {
      name: month,
      value: Math.max(500, Math.round(value + seasonal)),
      // Mark current month or use past data
      current: index === currentMonth,
    };
  });
};

// Generate sample subscriber growth data
const generateSubscriberData = (totalSubs: number) => {
  const data = [];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentMonth = new Date().getMonth();

  // Calculate an average monthly growth that would lead to current subscriber count
  // Assuming exponential growth
  const initialValue = totalSubs * 0.3; // Start at 30% of current value
  const growthRate = Math.pow(totalSubs / initialValue, 1 / 12);

  let currentValue = initialValue;
  for (let i = 0; i < 12; i++) {
    const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
    currentValue = currentValue * growthRate * randomFactor;

    data.push({
      name: months[i],
      value: Math.floor(currentValue),
      current: i === currentMonth,
    });
  }

  return data;
};

interface YouTuberDashboardProps {
  youtuber: any;
  onBack: () => void;
}

export default function YouTuberDashboard({
  youtuber,
  onBack,
}: YouTuberDashboardProps) {
  // Parse subscriber count as number for calculations
  const subscriberCount =
    parseInt(youtuber.subscribers.replace(/[KMB]/g, "")) *
    (youtuber.subscribers.includes("K")
      ? 1000
      : youtuber.subscribers.includes("M")
      ? 1000000
      : youtuber.subscribers.includes("B")
      ? 1000000000
      : 1);

  // Generate sample data for charts
  const revenueData = generateRevenueData();
  const subscriberData = generateSubscriberData(subscriberCount);

  // Calculate estimated token price based on subscribers and engagement
  const estimatedTokenPrice = (subscriberCount / 100000).toFixed(2);

  // Calculate estimated ROI
  const estimatedROI = `+${(Math.random() * 15 + 10).toFixed(1)}%`;

  // Calculate market cap potential
  const marketCapPotential = `$${((subscriberCount * 0.05) / 1000000).toFixed(
    1
  )}M`;

  // Parse published date
  const publishedDate = new Date(youtuber.publishedAt);
  const channelAge = Math.floor(
    (new Date().getTime() - publishedDate.getTime()) /
      (1000 * 60 * 60 * 24 * 365)
  );

  return (
    <div className="container mx-auto py-8">
      <button
        onClick={onBack}
        className="mb-6 flex items-center text-primary hover:underline"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Search
      </button>

      {/* Creator Profile Header */}
      <div className="bg-background rounded-lg shadow-lg border p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <img
            src={youtuber.thumbnailUrl || youtuber.avatarUrl}
            alt={youtuber.name}
            className="w-24 h-24 rounded-full mr-6 mb-4 md:mb-0"
          />
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold">{youtuber.name}</h1>
                <p className="text-muted-foreground">{youtuber.category}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <button className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                  Buy Creator Tokens
                </button>
              </div>
            </div>
            <p className="mt-4 text-muted-foreground">
              {youtuber.description?.substring(0, 200)}...
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-background rounded-lg shadow-lg border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-primary/10 text-primary rounded-full mr-4">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-muted-foreground text-sm">Subscribers</h3>
              <p className="text-2xl font-bold">{youtuber.subscribers}</p>
            </div>
          </div>
        </div>

        <div className="bg-background rounded-lg shadow-lg border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-primary/10 text-primary rounded-full mr-4">
              <Video className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-muted-foreground text-sm">Total Views</h3>
              <p className="text-2xl font-bold">{youtuber.views}</p>
            </div>
          </div>
        </div>

        <div className="bg-background rounded-lg shadow-lg border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-primary/10 text-primary rounded-full mr-4">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-muted-foreground text-sm">Avg Watch Time</h3>
              <p className="text-2xl font-bold">{youtuber.avgWatchTime}</p>
            </div>
          </div>
        </div>

        <div className="bg-background rounded-lg shadow-lg border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-primary/10 text-primary rounded-full mr-4">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-muted-foreground text-sm">Annual Growth</h3>
              <p className="text-2xl font-bold text-green-600">
                {youtuber.growthRate}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Token Information */}
      <div className="bg-background rounded-lg shadow-lg border p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Token Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-secondary rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Token Price</h3>
            <p className="text-3xl font-bold text-primary">
              ${estimatedTokenPrice}
            </p>
            <p className="text-sm text-muted-foreground">
              Based on audience size
            </p>
          </div>

          <div className="p-4 bg-secondary rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Expected ROI</h3>
            <p className="text-3xl font-bold text-green-600">{estimatedROI}</p>
            <p className="text-sm text-muted-foreground">30-day projection</p>
          </div>

          <div className="p-4 bg-secondary rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Market Cap Potential</h3>
            <p className="text-3xl font-bold text-primary">
              {marketCapPotential}
            </p>
            <p className="text-sm text-muted-foreground">
              Based on current trends
            </p>
          </div>
        </div>
      </div>

      {/* Channel Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-background rounded-lg shadow-lg border p-6">
          <h2 className="text-xl font-bold mb-4">Channel Information</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-primary mr-3" />
              <div>
                <p className="text-muted-foreground text-sm">Created</p>
                <p className="font-medium">
                  {publishedDate.toLocaleDateString()} ({channelAge} years ago)
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <Youtube className="h-5 w-5 text-primary mr-3" />
              <div>
                <p className="text-muted-foreground text-sm">Video Count</p>
                <p className="font-medium">{youtuber.videoCount || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Globe className="h-5 w-5 text-primary mr-3" />
              <div>
                <p className="text-muted-foreground text-sm">Country</p>
                <p className="font-medium">{youtuber.country || "Unknown"}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Award className="h-5 w-5 text-primary mr-3" />
              <div>
                <p className="text-muted-foreground text-sm">
                  Content Category
                </p>
                <p className="font-medium">{youtuber.category}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Growth chart */}
        <div className="bg-background rounded-lg shadow-lg border p-6">
          <h2 className="text-xl font-bold mb-4">Subscriber Growth</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={subscriberData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [
                    `${new Intl.NumberFormat().format(value)} subscribers`,
                    "Subscribers",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Estimated Revenue Chart */}
      <div className="bg-background rounded-lg shadow-lg border p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">
          Estimated Revenue Performance
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          * Revenue estimates are based on subscriber count, view statistics,
          and industry averages
        </p>
      </div>

      {/* Tokenization Benefits */}
      <div className="bg-secondary rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Creator Token Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-background rounded-lg p-6 shadow-md">
            <h3 className="font-semibold mb-3">For Investors</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Early access to exclusive content</li>
              <li>• Community voting rights</li>
              <li>• Potential appreciation of token value</li>
              <li>• Special merchandise discounts</li>
            </ul>
          </div>

          <div className="bg-background rounded-lg p-6 shadow-md">
            <h3 className="font-semibold mb-3">For Creators</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• New revenue stream</li>
              <li>• More engaged community</li>
              <li>• Sustainable growth funding</li>
              <li>• Creative independence</li>
            </ul>
          </div>

          <div className="bg-background rounded-lg p-6 shadow-md">
            <h3 className="font-semibold mb-3">Get Started</h3>
            <p className="text-muted-foreground mb-4">
              Invest in your favorite creator's future or tokenize your own
              channel to unlock the creator economy.
            </p>
            <div className="flex space-x-3">
              <button className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                Buy Now
              </button>
              <button className="flex-1 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 border border-border">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
