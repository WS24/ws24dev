import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleLoginModal } from "@/components/modals/role-login-modal";
import { 
  Shield, 
  Crown, 
  Briefcase, 
  UserCheck, 
  ArrowRight, 
  Users,
  Workflow,
  DollarSign,
  CheckCircle,
  Star,
  Globe
} from "lucide-react";

export default function RoleDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const platformStats = [
    { label: "Active Projects", value: "250+", icon: <Workflow className="w-5 h-5" /> },
    { label: "Specialists", value: "45+", icon: <Users className="w-5 h-5" /> },
    { label: "Satisfied Clients", value: "180+", icon: <Star className="w-5 h-5" /> },
    { label: "Countries", value: "12+", icon: <Globe className="w-5 h-5" /> },
  ];

  const features = [
    {
      title: "Task Management",
      description: "Comprehensive project tracking with real-time updates",
      icon: <CheckCircle className="w-6 h-6 text-green-600" />
    },
    {
      title: "Secure Payments", 
      description: "Transparent billing with automated specialist payouts",
      icon: <DollarSign className="w-6 h-6 text-blue-600" />
    },
    {
      title: "Expert Network",
      description: "Vetted web development specialists ready for your projects",
      icon: <Shield className="w-6 h-6 text-purple-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">WS24 Dev</h1>
                <p className="text-sm text-gray-600">Web Development Services</p>
              </div>
            </div>
            <Button onClick={() => setIsModalOpen(true)} size="lg">
              <UserCheck className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect. Create. 
            <span className="text-primary"> Complete.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Professional web development services platform connecting clients with expert specialists. 
            Experience transparent project management with secure payments.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={() => setIsModalOpen(true)} 
              size="lg" 
              className="px-8 py-3 text-lg"
            >
              <Shield className="w-5 h-5 mr-2" />
              Explore User Roles
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-3 text-lg"
              onClick={() => window.location.href = "/api/login"}
            >
              Direct Login
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Platform Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {platformStats.map((stat, index) => (
              <Card key={index} className="bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-2 text-primary">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Role Overview Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Three Ways to Use Our Platform
            </h2>
            <p className="text-lg text-gray-600">
              Choose the role that best describes your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Client Role */}
            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer" 
                  onClick={() => setIsModalOpen(true)}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full group-hover:scale-110 transition-transform">
                  <UserCheck className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-green-800">Client</CardTitle>
                <Badge className="bg-green-100 text-green-800 mx-auto">
                  Project Owner
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Need a website, app, or web solution? Post your project and get expert help.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Post project requirements
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Review expert evaluations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Secure payment system
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Specialist Role */}
            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer" 
                  onClick={() => setIsModalOpen(true)}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full group-hover:scale-110 transition-transform">
                  <Briefcase className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-blue-800">Specialist</CardTitle>
                <Badge className="bg-blue-100 text-blue-800 mx-auto">
                  Expert Developer
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Web development expert? Earn by evaluating and completing projects.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    Evaluate project requirements
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    Provide cost estimates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    Earn 50% of project value
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Admin Role */}
            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer" 
                  onClick={() => setIsModalOpen(true)}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full group-hover:scale-110 transition-transform">
                  <Crown className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl text-purple-800">Administrator</CardTitle>
                <Badge className="bg-purple-100 text-purple-800 mx-auto">
                  Platform Manager
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Manage the platform, oversee operations, and ensure quality service.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    Manage user accounts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    Assign tasks to specialists
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    Configure system settings
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Platform Features
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need for successful web development projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {feature.icon}
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 to-purple-600/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join our platform and experience the future of web development collaboration
          </p>
          <Button 
            onClick={() => setIsModalOpen(true)} 
            size="lg" 
            className="px-8 py-3 text-lg"
          >
            <Shield className="w-5 h-5 mr-2" />
            View Role Options
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6" />
                <h3 className="text-lg font-semibold">WS24 Dev</h3>
              </div>
              <p className="text-gray-400">
                Professional web development services platform connecting clients with expert specialists.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Clients</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Post Projects</li>
                <li>Review Estimates</li>
                <li>Track Progress</li>
                <li>Secure Payments</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Specialists</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Find Projects</li>
                <li>Earn Money</li>
                <li>Build Reputation</li>
                <li>Flexible Work</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 WS24 Dev. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Role Login Modal */}
      <RoleLoginModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
